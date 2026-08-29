import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signout } from '@/app/login/actions';
import { LogOut, Home, BarChart2, Wallet, CalendarDays, Users, Scissors, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getDictionary } from '@/utils/i18n';
import { DashboardNav } from './DashboardNav';
import { isAdminEmail } from '@/utils/admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  const user = session?.user;

  if (error || !user) {
    redirect('/login');
  }

  // ดึงข้อมูลร้านค้าเพื่อเอาโลโก้และชื่อมาโชว์ที่ Header
  const { data: shop } = await supabase
    .from('shops')
    .select('name, logo_url')
    .eq('owner_id', user.id)
    .single();

  const dict = await getDictionary();
  const isAdmin = isAdminEmail(user.email);

  const MENU_ITEMS = [
    { name: dict.layout.overview, href: '/dashboard', icon: BarChart2 },
    { name: dict.layout.receive_money, href: '/dashboard/transactions/new', icon: Wallet },
    { name: dict.layout.appointments, href: '/dashboard/appointments', icon: CalendarDays },
    { name: dict.layout.staff, href: '/dashboard/staff', icon: Users },
    { name: dict.layout.services, href: '/dashboard/services', icon: Scissors },
    { name: dict.layout.settings, href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans print:min-h-0 print:bg-white">
      
      {/* 🌟 Simple Top Navigation Bar */}
      <header className="print:hidden h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 text-zinc-900 hover:opacity-80 transition-opacity">
            {shop?.logo_url ? (
              <>
                <img src={shop.logo_url} alt={shop?.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover" />
                <span className="font-extrabold text-lg sm:text-xl truncate max-w-[150px] sm:max-w-[250px] hidden sm:block">{shop?.name}</span>
              </>
            ) : (
              <img src="/lumina-log1.png" alt="Lumina Logo" className="h-14 sm:h-16 w-auto object-contain" />
            )}
          </Link>
        </div>
        
        {/* Profile & Logout */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full transition-all shadow-sm active:scale-95 shrink-0" 
              title="โหมดผู้ดูแลระบบ / Dev Overview"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Dev Admin</span>
            </Link>
          )}

          <LanguageSwitcher />
          
          <Link href="/dashboard" className="flex items-center gap-1.5 p-2 sm:px-4 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors ml-1" title={dict.layout.home}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.layout.home}</span>
          </Link>
          
          <Link href="/dashboard/settings" className="flex items-center gap-1.5 p-2 sm:px-4 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors ml-1" title={dict.layout.settings}>
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.layout.settings}</span>
          </Link>

          <p className="text-sm font-medium text-zinc-400 hidden sm:block ml-3">{user.email}</p>
          <form action={signout}>
            <button 
              className="p-2 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors ml-1" 
              title={dict.layout.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* 🌟 Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 w-full max-w-4xl mx-auto pb-24 md:pb-8 md:pr-24 lg:pr-8 print:p-0 print:max-w-none print:m-0">
        {children}
      </main>

      {/* Mobile & Tablet Navigations */}
      <DashboardNav dict={dict} />
    </div>
  );
}
