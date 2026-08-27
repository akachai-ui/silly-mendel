import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, TrendingUp, Users, Receipt, Wallet, PiggyBank, Printer } from 'lucide-react'
import DateFilterTabs from './DateFilterTabs'
import { getDictionary } from '@/utils/i18n'

export default async function SummaryPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string }> }) {
  // ... rest of imports are matched implicitly ... //

  const { period = 'month', start = '', end = '' } = await searchParams;

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) redirect('/onboarding')

  const dict = await getDictionary()

  // สร้าง Query ดึงข้อมูลบิล
  let query = supabase
    .from('transactions')
    .select('amount, created_at, staff_id, payment_method')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  // สร้าง Query ดึงข้อมูลรายจ่าย
  let expenseQuery = supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('shop_id', shop.id)

  // จัดการตัวกรองวันที่
  const now = new Date()
  if (period === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    query = query.gte('created_at', today.toISOString())
    expenseQuery = expenseQuery.gte('expense_date', today.toISOString().split('T')[0])
  } else if (period === 'week') {
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
    firstDay.setHours(0, 0, 0, 0)
    query = query.gte('created_at', firstDay.toISOString())
    expenseQuery = expenseQuery.gte('expense_date', firstDay.toISOString().split('T')[0])
  } else if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    query = query.gte('created_at', firstDay.toISOString())
    expenseQuery = expenseQuery.gte('expense_date', firstDay.toISOString().split('T')[0])
  } else if (period === 'range') {
    if (start) {
      const targetStart = new Date(start)
      query = query.gte('created_at', targetStart.toISOString())
      expenseQuery = expenseQuery.gte('expense_date', start)
    }
    if (end) {
      const targetEnd = new Date(end)
      // เผื่อเวลาให้ครอบคลุมถึง 23:59:59 ของวันสิ้นสุด
      targetEnd.setDate(targetEnd.getDate() + 1)
      query = query.lt('created_at', targetEnd.toISOString())
      expenseQuery = expenseQuery.lte('expense_date', end)
    }
  }

  // ดึงข้อมูลบิล ช่าง และรายจ่ายพร้อมกัน (Parallel Fetching)
  const [
    { data: transactions },
    { data: staffList },
    { data: expensesList }
  ] = await Promise.all([
    query,
    supabase.from('staff').select('id, name, wage_type, wage_amount, commission_percent').eq('shop_id', shop.id),
    expenseQuery
  ])

  const txs = transactions || []
  const totalRevenue = txs.reduce((sum, tx) => sum + tx.amount, 0)
  const totalCash = txs.filter(tx => tx.payment_method === 'cash').reduce((sum, tx) => sum + tx.amount, 0)
  const totalTransfer = txs.filter(tx => tx.payment_method === 'transfer').reduce((sum, tx) => sum + tx.amount, 0)
  const totalBills = txs.length

  const exps = expensesList || []
  const totalExpense = exps.reduce((sum, exp) => sum + Number(exp.amount), 0)

  // สรุปยอดแยกตามช่าง และคำนวณค่าแรง
  const staffStats = (staffList || []).map(staff => {
    const staffTxs = txs.filter(tx => tx.staff_id === staff.id)
    const revenue = staffTxs.reduce((sum, tx) => sum + tx.amount, 0)
    
    let wage = 0
    let wageLabel = ''

    if (staff.wage_type === 'percent') {
      wage = revenue * ((staff.commission_percent || 0) / 100)
      wageLabel = `(${dict.summary.percent_share || 'แบ่ง'} ${staff.commission_percent || 0}%)`
    } else if (staff.wage_type === 'daily') {
      const uniqueDays = new Set(staffTxs.map(tx => tx.created_at.split('T')[0])).size
      wage = (staff.wage_amount || 0) * uniqueDays
      wageLabel = `(${dict.summary.per_day || 'วันละ'} ${staff.wage_amount} x ${uniqueDays} ${dict.summary.days || 'วัน'})`
    } else if (staff.wage_type === 'monthly') {
      wage = staff.wage_amount || 0
      wageLabel = `(${dict.summary.monthly || 'รายเดือน'})`
    } else if (staff.wage_type === 'weekly') {
      wage = staff.wage_amount || 0
      wageLabel = `(${dict.summary.weekly || 'รายสัปดาห์'})`
    }

    return { id: staff.id, name: staff.name, revenue, bills: staffTxs.length, wage, wageLabel }
  }).sort((a, b) => b.revenue - a.revenue)

  // คำนวณรายจ่ายรวม และ กำไรเบื้องต้น
  const totalWage = staffStats.reduce((sum, stat) => sum + stat.wage, 0)
  const grossProfit = totalRevenue - totalWage
  const netProfit = grossProfit - totalExpense

  // สร้าง Label ให้เข้าใจง่ายขึ้น
  let periodLabel = dict.summary.all_time || 'ทั้งหมด (All Time)'
  if (period === 'today') periodLabel = dict.summary.today || 'วันนี้'
  else if (period === 'week') periodLabel = dict.summary.this_week || 'สัปดาห์นี้'
  else if (period === 'month') periodLabel = dict.summary.this_month || 'เดือนนี้'
  else if (period === 'range') {
    if (start && end) {
      periodLabel = `${new Date(start).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } else if (start) {
      periodLabel = `${dict.summary.since || 'ตั้งแต่'} ${new Date(start).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } else if (end) {
      periodLabel = `${dict.summary.until || 'จนถึง'} ${new Date(end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{dict.summary.title}</h1>
          <p className="text-sm text-zinc-400">{dict.summary.subtitle} {periodLabel}</p>
        </div>
      </div>

      {/* Tabs และระบบเลือกวันที่แบบ Client Component */}
      <DateFilterTabs dict={dict.summary} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* รายรับรวม */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-3 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{dict.summary.total_revenue || 'ยอดรับรวม'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900">฿{totalRevenue.toLocaleString()}</p>
            <div className="flex gap-2 mt-2">
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{dict.summary.cash || 'สด'}: ฿{totalCash.toLocaleString()}</span>
              <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{dict.summary.transfer || 'โอน'}: ฿{totalTransfer.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* กำไรเบื้องต้น */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-200 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{dict.summary.gross_profit || 'กำไรเบื้องต้น'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900">฿{grossProfit.toLocaleString()}</p>
          </div>
        </div>

        {/* กำไรสุทธิ */}
        <div className="bg-emerald-50 p-4 rounded-3xl shadow-sm border border-emerald-200 flex flex-col justify-between sm:col-span-1 col-span-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">{dict.summary.net_profit || 'กำไรสุทธิ (หักทุกอย่าง)'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">฿{netProfit.toLocaleString()}</p>
          </div>
        </div>

        {/* ค่าแรงช่าง */}
        <div className="bg-red-50 p-4 rounded-3xl shadow-sm border border-red-200 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-red-700 uppercase tracking-wider mb-0.5">{dict.summary.total_wage || 'รายจ่ายค่าแรง'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-red-700">฿{totalWage.toLocaleString()}</p>
          </div>
        </div>

        {/* ค่าใช้จ่ายอื่นๆ */}
        <div className="bg-orange-50 p-4 rounded-3xl shadow-sm border border-orange-200 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-orange-700 uppercase tracking-wider mb-0.5">{dict.summary.total_expense || 'ค่าใช้จ่ายจิปาถะ'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-orange-700">฿{totalExpense.toLocaleString()}</p>
          </div>
        </div>

        {/* จำนวนบิล */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-200 flex flex-col justify-between hidden sm:flex">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{dict.summary.total_bills || 'จำนวนบิลทั้งหมด'}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900">{totalBills} <span className="text-sm font-medium text-zinc-400">{dict.summary.items || 'รายการ'}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-1 sm:p-2 mt-4">
        <div className="px-4 py-4 border-b border-zinc-200 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-zinc-900">{dict.summary.wage_breakdown || 'แจกแจงรายจ่ายค่าแรง (ต้องจ่ายใคร เท่าไหร่)'}</h2>
        </div>
        <div className="divide-y divide-zinc-50">
          {staffStats.length === 0 ? (
            <p className="p-8 text-center text-zinc-400 text-sm">{dict.summary.no_data || 'ยังไม่มีข้อมูลช่างหรือรายการใน'} {periodLabel}</p>
          ) : (
            staffStats.map((stat, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50 transition-colors gap-3">
                <div className="flex-1">
                  <p className="font-bold text-zinc-900 text-base">{stat.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">{dict.summary.sales_generated || 'ทำยอดขายให้ร้าน:'} <span className="font-medium text-zinc-600">฿{stat.revenue.toLocaleString()}</span> ({stat.bills} {dict.summary.bills || 'บิล'})</p>
                </div>
                <div className="flex flex-col sm:items-end bg-red-950/5 p-3 sm:p-0 rounded-xl gap-2">
                  <div className="sm:text-right">
                    <p className="text-[11px] text-zinc-400 font-medium mb-0.5">{dict.summary.to_pay || 'ยอดที่ต้องจ่าย'} {stat.wageLabel}</p>
                    <p className="font-extrabold text-red-700 text-lg">฿{stat.wage.toLocaleString()}</p>
                  </div>
                  <Link 
                    href={`/dashboard/summary/slip?staff_id=${stat.id}&period=${period}&start=${start}&end=${end}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-end"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    พิมพ์สลิปเงินเดือน
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
