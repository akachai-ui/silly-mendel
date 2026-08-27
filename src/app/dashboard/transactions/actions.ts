'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const amount = formData.get('amount') as string
  const serviceName = formData.get('service_name') as string
  const staffId = formData.get('staff_id') as string
  const paymentMethod = formData.get('payment_method') as string || 'cash'
  const appointmentId = formData.get('appointment_id') as string

  if (!amount || !staffId) {
    return { error: 'กรุณากรอกจำนวนเงินและเลือกช่าง' }
  }

  const supabase = await createClient()

  // 1. ดึง shop_id ของ user ปัจจุบัน
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) return { error: 'Shop not found' }

  // 2. บันทึก transaction
  const { error: txError } = await supabase.from('transactions').insert([
    {
      shop_id: shop.id,
      staff_id: staffId,
      amount: parseFloat(amount),
      service_name: serviceName || null,
      payment_method: paymentMethod
    }
  ])

  if (txError) return { error: txError.message }

  // 3. ถ้าดึงมาจากคิวที่จองไว้ ให้อัปเดตสถานะคิวนั้นเป็น completed ด้วย
  if (appointmentId) {
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId)
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateTransaction(id: string, amount: number, staffId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').update({ 
    amount, 
    staff_id: staffId 
  }).eq('id', id)
  
  if (error) return { error: 'อัปเดตข้อมูลไม่สำเร็จ' }
  
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  
  if (error) return { error: 'ลบข้อมูลไม่สำเร็จ' }
  
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
