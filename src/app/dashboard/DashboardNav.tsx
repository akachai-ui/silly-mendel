'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BarChart2 } from 'lucide-react'

export function DashboardNav({ dict }: { dict: any }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="print:hidden md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-zinc-200/80 flex items-end justify-around pb-safe z-50 px-1 pt-2 pb-3 shadow-[0_-1px_0_rgba(0,0,0,0.06),0_-8px_24px_rgba(0,0,0,0.05)]">

        {/* Home */}
        <NavItem href="/dashboard" label={dict.layout.home} active={isActive('/dashboard')}>
          <Home className="w-5 h-5" />
        </NavItem>

        {/* Appointments */}
        <NavItem href="/dashboard/appointments" label={dict.dashboard.queue_table} active={isActive('/dashboard/appointments')}>
          <CalendarDays className="w-5 h-5" />
        </NavItem>

        {/* Center FAB — Add Bill */}
        <div className="relative flex flex-col items-center pb-1">
          <Link
            href="/dashboard/transactions/new"
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl shadow-zinc-900/25 border-4 border-white active:scale-95 transition-all duration-150 -mt-6 ${isActive('/dashboard/transactions/new') ? 'bg-zinc-700' : 'bg-zinc-900'}`}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
          <span className="text-[10px] font-bold text-zinc-500 mt-1.5">{dict.dashboard.add_bill?.replace('+ ', '') || 'รับเงิน'}</span>
        </div>

        {/* Expenses */}
        <NavItem href="/dashboard/expenses" label={dict.expenses?.title || 'รายจ่าย'} active={isActive('/dashboard/expenses')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </NavItem>

        {/* Summary */}
        <NavItem href="/dashboard/summary" label={dict.dashboard.summary} active={isActive('/dashboard/summary')}>
          <BarChart2 className="w-5 h-5" />
        </NavItem>
      </nav>

      {/* ─── Tablet Side Navigation ─── */}
      <nav className="print:hidden hidden md:flex lg:hidden fixed right-0 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-zinc-200 border-r-0 rounded-l-3xl flex-col items-center justify-center gap-1 py-5 px-2.5 z-50 shadow-xl shadow-black/5">

        <TabletNavItem href="/dashboard" label={dict.layout.home} active={isActive('/dashboard')}>
          <Home className="w-6 h-6" />
        </TabletNavItem>

        <TabletNavItem href="/dashboard/appointments" label={dict.dashboard.queue_table} active={isActive('/dashboard/appointments')}>
          <CalendarDays className="w-6 h-6" />
        </TabletNavItem>

        {/* FAB */}
        <Link
          href="/dashboard/transactions/new"
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform my-2 ${isActive('/dashboard/transactions/new') ? 'bg-zinc-700' : 'bg-zinc-900'}`}
          title={dict.dashboard.add_bill?.replace('+ ', '') || 'รับเงิน'}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        <TabletNavItem href="/dashboard/expenses" label={dict.expenses?.title || 'รายจ่าย'} active={isActive('/dashboard/expenses')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </TabletNavItem>

        <TabletNavItem href="/dashboard/summary" label={dict.dashboard.summary} active={isActive('/dashboard/summary')}>
          <BarChart2 className="w-6 h-6" />
        </TabletNavItem>
      </nav>
    </>
  )
}

// ─── NavItem (Mobile) ───
function NavItem({ href, label, active, children }: {
  href: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-3 py-1 min-w-[52px] group">
      <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'bg-zinc-900' : 'group-hover:bg-zinc-100'}`}>
        <span className={`transition-colors duration-200 ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`}>
          {children}
        </span>
      </div>
      <span className={`text-[10px] font-bold transition-colors duration-200 truncate w-full text-center ${active ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-700'}`}>
        {label}
      </span>
    </Link>
  )
}

// ─── TabletNavItem (Tablet Sidebar) ───
function TabletNavItem({ href, label, active, children }: {
  href: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center p-3 w-full rounded-2xl transition-all duration-200 ${active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
      title={label}
    >
      {children}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </Link>
  )
}
