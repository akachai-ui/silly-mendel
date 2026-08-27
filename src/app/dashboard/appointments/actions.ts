'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAppointment(formData: FormData) {
  const staffId = formData.get('staff_id') as string
  const customerName = formData.get('customer_name') as string
  const customerPhone = formData.get('customer_phone') as string
  const appointmentDate = formData.get('appointment_date') as string
  const appointmentTime = formData.get('appointment_time') as string
  const serviceName = formData.get('service_name') as string

  if (!staffId || !customerName || !appointmentDate || !appointmentTime) {
    return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()

  const { error } = await supabase.from('appointments').insert([{
    shop_id: shop?.id,
    staff_id: staffId,
    customer_name: customerName,
    customer_phone: customerPhone || null,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    service_name: serviceName || null,
    status: 'pending'
  }])

  if (error) return { error: error.message }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateAppointmentDetails(id: string, formData: FormData) {
  const customerName = formData.get('customer_name') as string
  const customerPhone = formData.get('customer_phone') as string
  const appointmentDate = formData.get('appointment_date') as string
  const appointmentTime = formData.get('appointment_time') as string
  const serviceName = formData.get('service_name') as string
  const staffId = formData.get('staff_id') as string

  if (!customerName || !appointmentDate || !appointmentTime || !staffId) {
    return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('appointments').update({
    customer_name: customerName,
    customer_phone: customerPhone || null,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    service_name: serviceName || null,
    staff_id: staffId
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
