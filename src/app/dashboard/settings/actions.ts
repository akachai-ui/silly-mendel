'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopProfile(shopId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const imageFile = formData.get('image') as File | null

  if (!name) return { error: 'กรุณากรอกชื่อร้าน' }

  let logo_url = formData.get('existing_logo_url') as string

  // อัปโหลดโลโก้ใหม่ (ถ้ามีการเลือกไฟล์)
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${shopId}-${Math.random()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('shop_logos')
      .upload(fileName, imageFile, { upsert: true })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadError.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from('shop_logos')
      .getPublicUrl(fileName)

    logo_url = publicUrlData.publicUrl
  }

  // สร้าง slug (URL-friendly name) จากชื่อร้านคร่าวๆ
  // ในอนาคตสามารถให้ลูกค้าแก้ slug เองได้
  const slug = name.toLowerCase().replace(/[^a-z0-9ก-๙]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + shopId.substring(0,4)

  const { error } = await supabase
    .from('shops')
    .update({ 
      name, 
      phone, 
      address, 
      logo_url,
      slug
    })
    .eq('id', shopId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('Update Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function removeLogo(shopId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('shops')
    .update({ logo_url: null })
    .eq('id', shopId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/settings')
  return { success: true }
}
