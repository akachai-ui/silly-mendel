'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

export default function DateFilterTabs({ dict }: { dict?: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const period = searchParams.get('period') || 'month'
  const startDate = searchParams.get('start') || ''
  const endDate = searchParams.get('end') || ''

  const handleRangeChange = (type: 'start' | 'end', value: string) => {
    const newStart = type === 'start' ? value : startDate
    const newEnd = type === 'end' ? value : endDate

    if (newStart || newEnd) {
      router.push(`/dashboard/summary?period=range&start=${newStart}&end=${newEnd}`)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs หลัก */}
      <div className="flex bg-zinc-100 p-1 rounded-xl overflow-x-auto hide-scrollbar">
        {[
          { id: 'today', label: dict?.today || 'วันนี้' },
          { id: 'week', label: dict?.this_week || 'สัปดาห์นี้' },
          { id: 'month', label: dict?.this_month || 'เดือนนี้' },
          { id: 'all', label: dict?.all || 'ทั้งหมด' }
        ].map(tab => (
          <Link 
            key={tab.id}
            href={`/dashboard/summary?period=${tab.id}`}
            className={`flex-1 text-center py-2 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${period === tab.id ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* เลือกช่วงเวลา (Date Range) */}
      <div className={`grid grid-cols-2 gap-px bg-zinc-200 rounded-xl overflow-hidden border transition-colors ${period === 'range' ? 'border-zinc-900 shadow-sm' : 'border-zinc-200'}`}>
        
        {/* วันที่เริ่มต้น */}
        <div className={`flex flex-col px-3 py-2 ${period === 'range' ? 'bg-white text-zinc-900' : 'bg-white text-zinc-600'}`}>
          <label className="text-[10px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {dict?.from_date || 'จากวันที่'}
          </label>
          <input 
            type="date" 
            value={period === 'range' ? startDate : ''}
            onChange={(e) => handleRangeChange('start', e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold cursor-pointer ${period === 'range' ? 'text-zinc-900 color-scheme-dark' : 'text-zinc-900'}`}
            style={{ colorScheme: period === 'range' ? 'dark' : 'light' }}
          />
        </div>

        {/* วันที่สิ้นสุด */}
        <div className={`flex flex-col px-3 py-2 ${period === 'range' ? 'bg-white text-zinc-900' : 'bg-white text-zinc-600'}`}>
          <label className="text-[10px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {dict?.to_date || 'ถึงวันที่'}
          </label>
          <input 
            type="date" 
            value={period === 'range' ? endDate : ''}
            onChange={(e) => handleRangeChange('end', e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold cursor-pointer ${period === 'range' ? 'text-zinc-900 color-scheme-dark' : 'text-zinc-900'}`}
            style={{ colorScheme: period === 'range' ? 'dark' : 'light' }}
          />
        </div>

      </div>
    </div>
  )
}
