import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AppointmentForm from './AppointmentForm'
import { getDictionary } from '@/utils/i18n'

export default async function NewAppointmentPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) redirect('/onboarding')

  const dict = await getDictionary()

  const { data: staffList } = await supabase.from('staff').select('*').eq('shop_id', shop.id).eq('is_active', true)
  const { data: servicesList } = await supabase.from('services').select('*').eq('shop_id', shop.id)

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/appointments" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">{dict.appointments.add_title}</h1>
          <p className="text-sm text-zinc-400">{dict.appointments.add_subtitle}</p>
        </div>
      </div>
      <AppointmentForm staffList={staffList || []} servicesList={servicesList || []} dict={dict.appointments} />
    </div>
  )
}
