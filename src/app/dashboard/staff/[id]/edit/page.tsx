import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import StaffForm from '../../StaffForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getDictionary } from '@/utils/i18n'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const dict = await getDictionary()
  
  const { data: staff } = await supabase.from('staff').select('*').eq('id', id).single()
  
  if (!staff) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 sm:pb-0">
      <div className="flex items-center space-x-3 px-2 sm:px-0">
        <Link href="/dashboard/staff" className="p-2 -ml-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">{dict.staff.edit_title}</h1>
          <p className="text-sm text-zinc-400">{dict.staff.edit_subtitle}</p>
        </div>
      </div>
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm mx-4 sm:mx-0">
        <StaffForm staff={staff} dict={dict.staff} />
      </div>
    </div>
  )
}
