import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Wallet, Users, Scissors, Settings, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import RecentTransactions from './RecentTransactions';
import { getDictionary } from '@/utils/i18n';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession()
  const user = session?.user;
  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user?.id).single();
  if (!shop) redirect('/onboarding');

  const dict = await getDictionary();

  // หาวันที่ปัจจุบัน (เวลาเที่ยงคืน) เพื่อดึงเฉพาะยอดของวันนี้
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // ดึงข้อมูลพร้อมกัน (Parallel Fetching) เพื่อความรวดเร็ว
  const [
    { data: staff },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('staff').select('id, name, image_url').eq('shop_id', shop.id).eq('is_active', true),
    supabase.from('transactions').select('id, amount, service_name, staff_id, created_at, staff(name, image_url)').eq('shop_id', shop.id).gte('created_at', todayStart.toISOString()).lt('created_at', todayEnd.toISOString())
  ]);

  const totalStaff = staff?.length || 0;

  // คำนวณรายรับรวม และ จำนวนลูกค้ารวม
  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalCustomers = transactions?.length || 0;

  // 3. คำนวณรายได้แยกตามช่างแต่ละคน
  const revenueByStaff = (staff || []).map(s => {
    const staffTxs = transactions?.filter(t => t.staff_id === s.id) || [];
    const revenue = staffTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    return { name: s.name, image_url: s.image_url, revenue, customers: staffTxs.length };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 sm:pb-0">
      
      {/* ส่วนหัวกระดาษ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-0 pt-4 sm:pt-0 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">{shop?.name || dict.dashboard.shop_title}</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">{dict.dashboard.overview_subtitle}</p>
        </div>
        
        <div className="hidden lg:flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0 justify-end flex-wrap">
          {/* ปุ่มตารางคิว */}
          <Link href="/dashboard/appointments" className="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-full hover:bg-zinc-50 transition-colors shadow-sm flex items-center justify-center gap-2" title={dict.dashboard.queue_table}>
            <svg className="w-4 h-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-bold whitespace-nowrap leading-none">{dict.dashboard.queue_table}</span>
          </Link>

          {/* ปุ่มสรุปข้อมูล (Summary) */}
          <Link href="/dashboard/summary" className="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-full hover:bg-zinc-50 transition-colors shadow-sm flex items-center justify-center gap-2" title={dict.dashboard.summary}>
            <BarChart2 className="w-4 h-4 shrink-0 text-zinc-500" />
            <span className="text-sm font-bold whitespace-nowrap leading-none">{dict.dashboard.summary}</span>
          </Link>

          {/* ปุ่มรายจ่าย (Expenses) */}
          <Link href="/dashboard/expenses" className="px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-full hover:bg-zinc-50 transition-colors shadow-sm flex items-center justify-center gap-2" title={dict.expenses?.title || 'รายจ่าย'}>
            <svg className="w-4 h-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-bold whitespace-nowrap leading-none">{dict.expenses?.title || 'รายจ่าย'}</span>
          </Link>

          <div className="w-px h-8 bg-zinc-200 mx-1 hidden lg:block"></div>

          {/* ปุ่มตั้งค่าบริการ (Icon-only on desktop) */}
          <Link 
            href="/dashboard/services" 
            className="p-2.5 bg-white text-zinc-500 border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm active:scale-95 flex items-center justify-center"
            title={dict.layout?.services || 'บริการ'}
          >
            <Scissors className="w-4 h-4 shrink-0" />
          </Link>

          {/* ปุ่มตั้งค่าร้าน (Icon-only on desktop) */}
          <Link 
            href="/dashboard/settings" 
            className="p-2.5 bg-white text-zinc-500 border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm active:scale-95 flex items-center justify-center"
            title={dict.layout?.settings || 'ตั้งค่าร้าน'}
          >
            <Settings className="w-4 h-4 shrink-0" />
          </Link>

          {/* ปุ่มเพิ่มบิลแบบ Desktop */}
          <Link 
            href="/dashboard/transactions/new" 
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95 ml-2 shrink-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            {dict.dashboard.add_bill.replace('+ ', '')}
          </Link>
        </div>
      </div>

      {/* กล่องสรุปตัวเลข (KPI Cards - สไตล์ Bento Grid บนมือถือ) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* รายรับ (บนมือถือกว้างเต็มจอ) */}
        <div className="col-span-2 md:col-span-1 bg-zinc-900 p-5 sm:p-6 rounded-3xl shadow-sm flex items-center space-x-4 sm:space-x-5 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-inner shrink-0 backdrop-blur-md">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-0.5 sm:mb-1">{dict.dashboard.today_revenue}</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">฿{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* ลูกค้า (บนมือถือแบ่งครึ่งจอ) */}
        <div className="col-span-1 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-100 text-zinc-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-zinc-400 mb-0.5 sm:mb-1">{dict.dashboard.today_customers}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">{totalCustomers} <span className="text-xs sm:text-sm font-medium text-zinc-400">{dict.dashboard.people}</span></h3>
          </div>
        </div>

        {/* ช่าง (บนมือถือแบ่งครึ่งจอ) */}
        <div className="col-span-1 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-100 text-zinc-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-zinc-400 mb-0.5 sm:mb-1">{dict.dashboard.available_staff}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">{totalStaff} <span className="text-xs sm:text-sm font-medium text-zinc-400">{dict.dashboard.people}</span></h3>
          </div>
        </div>

      </div>

      {/* ตารางแสดงผลงานช่างแต่ละคน */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mx-4 sm:mx-0">
        <div className="px-5 sm:px-7 py-5 sm:py-6 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900">{dict.dashboard.staff_performance}</h2>
          <Link href="/dashboard/staff" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl transition-colors shadow-sm">
            {dict.dashboard.manage_staff}
          </Link>
        </div>
        <div className="divide-y divide-zinc-100">
          {revenueByStaff.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50/50">
              <div className="w-16 h-16 bg-zinc-100 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">{dict.dashboard.no_staff}</h3>
              <p className="text-zinc-400 mt-1 mb-5">{dict.dashboard.no_staff_desc}</p>
              <Link href="/dashboard/staff" className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors shadow-sm">
                {dict.dashboard.go_to_add_staff}
              </Link>
            </div>
          ) : (
            revenueByStaff.map((staff: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 sm:px-7 sm:py-5 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {staff.image_url ? (
                    <img src={staff.image_url} alt={staff.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-zinc-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-zinc-200 shrink-0">
                      {staff.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-zinc-900 text-lg leading-tight">{staff.name}</p>
                    <p className="text-sm font-medium text-zinc-400 mt-0.5">{dict.dashboard.received} {staff.customers} {dict.dashboard.people}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-400 mb-1">{dict.dashboard.made_revenue}</p>
                  <p className="font-extrabold text-zinc-900 text-xl">฿{staff.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ประวัติบิลวันนี้ (แก้ไข/ลบได้) */}
      <RecentTransactions transactions={transactions || []} staffList={staff || []} />

      {/* 🚀 ปุ่มเพิ่มบิลแบบ Sticky ติดขอบล่างสำหรับมือถือ (ใช้หัวแม่มือกดง่าย) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 z-40 pb-safe">
        <Link 
          href="/dashboard/transactions/new" 
          className="flex items-center justify-center w-full py-4 bg-zinc-900 text-white rounded-2xl text-base font-bold shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform"
        >
          {dict.dashboard.add_bill}
        </Link>
      </div>

    </div>
  );
}

