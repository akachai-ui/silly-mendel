'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import StaffForm from './StaffForm'

export default function AddStaffSection({ dict }: { dict?: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    // เลื่อนหน้าจอกลับไปด้านบนสุดเพื่อให้เห็นฟอร์มชัดเจน
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  return (
    <div className="mx-4 sm:mx-0">
      {!isOpen ? (
        <>
          {/* 💻 ปุ่มแบบ Desktop (เส้นประแนวนอน) */}
          <button 
            onClick={handleOpen}
            className="hidden sm:flex w-full bg-zinc-900 border-2 border-zinc-200 border-dashed rounded-3xl py-6 items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-50 hover:border-zinc-400 transition-all group shadow-sm active:scale-95"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-zinc-100 p-2 rounded-full group-hover:bg-zinc-200 transition-colors text-zinc-400">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-base">{dict?.add_staff || '+ เพิ่มช่างใหม่'}</span>
            </div>
          </button>

          {/* 📱 ปุ่มแบบ Mobile (ลอยขอบล่างเหมือนหน้า Dashboard) */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 z-40 pb-safe">
            <button 
              onClick={handleOpen}
              className="flex items-center justify-center w-full py-4 bg-zinc-900 text-white rounded-2xl text-base font-bold shadow-xl shadow-zinc-900/20 active:scale-95 transition-transform"
            >
              {dict?.add_staff || '+ เพิ่มช่างใหม่'}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm animate-in zoom-in-95 fade-in duration-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-zinc-900">{dict?.add_title || 'กรอกข้อมูลช่างใหม่'}</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 -mt-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
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
