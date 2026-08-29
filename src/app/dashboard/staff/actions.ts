'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStaff(formData: FormData) {
  const name = formData.get('name') as string
  const wageType = formData.get('wage_type') as string
  const wageAmount = formData.get('wage_amount') as string
  const commissionPercent = formData.get('commission_percent') as string
  const startDate = formData.get('start_date') as string
  const note = formData.get('note') as string
  const imageFile = formData.get('image') as File | null

  if (!name || name.trim() === '') return { error: 'กรุณากรอกชื่อช่าง' }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()

  let imageUrl = null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('staff_photos').upload(fileName, imageFile)
    if (uploadError) return { error: 'อัปโหลดรูปภาพไม่สำเร็จ' }
    
    const { data } = supabase.storage.from('staff_photos').getPublicUrl(fileName)
    imageUrl = data.publicUrl
  }

  const { error } = await supabase.from('staff').insert([{ 
    name: name.trim(),
    wage_type: wageType || 'percent',
    wage_amount: wageAmount ? parseFloat(wageAmount) : 0,
    commission_percent: commissionPercent ? parseFloat(commissionPercent) : 0,
    start_date: startDate || new Date().toISOString().split('T')[0],
    note: note || null,
    image_url: imageUrl,
    is_active: true,
    shop_id: shop?.id
  }])

  if (error) return { error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' }
  
  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteStaff(id: string, imageUrl: string | null) {
  const supabase = await createClient()
  
  if (imageUrl) {
    const fileName = imageUrl.split('/').pop()
    if (fileName) await supabase.storage.from('staff_photos').remove([fileName])
  }

  const { error } = await supabase.from('staff').delete().eq('id', id)
  
  if (error) return { error: 'ไม่สามารถลบข้อมูลได้' }
  
  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateStaff(id: string, formData: FormData, oldImageUrl: string | null) {
  const name = formData.get('name') as string
  const wageType = formData.get('wage_type') as string
  const wageAmount = formData.get('wage_amount') as string
  const commissionPercent = formData.get('commission_percent') as string
  const startDate = formData.get('start_date') as string
  const note = formData.get('note') as string
  const imageFile = formData.get('image') as File | null

  if (!name || name.trim() === '') return { error: 'กรุณากรอกชื่อช่าง' }

  const supabase = await createClient()
  let newImageUrl = oldImageUrl

  if (imageFile && imageFile.size > 0) {
    if (oldImageUrl) {
      const oldFileName = oldImageUrl.split('/').pop()
      if (oldFileName) await supabase.storage.from('staff_photos').remove([oldFileName])
    }

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('staff_photos').upload(fileName, imageFile)
    if (!uploadError) {
      const { data } = supabase.storage.from('staff_photos').getPublicUrl(fileName)
      newImageUrl = data.publicUrl
    }
  }

  const { error } = await supabase.from('staff').update({ 
    name: name.trim(),
    wage_type: wageType || 'percent',
    wage_amount: wageAmount ? parseFloat(wageAmount) : 0,
    commission_percent: commissionPercent ? parseFloat(commissionPercent) : 0,
    start_date: startDate || new Date().toISOString().split('T')[0],
    note: note || null,
    image_url: newImageUrl,
  }).eq('id', id)

  if (error) {
    console.error('Error updating staff:', error)
    return { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
  }
  
  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
