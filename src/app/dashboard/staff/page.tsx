import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ChevronLeft, Scissors, Edit2 } from 'lucide-react'
import AddStaffSection from './AddStaffSection'
import DeleteButton from './DeleteButton'
import { getDictionary } from '@/utils/i18n'

export default async function StaffPage() {
  const supabase = await createClient()
  const dict = await getDictionary()
  
  const { data: staffList } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 sm:pb-0">
      
      <div className="flex items-center space-x-3 px-2 sm:px-0">
        <Link href="/dashboard" className="p-2 -ml-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">{dict.staff.title}</h1>
          <p className="text-sm text-zinc-400">{dict.staff.subtitle}</p>
        </div>
      </div>

      {/* 🌟 แบบฟอร์มเพิ่มช่าง (ซ่อนได้) */}
      <AddStaffSection dict={dict.staff} />

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mx-4 sm:mx-0">
        <div className="px-5 sm:px-6 py-4 bg-zinc-50/50 border-b border-zinc-200">
          <h2 className="font-bold text-zinc-900">{dict.staff.title} ({staffList?.length || 0})</h2>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {staffList && staffList.length > 0 ? (
            staffList.map((staff) => (
              <div key={staff.id} className="px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {staff.image_url ? (
                    <img src={staff.image_url} alt={staff.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-zinc-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                      {staff.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-zinc-900 text-lg leading-tight">{staff.name}</p>
                    {staff.phone && (
                      <p className="text-sm text-zinc-400 mt-0.5">{staff.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <Link 
                    href={`/dashboard/staff/${staff.id}/edit`}
                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title={dict.staff.edit_btn}
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <DeleteButton id={staff.id} name={staff.name} imageUrl={staff.image_url} dict={dict.staff} />
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-14 h-14 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-7 h-7" />
              </div>
              <p className="font-medium text-zinc-900">{dict.staff.no_staff}</p>
              <p className="text-sm text-zinc-400 mt-1">{dict.staff.no_staff_desc}</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}
