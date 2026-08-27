import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintTrigger from './PrintTrigger'

export default async function SlipPage({ searchParams }: { searchParams: Promise<{ staff_id?: string, period?: string, start?: string, end?: string }> }) {
  const { staff_id, period = 'month', start = '', end = '' } = await searchParams;
  if (!staff_id) redirect('/dashboard/summary')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('name, logo_url').eq('owner_id', user.id).single()
  const { data: staff } = await supabase.from('staff').select('*').eq('id', staff_id).single()
  
  if (!shop || !staff) redirect('/dashboard/summary')

  // สร้าง Query ดึงข้อมูลบิลของช่างคนนี้ในช่วงเวลาที่เลือก
  let query = supabase
    .from('transactions')
    .select('amount, created_at, service_name')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: true })

  const now = new Date()
  if (period === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    query = query.gte('created_at', today.toISOString())
  } else if (period === 'week') {
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
    firstDay.setHours(0, 0, 0, 0)
    query = query.gte('created_at', firstDay.toISOString())
  } else if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    query = query.gte('created_at', firstDay.toISOString())
  } else if (period === 'range') {
    if (start) query = query.gte('created_at', new Date(start).toISOString())
    if (end) {
      const targetEnd = new Date(end)
      targetEnd.setDate(targetEnd.getDate() + 1)
      query = query.lt('created_at', targetEnd.toISOString())
    }
  }

  const { data: transactions } = await query
  const txs = transactions || []
  
  // คำนวณรายได้และค่าแรง
  const revenue = txs.reduce((sum, tx) => sum + tx.amount, 0)
  
  let wage = 0
  let wageLabel = ''

  if (staff.wage_type === 'percent') {
    wage = revenue * ((staff.commission_percent || 0) / 100)
    wageLabel = `ส่วนแบ่ง ${staff.commission_percent || 0}%`
  } else if (staff.wage_type === 'daily') {
    const uniqueDays = new Set(txs.map(tx => tx.created_at.split('T')[0])).size
    wage = (staff.wage_amount || 0) * uniqueDays
    wageLabel = `รายวัน ${staff.wage_amount} x ${uniqueDays} วัน`
  } else if (staff.wage_type === 'monthly') {
    wage = staff.wage_amount || 0
    wageLabel = `รายเดือน`
  } else if (staff.wage_type === 'weekly') {
    wage = staff.wage_amount || 0
    wageLabel = `รายสัปดาห์`
  }

  const todayDate = new Date()
  let periodLabel = `ยอดรวมตั้งแต่เริ่มต้น - ปัจจุบัน`
  
  if (period === 'today') {
    periodLabel = `วันที่ ${todayDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  else if (period === 'week') {
    const firstDay = new Date(todayDate)
    firstDay.setDate(todayDate.getDate() - todayDate.getDay())
    const lastDay = new Date(firstDay)
    lastDay.setDate(firstDay.getDate() + 6)
    periodLabel = `${firstDay.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${lastDay.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  else if (period === 'month') {
    periodLabel = `เดือน ${todayDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`
  }
  else if (period === 'range') {
    if (start && end) periodLabel = `${new Date(start).toLocaleDateString('th-TH')} - ${new Date(end).toLocaleDateString('th-TH')}`
    else if (start) periodLabel = `ตั้งแต่ ${new Date(start).toLocaleDateString('th-TH')}`
    else if (end) periodLabel = `จนถึง ${new Date(end).toLocaleDateString('th-TH')}`
  }

  const printDate = new Date().toLocaleString('th-TH')

  return (
    <div className="bg-gray-100 min-h-screen text-black flex justify-center p-4 sm:p-8 print:bg-white print:min-h-0 print:block print:p-0">
      <PrintTrigger />
      <div className="w-full max-w-[210mm] bg-white p-8 sm:p-12 shadow-xl border border-gray-200 font-sans text-sm pb-16 print:shadow-none print:border-none print:p-8 print:m-0 print:max-w-none">
        
        {/* Header: Logo and Title */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-zinc-800 pb-6 mb-6 gap-4">
          <div className="flex items-center gap-4">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt="Shop Logo" className="w-16 h-16 object-cover rounded-xl" />
            ) : (
              <div className="w-16 h-16 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl">
                {shop.name.substring(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900">{shop.name}</h1>
              <p className="text-gray-500 text-sm">เอกสารสรุปยอดค่าแรงช่าง</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <h2 className="text-xl font-bold tracking-widest text-zinc-800">PAYSLIP</h2>
            <p className="text-xs text-gray-500 mt-1">วันที่พิมพ์: {printDate}</p>
          </div>
        </div>

        {/* Staff & Period Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">ชื่อพนักงาน (Employee Name)</p>
            <p className="font-bold text-lg">{staff.name}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 mb-1">รอบบิล (Pay Period)</p>
            <p className="font-bold text-lg text-blue-700">{periodLabel}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">รูปแบบค่าแรง (Wage Type)</p>
            <p className="font-semibold">{wageLabel}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 mb-1">จำนวนบิลที่ให้บริการ (Total Bills)</p>
            <p className="font-semibold">{txs.length} รายการ</p>
          </div>
        </div>

        {/* Payslip Body: Earnings & Deductions */}
        <div className="border border-zinc-300 rounded-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-zinc-100 border-b border-zinc-300 font-bold text-zinc-800 text-sm">
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-zinc-300">รายได้ (Earnings)</div>
            <div className="p-3 hidden sm:block">รายการหัก (Deductions)</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 min-h-0 sm:min-h-[120px]">
            {/* Earnings Column */}
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-zinc-300 space-y-3">
              {staff.wage_type === 'percent' && (
                <div className="flex justify-between gap-4">
                  <span>ส่วนแบ่งยอดขาย (Commission {staff.commission_percent}%)</span>
                  <span className="font-semibold text-zinc-900">{wage.toLocaleString()}</span>
                </div>
              )}
              {staff.wage_type === 'daily' && (
                <div className="flex justify-between gap-4">
                  <span>ค่าแรงรายวัน (Daily Wage)</span>
                  <span className="font-semibold text-zinc-900">{wage.toLocaleString()}</span>
                </div>
              )}
              {(staff.wage_type === 'monthly' || staff.wage_type === 'weekly') && (
                <div className="flex justify-between gap-4">
                  <span>เงินเดือน (Base Salary)</span>
                  <span className="font-semibold text-zinc-900">{wage.toLocaleString()}</span>
                </div>
              )}
              {/* Optional: Show Total Revenue as a note if it's commission based */}
              {staff.wage_type === 'percent' && (
                <div className="text-xs text-zinc-400 mt-2">
                  *จากยอดขายรวมทั้งหมด ฿{revenue.toLocaleString()}
                </div>
              )}
            </div>
            
            {/* Deductions Header for Mobile */}
            <div className="p-3 bg-zinc-100 font-bold text-zinc-800 text-sm border-b border-zinc-300 block sm:hidden">
              รายการหัก (Deductions)
            </div>

            {/* Deductions Column */}
            <div className="p-4 space-y-3 text-zinc-400">
              <div className="flex justify-between">
                <span>-</span>
                <span>-</span>
              </div>
            </div>
          </div>
          
          {/* Totals Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-zinc-50 border-t border-zinc-300 font-bold">
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-zinc-300 flex justify-between">
              <span>รวมรายได้ (Total Earnings)</span>
              <span className="text-blue-700">฿{wage.toLocaleString()}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span>รวมรายการหัก (Total Deductions)</span>
              <span className="text-red-600">฿0</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="flex justify-end mb-16">
          <div className="bg-zinc-900 text-white rounded-xl p-6 shadow-lg min-w-[280px]">
            <p className="text-xs text-zinc-300 mb-2">ยอดเงินสุทธิที่ต้องชำระ (Net Pay)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl text-zinc-400">฿</span>
              <p className="text-4xl font-extrabold tracking-tight">{wage.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer: Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="border-b border-gray-400 mx-8 pb-8"></p>
            <p className="mt-2 text-sm font-bold text-gray-700">ผู้จ่ายเงิน (Employer)</p>
            <p className="text-xs text-gray-400 mt-1">วันที่ _______/_______/_______</p>
          </div>
          <div className="text-center">
            <p className="border-b border-gray-400 mx-8 pb-8"></p>
            <p className="mt-2 text-sm font-bold text-gray-700">ผู้รับเงิน (Employee)</p>
            <p className="text-xs text-gray-400 mt-1">วันที่ _______/_______/_______</p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
