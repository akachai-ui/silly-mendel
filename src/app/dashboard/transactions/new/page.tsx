import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, AlertCircle, CalendarDays } from 'lucide-react'
import TransactionForm from './TransactionForm'
import { getDictionary } from '@/utils/i18n'

export default async function NewTransactionPage({
  searchParams
}: {
  searchParams: Promise<{ staff_id?: string; service?: string; customer?: string; apt_id?: string }>
}) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user?.id).single()
  if (!shop) redirect('/onboarding')

  const dict = await getDictionary()
  const params = await searchParams

  // ดึงข้อมูลพร้อมกัน (Parallel Fetching)
  const today = new Date().toISOString().split('T')[0]
  
  const [
    { data: staffList },
    { data: servicesList },
    { data: pendingAppointments }
  ] = await Promise.all([
    supabase.from('staff').select('*').eq('shop_id', shop.id).eq('is_active', true).order('name'),
    supabase.from('services').select('*').eq('shop_id', shop.id).order('created_at', { ascending: true }),
    supabase.from('appointments').select('id, customer_name, appointment_time, service_name, staff_id').eq('shop_id', shop.id).eq('status', 'pending').gte('appointment_date', today).order('appointment_date').order('appointment_time')
  ])

  // ข้อมูล pre-fill จาก Appointment
  const preselect = params.staff_id ? {
    staffId: params.staff_id,
    serviceName: params.service || '',
    customerName: params.customer || '',
    aptId: params.apt_id || ''
  } : null

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-32 sm:pb-0 px-4 sm:px-0">
      
      <div className="flex items-center space-x-3 pt-2">
        <Link href="/dashboard/appointments" className="p-2 -ml-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">{dict.transaction.title}</h1>
          <p className="text-sm text-zinc-400">{dict.transaction.subtitle}</p>
        </div>
      </div>

      {/* Banner บอกว่ามาจากคิว */}
      {preselect && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-indigo-900">เปิดบิลจากคิว: {preselect.customerName}</p>
            <p className="text-xs text-indigo-600">ข้อมูลถูก pre-fill ให้แล้ว ตรวจสอบและยืนยันได้เลย</p>
          </div>
        </div>
      )}

      {/* ถ้ายังไม่มีช่างในระบบ ให้บังคับไปเพิ่มช่างก่อน */}
      {!staffList || staffList.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 sm:p-8 text-center mt-8">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-900">{dict.transaction.no_staff_warning}</h2>
          <p className="text-yellow-700 mt-2 mb-6">{dict.transaction.no_staff_desc}</p>
          <Link href="/dashboard/staff" className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-zinc-900 font-bold rounded-xl hover:bg-yellow-700 transition-colors shadow-sm active:scale-95">
            {dict.transaction.go_add_staff}
          </Link>
        </div>
      ) : (
        <TransactionForm 
          staffList={staffList} 
          servicesList={servicesList || []} 
          pendingAppointments={pendingAppointments || []}
          dict={dict.transaction}
          preselect={preselect}
        />
      )}

    </div>
  )
}


