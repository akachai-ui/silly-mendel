'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addService(formData: FormData) {
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  if (!name || !price) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()

  const { error } = await supabase.from('services').insert([{ 
    name, 
    price: parseFloat(price),
    shop_id: shop?.id
  }])
  if (error) return { error: 'เพิ่มบริการไม่สำเร็จ' }
  
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateService(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  if (!name || !price) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  const supabase = await createClient()
  const { error } = await supabase.from('services').update({ name, price: parseFloat(price) }).eq('id', id)
  if (error) return { error: 'แก้ไขบริการไม่สำเร็จ' }
  
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: 'ลบบริการไม่สำเร็จ' }
  
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
