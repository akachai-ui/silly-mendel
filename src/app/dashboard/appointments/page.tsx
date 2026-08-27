import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar as CalendarIcon, Plus, ChevronLeft } from 'lucide-react'
import AppointmentList from './AppointmentList'
import { getDictionary } from '@/utils/i18n'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) redirect('/onboarding')

  const dict = await getDictionary()

  // ดึงข้อมูลพร้อมกัน (Parallel Fetching)
  const today = new Date().toISOString().split('T')[0]
  const [
    { data: staffList },
    { data: servicesList },
    { data: appointments }
  ] = await Promise.all([
    supabase.from('staff').select('*').eq('shop_id', shop.id).eq('is_active', true),
    supabase.from('services').select('*').eq('shop_id', shop.id),
    supabase.from('appointments').select('*, staff(name, image_url)').eq('shop_id', shop.id).gte('appointment_date', today).order('appointment_date').order('appointment_time')
  ])

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{dict.appointments.title}</h1>
          <p className="text-sm text-zinc-400">{dict.appointments.subtitle}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 text-zinc-600 p-3 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900">{dict.appointments.title}</h2>
            <p className="text-xs text-zinc-400">{dict.appointments.subtitle}</p>
          </div>
        </div>
        <Link href="/dashboard/appointments/new" className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-zinc-800 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> {dict.appointments.new_appointment}
        </Link>
      </div>

      <AppointmentList 
        appointments={appointments || []} 
        staffList={staffList || []} 
        servicesList={servicesList || []}
        dict={dict.appointments}
      />
    </div>
  )
}

