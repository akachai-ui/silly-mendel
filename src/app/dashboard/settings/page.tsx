import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'
import { getDictionary } from '@/utils/i18n'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).single()
  if (!shop) {
    redirect('/onboarding')
  }

  const dict = await getDictionary()

  return <SettingsForm initialShop={shop} dict={dict.settings} />
}
