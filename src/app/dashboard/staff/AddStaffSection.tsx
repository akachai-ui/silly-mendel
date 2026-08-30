'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import StaffForm from './StaffForm'

export default function AddStaffSection({ dict }: { dict?: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  return (
    <div className="mx-4 sm:mx-0">
      {!isOpen ? (
        <button 
          onClick={handleOpen}
          className="w-full bg-white hover:bg-zinc-50 border-2 border-dashed border-zinc-300 hover:border-zinc-900 rounded-3xl py-4 sm:py-5 flex items-center justify-center text-zinc-900 font-bold transition-all shadow-sm active:scale-98 group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="bg-zinc-900 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900">{dict?.add_staff || '+ เพิ่มช่างใหม่'}</span>
          </div>
        </button>
      ) : (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-lg animate-in zoom-in-95 fade-in duration-200">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">{dict?.add_title || 'กรอกข้อมูลช่างใหม่'}</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <StaffForm onSuccess={() => setIsOpen(false)} dict={dict} />
        </div>
      )}
    </div>
  )
}
