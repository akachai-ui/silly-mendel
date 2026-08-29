'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createShop(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) redirect('/onboarding?message=กรุณากรอกชื่อร้าน')

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) redirect('/login')

  const { error } = await supabase.from('shops').insert([
    { name, owner_id: user.id }
  ])

  if (error) {
    console.error('Error creating shop:', error)
    redirect('/onboarding?message=ไม่สามารถสร้างร้านได้ กรุณาลองใหม่')
  }

  redirect('/dashboard')
}
