import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
      <div className="p-6 bg-white rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
        <p className="text-zinc-500 font-medium animate-pulse">กำลังเตรียมข้อมูล...</p>
      </div>
    </div>
  )
}
