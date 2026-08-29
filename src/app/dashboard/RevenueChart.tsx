'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface DayData {
  day: string
  date: string
  revenue: number
  isToday: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs">
      <p className="font-bold mb-0.5">{payload[0]?.payload?.date}</p>
      <p className="text-zinc-300">฿{Number(payload[0]?.value || 0).toLocaleString()}</p>
    </div>
  )
}

export default function RevenueChart({ data }: { data: DayData[] }) {
  const hasData = data.some(d => d.revenue > 0)

  if (!hasData) {
    return (
      <div className="h-36 flex items-center justify-center">
        <p className="text-xs text-zinc-400">ยังไม่มีข้อมูลรายรับในช่วงนี้</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5', radius: 8 }} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.isToday ? '#18181b' : '#e4e4e7'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
