'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BarChart2 } from 'lucide-react'

export function DashboardNav({ dict }: { dict: any }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const activeClass = "text-zinc-900 bg-zinc-100 rounded-2xl"
  const inactiveClass = "text-zinc-500 hover:text-zinc-900"

  return (
    <>
      {/* 🌟 Mobile Bottom Navigation (Visible only on screens < md) */}
      <nav className="print:hidden md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 flex items-center justify-around pb-safe z-50 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link href="/dashboard" className={`flex flex-col items-center p-2 w-14 transition-colors ${isActive('/dashboard') ? activeClass : inactiveClass}`}>
          <Home className={`w-6 h-6 mb-1 ${isActive('/dashboard') ? 'text-zinc-900' : ''}`} />
          <span className="text-[10px] font-bold">{dict.layout.home}</span>
        </Link>
        
        <Link href="/dashboard/appointments" className={`flex flex-col items-center p-2 w-14 transition-colors ${isActive('/dashboard/appointments') ? activeClass : inactiveClass}`}>
          <CalendarDays className={`w-6 h-6 mb-1 ${isActive('/dashboard/appointments') ? 'text-zinc-900' : ''}`} />
          <span className="text-[10px] font-bold truncate w-full text-center">{dict.dashboard.queue_table}</span>
        </Link>
        
        {/* Floating Action Button for Add Bill */}
        <div className="relative -top-5">
          <Link href="/dashboard/transactions/new" className={`flex items-center justify-center w-14 h-14 text-white rounded-full shadow-xl shadow-zinc-900/20 border-4 border-zinc-50 active:scale-95 transition-transform ${isActive('/dashboard/transactions/new') ? 'bg-zinc-700' : 'bg-zinc-900'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </Link>
        </div>

        <Link href="/dashboard/expenses" className={`flex flex-col items-center p-2 w-14 transition-colors ${isActive('/dashboard/expenses') ? activeClass : inactiveClass}`}>
          <svg className={`w-6 h-6 mb-1 ${isActive('/dashboard/expenses') ? 'text-zinc-900' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold truncate w-full text-center">{dict.expenses?.title || 'รายจ่าย'}</span>
        </Link>
        
        <Link href="/dashboard/summary" className={`flex flex-col items-center p-2 w-14 transition-colors ${isActive('/dashboard/summary') ? activeClass : inactiveClass}`}>
          <BarChart2 className={`w-6 h-6 mb-1 ${isActive('/dashboard/summary') ? 'text-zinc-900' : ''}`} />
          <span className="text-[10px] font-bold truncate w-full text-center">{dict.dashboard.summary}</span>
        </Link>
      </nav>

      {/* 🌟 Tablet Right Navigation (Visible on screens md to lg) */}
      <nav className="print:hidden hidden md:flex lg:hidden fixed right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-zinc-200 border-r-0 rounded-l-3xl flex-col items-center justify-center gap-4 py-6 px-3 z-50 shadow-xl">
        <Link href="/dashboard" className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${isActive('/dashboard') ? activeClass : inactiveClass}`} title={dict.layout.home}>
          <Home className="w-7 h-7" />
          <span className="text-[10px] font-bold mt-1">{dict.layout.home}</span>
        </Link>
        
        <Link href="/dashboard/appointments" className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${isActive('/dashboard/appointments') ? activeClass : inactiveClass}`} title={dict.dashboard.queue_table}>
          <CalendarDays className="w-7 h-7" />
          <span className="text-[10px] font-bold mt-1">{dict.dashboard.queue_table}</span>
        </Link>
        
        {/* Action Button for Add Bill on Tablet */}
        <Link href="/dashboard/transactions/new" className={`flex items-center justify-center w-16 h-16 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform my-2 ${isActive('/dashboard/transactions/new') ? 'bg-zinc-700' : 'bg-zinc-900'}`} title={dict.dashboard.add_bill.replace('+ ', '')}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </Link>

        <Link href="/dashboard/expenses" className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${isActive('/dashboard/expenses') ? activeClass : inactiveClass}`} title={dict.expenses?.title || 'รายจ่าย'}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold mt-1">{dict.expenses?.title || 'รายจ่าย'}</span>
        </Link>
        
        <Link href="/dashboard/summary" className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${isActive('/dashboard/summary') ? activeClass : inactiveClass}`} title={dict.dashboard.summary}>
          <BarChart2 className="w-7 h-7" />
          <span className="text-[10px] font-bold mt-1">{dict.dashboard.summary}</span>
        </Link>
      </nav>
    </>
  )
}
