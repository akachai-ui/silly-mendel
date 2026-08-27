import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintTrigger from '../slip/PrintTrigger' // Reuse the same print trigger

export default async function TaxReportPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string }> }) {
  const { period = 'month', start = '', end = '' } = await searchParams;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('id, name, address, tax_id').eq('owner_id', user.id).single()
  if (!shop) redirect('/dashboard/summary')

  const { data: staffList } = await supabase.from('staff').select('*').eq('shop_id', shop.id)
  
  // Queries
  let txQuery = supabase.from('transactions').select('amount, created_at').eq('shop_id', shop.id)
  let exQuery = supabase.from('expenses').select('amount, expense_date, category, description').eq('shop_id', shop.id)

  const now = new Date()
  if (period === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    txQuery = txQuery.gte('created_at', today.toISOString())
    exQuery = exQuery.gte('expense_date', today.toISOString().split('T')[0])
  } else if (period === 'week') {
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
    firstDay.setHours(0, 0, 0, 0)
    txQuery = txQuery.gte('created_at', firstDay.toISOString())
    exQuery = exQuery.gte('expense_date', firstDay.toISOString().split('T')[0])
  } else if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    txQuery = txQuery.gte('created_at', firstDay.toISOString())
    exQuery = exQuery.gte('expense_date', firstDay.toISOString().split('T')[0])
  } else if (period === 'range') {
    if (start) {
      txQuery = txQuery.gte('created_at', new Date(start).toISOString())
      exQuery = exQuery.gte('expense_date', start)
    }
    if (end) {
      const targetEnd = new Date(end)
      targetEnd.setDate(targetEnd.getDate() + 1)
      txQuery = txQuery.lt('created_at', targetEnd.toISOString())
      exQuery = exQuery.lte('expense_date', end)
    }
  }

  const [{ data: transactions }, { data: expenses }] = await Promise.all([txQuery, exQuery])
  
  const txs = transactions || []
  const exps = expenses || []
  const staffs = staffList || []

  // 1. Calculate Total Revenue
  const totalRevenue = txs.reduce((sum, tx) => sum + tx.amount, 0)

  // 2. Calculate Total Expenses by Category
  const expenseByCategory = exps.reduce((acc, ex) => {
    const cat = ex.category || 'อื่นๆ'
    acc[cat] = (acc[cat] || 0) + ex.amount
    return acc
  }, {} as Record<string, number>)
  const totalOtherExpenses = exps.reduce((sum, ex) => sum + ex.amount, 0)

  // 3. Calculate Wages (Cost of Labor)
  // To do this perfectly we need transaction breakdown by staff, but for summary we can approximate or fetch again.
  // Actually, let's fetch transactions with staff_id to calculate exact wages.
  let txWithStaffQuery = supabase.from('transactions').select('amount, created_at, staff_id').eq('shop_id', shop.id)
  // apply same date filters...
  if (period === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    txWithStaffQuery = txWithStaffQuery.gte('created_at', today.toISOString())
  } else if (period === 'week') {
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
    firstDay.setHours(0, 0, 0, 0)
    txWithStaffQuery = txWithStaffQuery.gte('created_at', firstDay.toISOString())
  } else if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    txWithStaffQuery = txWithStaffQuery.gte('created_at', firstDay.toISOString())
  } else if (period === 'range') {
    if (start) txWithStaffQuery = txWithStaffQuery.gte('created_at', new Date(start).toISOString())
    if (end) {
      const targetEnd = new Date(end)
      targetEnd.setDate(targetEnd.getDate() + 1)
      txWithStaffQuery = txWithStaffQuery.lt('created_at', targetEnd.toISOString())
    }
  }

  const { data: txStaffData } = await txWithStaffQuery
  const txStaffs = txStaffData || []

  let totalWage = 0
  staffs.forEach(staff => {
    const staffTxs = txStaffs.filter(tx => tx.staff_id === staff.id)
    const staffRev = staffTxs.reduce((sum, tx) => sum + tx.amount, 0)
    
    if (staff.wage_type === 'percent') {
      totalWage += staffRev * ((staff.commission_percent || 0) / 100)
    } else if (staff.wage_type === 'daily') {
      const uniqueDays = new Set(staffTxs.map(tx => tx.created_at.split('T')[0])).size
      totalWage += (staff.wage_amount || 0) * uniqueDays
    } else if (staff.wage_type === 'monthly' || staff.wage_type === 'weekly') {
      totalWage += staff.wage_amount || 0
    }
  })

  const netProfit = totalRevenue - totalWage - totalOtherExpenses

  // Labels
  let periodLabel = 'ยอดสะสมทั้งหมด'
  const todayDate = new Date()
  if (period === 'today') periodLabel = `ประจำวันที่ ${todayDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`
  else if (period === 'week') periodLabel = `ประจำสัปดาห์`
  else if (period === 'month') periodLabel = `ประจำเดือน ${todayDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`
  else if (period === 'range') periodLabel = `ประจำงวดกำหนดเอง`

  const printDate = new Date().toLocaleString('th-TH')

  return (
    <div className="bg-gray-100 min-h-screen text-black flex justify-center p-4 sm:p-8 print:bg-white print:min-h-0 print:block print:p-0">
      <PrintTrigger />
      <div className="w-full max-w-[210mm] bg-white p-8 sm:p-12 shadow-xl border border-gray-200 font-sans text-sm pb-16 print:shadow-none print:border-none print:p-8 print:m-0 print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <h1 className="text-2xl font-bold mb-2">{shop.name}</h1>
          <h2 className="text-xl font-bold mb-2">รายงานสรุปรายรับ-รายจ่าย (งบกำไรขาดทุน)</h2>
          <p className="text-gray-600">{periodLabel}</p>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <p>เลขประจำตัวผู้เสียภาษี: {shop.tax_id || '-'}</p>
          <p>พิมพ์เมื่อ: {printDate}</p>
        </div>

        {/* P&L Table */}
        <div className="mb-12 border border-black p-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 px-4 font-bold border-r border-black w-3/4 text-center">รายการ (Description)</th>
                <th className="py-2 px-4 font-bold text-center w-1/4">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {/* REVENUE */}
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4 font-bold border-r border-black">1. รายได้ (Revenues)</td>
                <td className="py-2 px-4 text-right"></td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-8 border-r border-black">รายได้จากการให้บริการ (Service Revenue)</td>
                <td className="py-2 px-4 text-right">{totalRevenue.toLocaleString()}</td>
              </tr>
              <tr className="border-b-2 border-black font-bold">
                <td className="py-2 px-4 text-right border-r border-black">รวมรายได้ (Total Revenue)</td>
                <td className="py-2 px-4 text-right">{totalRevenue.toLocaleString()}</td>
              </tr>

              {/* EXPENSES */}
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4 font-bold border-r border-black mt-4">2. ค่าใช้จ่าย (Expenses)</td>
                <td className="py-2 px-4 text-right"></td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-8 border-r border-black">ต้นทุนค่าแรงช่าง / ส่วนแบ่ง (Labor Cost)</td>
                <td className="py-2 px-4 text-right">{totalWage.toLocaleString()}</td>
              </tr>
              
              {/* Other Expenses Breakdown */}
              {Object.entries(expenseByCategory).map(([cat, amount], i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="py-2 px-8 border-r border-black">ค่าใช้จ่าย: {cat}</td>
                  <td className="py-2 px-4 text-right">{amount.toLocaleString()}</td>
                </tr>
              ))}
              
              <tr className="border-b-2 border-black font-bold">
                <td className="py-2 px-4 text-right border-r border-black">รวมค่าใช้จ่าย (Total Expenses)</td>
                <td className="py-2 px-4 text-right">{(totalWage + totalOtherExpenses).toLocaleString()}</td>
              </tr>

              {/* NET PROFIT */}
              <tr className="font-extrabold text-lg">
                <td className="py-4 px-4 text-right uppercase border-r border-black">กำไรสุทธิ (Net Profit)</td>
                <td className="py-4 px-4 text-right underline decoration-double">{netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer / Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-24 pt-8">
          <div className="text-center">
            <p className="border-b border-black mx-12 pb-8"></p>
            <p className="mt-2 text-sm font-bold">ผู้จัดทำรายงาน (Prepared By)</p>
            <p className="text-xs mt-1">วันที่ _______/_______/_______</p>
          </div>
          <div className="text-center">
            <p className="border-b border-black mx-12 pb-8"></p>
            <p className="mt-2 text-sm font-bold">ผู้ตรวจสอบ/อนุมัติ (Approved By)</p>
            <p className="text-xs mt-1">วันที่ _______/_______/_______</p>
          </div>
        </div>

      </div>
    </div>
  )
}
