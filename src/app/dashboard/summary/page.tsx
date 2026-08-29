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
    <div className="space-y-5 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{dict.summary.title}</h1>
          <p className="text-sm text-zinc-400">{periodLabel}</p>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilterTabs dict={dict.summary} />

      {/* ─── Net Profit Hero ─── */}
      <div className={`rounded-3xl p-6 sm:p-8 ${netProfit >= 0 ? 'bg-zinc-900' : 'bg-red-950'} shadow-xl relative overflow-hidden`}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 relative z-10">
          {dict.summary.net_profit || 'กำไรสุทธิ (หักทุกอย่าง)'}
        </p>
        <p className={`text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10 ${netProfit >= 0 ? 'text-white' : 'text-red-300'}`}>
          ฿{netProfit.toLocaleString()}
        </p>
        <p className="text-zinc-600 text-xs mt-2 relative z-10">{periodLabel}</p>
      </div>

      {/* ─── รายรับ ─── */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-3">รายรับ</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-100">{dict.summary.cash || 'สด'} ฿{totalCash.toLocaleString()}</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-full font-bold border border-blue-100">{dict.summary.transfer || 'โอน'} ฿{totalTransfer.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{dict.summary.total_revenue || 'ยอดรับรวม'}</p>
            <p className="text-3xl font-extrabold text-zinc-900">฿{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-3">
              <PiggyBank className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{dict.summary.gross_profit || 'กำไรเบื้องต้น'}</p>
            <p className="text-xl font-extrabold text-zinc-900">฿{grossProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center mb-3">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{dict.summary.total_bills || 'จำนวนบิล'}</p>
            <p className="text-xl font-extrabold text-zinc-900">{totalBills} <span className="text-sm font-medium text-zinc-400">{dict.summary.items || 'รายการ'}</span></p>
          </div>
        </div>
      </div>

      {/* ─── รายจ่าย ─── */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-3">รายจ่าย</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-red-100 rounded-3xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{dict.summary.total_wage || 'ค่าแรงช่าง'}</p>
            <p className="text-xl font-extrabold text-red-600">฿{totalWage.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-orange-100 rounded-3xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{dict.summary.total_expense || 'ค่าใช้จ่ายอื่น'}</p>
            <p className="text-xl font-extrabold text-orange-600">฿{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ─── Wage Breakdown ─── */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <h2 className="font-bold text-zinc-900 text-base">{dict.summary.wage_breakdown || 'แจกแจงค่าแรงช่าง'}</h2>
        </div>
        <div className="divide-y divide-zinc-50">
          {staffStats.length === 0 ? (
            <p className="p-8 text-center text-zinc-400 text-sm">{dict.summary.no_data || 'ยังไม่มีข้อมูลใน'} {periodLabel}</p>
          ) : (
            staffStats.map((stat, i) => (
              <div key={i} className="p-4 sm:px-6 hover:bg-zinc-50/80 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-zinc-900">{stat.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {dict.summary.sales_generated || 'ยอดขาย'}: <span className="font-semibold text-zinc-600">฿{stat.revenue.toLocaleString()}</span> ({stat.bills} {dict.summary.bills || 'บิล'})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 mb-0.5">{stat.wageLabel}</p>
                    <p className="font-extrabold text-red-600 text-lg">฿{stat.wage.toLocaleString()}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/summary/slip?staff_id=${stat.id}&period=${period}&start=${start}&end=${end}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์สลิปเงินเดือน
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


