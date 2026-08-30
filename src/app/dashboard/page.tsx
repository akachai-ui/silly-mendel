import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Wallet, Users, Scissors, Settings, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import RecentTransactions from './RecentTransactions';
import RevenueChart from './RevenueChart';
import { getDictionary } from '@/utils/i18n';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession()
  const user = session?.user;
  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user?.id).single();
  if (!shop) redirect('/onboarding');

  const dict = await getDictionary();

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    { data: staff },
    { data: transactions },
    { data: weekTransactions }
  ] = await Promise.all([
    supabase.from('staff').select('id, name, image_url').eq('shop_id', shop.id).eq('is_active', true),
    supabase.from('transactions').select('id, amount, service_name, staff_id, payment_method, created_at, staff(name, image_url)').eq('shop_id', shop.id).gte('created_at', todayStart.toISOString()).lt('created_at', todayEnd.toISOString()),
    supabase.from('transactions').select('amount, created_at').eq('shop_id', shop.id).gte('created_at', sevenDaysAgo.toISOString())
  ]);

  // สร้างข้อมูลกราฟ 7 วัน
  const todayStr = todayStart.toISOString().split('T')[0]
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayRevenue = (weekTransactions || [])
      .filter(t => t.created_at.startsWith(dateStr))
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    return {
      day: dateStr === todayStr ? 'วันนี้' : dayNames[d.getDay()],
      date: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      revenue: dayRevenue,
      isToday: dateStr === todayStr
    }
  })

  const totalStaff = staff?.length || 0;
  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalCustomers = transactions?.length || 0;
  const totalCash = transactions?.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalTransfer = transactions?.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const revenueByStaff = (staff || []).map(s => {
    const staffTxs = transactions?.filter(t => t.staff_id === s.id) || [];
    const revenue = staffTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    return { name: s.name, image_url: s.image_url, revenue, customers: staffTxs.length };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxRevenue = revenueByStaff[0]?.revenue || 1;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-32 sm:pb-0">
      
      {/* ─── Hero Revenue Card ─── */}
      <div className="mx-4 sm:mx-0 bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-900/10 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-medium mb-1">{shop?.name || dict.dashboard.shop_title}</p>
          <p className="text-zinc-500 text-xs mb-6">{dict.dashboard.overview_subtitle}</p>

          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-2">{dict.dashboard.today_revenue}</p>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-5">
            ฿{totalRevenue.toLocaleString()}
          </h1>

          {/* Payment breakdown badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              เงินสด ฿{totalCash.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/30">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              โอนเงิน ฿{totalTransfer.toLocaleString()}
            </span>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-zinc-500 text-xs mb-1">{dict.dashboard.today_customers}</p>
              <p className="text-white text-2xl font-extrabold">{totalCustomers} <span className="text-zinc-500 text-sm font-medium">{dict.dashboard.people}</span></p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-zinc-500 text-xs mb-1">{dict.dashboard.available_staff}</p>
              <p className="text-white text-2xl font-extrabold">{totalStaff} <span className="text-zinc-500 text-sm font-medium">{dict.dashboard.people}</span></p>
            </div>
          </div>

          {/* 7-Day Revenue Chart */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">รายรับ 7 วันย้อนหลัง</p>
            <RevenueChart data={chartData} />
          </div>
        </div>
      </div>

      {/* ─── Quick Shortcuts (Mobile & Desktop) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mx-4 sm:mx-0">
        <Link 
          href="/dashboard/services" 
          className="flex items-center gap-3 p-3.5 sm:p-4 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl transition-all shadow-sm active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center shrink-0 transition-colors">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight truncate">บริการ & ราคา</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">จัดการเมนูราคา</p>
          </div>
        </Link>

        <Link 
          href="/dashboard/staff" 
          className="flex items-center gap-3 p-3.5 sm:p-4 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl transition-all shadow-sm active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center shrink-0 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight truncate">ทีมช่าง</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">จัดการช่างในร้าน</p>
          </div>
        </Link>

        <Link 
          href="/dashboard/appointments" 
          className="flex items-center gap-3 p-3.5 sm:p-4 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl transition-all shadow-sm active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center shrink-0 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight truncate">ตารางคิว</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">คิวจองล่วงหน้า</p>
          </div>
        </Link>

        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 p-3.5 sm:p-4 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl transition-all shadow-sm active:scale-98 group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center shrink-0 transition-colors">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-tight truncate">ตั้งค่าร้าน</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">ข้อมูลร้านค้า</p>
          </div>
        </Link>
      </div>


      {/* ─── Staff Performance ─── */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mx-4 sm:mx-0">
        <div className="px-5 sm:px-7 py-5 border-b border-zinc-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-zinc-900">{dict.dashboard.staff_performance}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">ยอดรับเงินวันนี้ แยกรายช่าง</p>
          </div>
          <Link href="/dashboard/staff" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl transition-colors">
            {dict.dashboard.manage_staff}
          </Link>
        </div>

        <div className="divide-y divide-zinc-50">
          {revenueByStaff.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">{dict.dashboard.no_staff}</h3>
              <p className="text-sm text-zinc-400 mb-5">{dict.dashboard.no_staff_desc}</p>
              <Link href="/dashboard/staff" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                {dict.dashboard.go_to_add_staff}
              </Link>
            </div>
          ) : (
            revenueByStaff.map((s: any, i: number) => {
              const pct = maxRevenue > 0 ? Math.round((s.revenue / maxRevenue) * 100) : 0;
              return (
                <div key={i} className="px-5 sm:px-7 py-4 hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.name} className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold text-base shrink-0">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-zinc-900 leading-tight">{s.name}</p>
                        <p className="text-xs text-zinc-400">{s.customers} {dict.dashboard.people}</p>
                      </div>
                    </div>
                    <p className="font-extrabold text-zinc-900 text-lg">฿{s.revenue.toLocaleString()}</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Recent Transactions ─── */}
      <RecentTransactions transactions={transactions || []} staffList={staff || []} />

      {/* ─── FAB Mobile ─── */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <Link
          href="/dashboard/transactions/new"
          className="flex items-center justify-center w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl shadow-zinc-900/30 active:scale-95 transition-transform border-2 border-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </Link>
      </div>

    </div>
  );
}
