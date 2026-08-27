'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadSlipAction(formData: FormData) {
  const shopId = formData.get('shop_id') as string
  const amount = formData.get('amount') as string
  const planTier = formData.get('plan_tier') as string
  const months = formData.get('months') as string
  const file = formData.get('slip_file') as File

  if (!shopId || !amount || !planTier || !months || !file || file.size === 0) {
    return { error: 'กรุณากรอกข้อมูลและแนบสลิปให้ครบถ้วน' }
  }

  const supabase = await createClient()

  // 1. ตรวจสอบสิทธิ์
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: shop } = await supabase.from('shops').select('id').eq('id', shopId).eq('owner_id', user.id).single()
  if (!shop) return { error: 'Shop not found or unauthorized' }

  // 2. อัปโหลดไฟล์สลิปไปที่ Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${shopId}_${Date.now()}.${fileExt}`
  
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from('slips')
    .upload(fileName, file)

  if (uploadError) {
    return { error: 'อัปโหลดรูปภาพไม่สำเร็จ: ' + uploadError.message }
  }

  // ดึง Public URL
  const { data: { publicUrl } } = supabase.storage.from('slips').getPublicUrl(fileName)

  // 3. บันทึกข้อมูลลงตาราง payment_slips
  const { error: insertError } = await supabase.from('payment_slips').insert({
    shop_id: shopId,
    amount: parseFloat(amount),
    plan_tier: planTier,
    months: parseInt(months),
    slip_url: publicUrl,
    status: 'pending'
  })

  if (insertError) {
    return { error: 'บันทึกข้อมูลแจ้งโอนไม่สำเร็จ: ' + insertError.message }
  }

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}
