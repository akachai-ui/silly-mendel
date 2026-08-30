'use client'
import { useState } from 'react'
import { addService, updateService, deleteService } from './actions'
import { toast } from 'sonner'
import { Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function ServicesClient({ initialServices, dict }: { initialServices: any[], dict?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setEditingId(null)
    setName('')
    setPrice('')
    setIsOpen(true)
  }

  const handleOpenEdit = (svc: any) => {
    setEditingId(svc.id)
    setName(svc.name)
    setPrice(svc.price.toString())
    setIsOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)

    const res = editingId 
      ? await updateService(editingId, formData)
      : await addService(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(dict?.success_save || 'บันทึกบริการสำเร็จ')
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const res = await deleteService(deletingId)
    if (res?.error) toast.error(res.error)
    else toast.success(dict?.success_delete || 'ลบสำเร็จ')
    setDeletingId(null)
  }

  return (
    <div className="space-y-6 mx-4 sm:mx-0">
       {/* 🌟 Form สำหรับเพิ่ม/แก้ไข */}
       {!isOpen ? (
         <button 
           onClick={handleOpenAdd} 
           className="w-full bg-white hover:bg-zinc-50 border-2 border-dashed border-zinc-300 hover:border-zinc-900 rounded-3xl py-4 sm:py-5 flex items-center justify-center text-zinc-900 font-extrabold transition-all shadow-sm active:scale-98 group"
         >
            <div className="flex items-center space-x-2.5">
              <div className="bg-zinc-900 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-zinc-900">{dict?.add_service || '+ เพิ่มบริการใหม่ / กำหนดราคา'}</span>
            </div>
         </button>
       ) : (
         <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-lg animate-in zoom-in-95 duration-200">
           <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-100">
             <h2 className="text-lg font-bold text-zinc-900">{editingId ? (dict?.title ? `แก้ไข ${dict.title}` : 'แก้ไขบริการ') : (dict?.add_service || 'เพิ่มบริการใหม่')}</h2>
             <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-full transition-colors"><X className="w-5 h-5"/></button>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-3 mb-6">
             <input 
               required 
               value={name} 
               onChange={e => setName(e.target.value)} 
               placeholder={dict?.service_name_ph || "ชื่อบริการ (เช่น ตัดผมชาย, สระซอย)"} 
               className="text-zinc-900 flex-1 px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" 
             />
             <div className="relative sm:w-1/3">
               <input 
                 required 
                 type="number" 
                 value={price} 
                 onChange={e => setPrice(e.target.value)} 
                 placeholder={dict?.price || "ราคา"} 
                 className="text-zinc-900 w-full pl-8 pr-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-bold" 
               />
               <span className="absolute right-4 top-3 text-zinc-400 font-medium">฿</span>
             </div>
           </div>
           
           <button 
             disabled={isLoading} 
             className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl flex justify-center items-center hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm active:scale-95"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : (dict?.save_btn || 'บันทึกบริการ')}
           </button>
         </form>
       )}

       {/* 🌟 รายการบริการทั้งหมด */}
       <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
         <div className="px-6 py-5 bg-zinc-50/50 border-b border-zinc-200">
           <h2 className="font-bold text-zinc-900">{dict?.title || 'บริการทั้งหมด'} ({initialServices.length})</h2>
         </div>
         <div className="divide-y divide-zinc-100">
           {initialServices.length > 0 ? initialServices.map(svc => (
             <div key={svc.id} className="px-6 py-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="font-bold text-lg text-zinc-900">{svc.name}</p>
                  <p className="text-zinc-400 font-medium text-sm">{dict?.price || 'ราคามาตรฐาน'}: <span className="text-zinc-900 font-bold">฿{svc.price.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleOpenEdit(svc)} className="p-2 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5"/>
                  </button>
                  <button onClick={() => setDeletingId(svc.id)} className="p-2 text-zinc-400 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5"/>
                  </button>
                </div>
             </div>
           )) : (
             <div className="p-8 text-center text-zinc-400 text-sm space-y-3">
               <p>{dict?.no_services || 'ยังไม่มีรายการบริการในร้าน'}</p>
               <button
                 onClick={handleOpenAdd}
                 className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
               >
                 <Plus className="w-3.5 h-3.5" />
                 {dict?.add_service || 'เพิ่มบริการแรกของคุณ'}
               </button>
             </div>
           )}
         </div>
       </div>

       <ConfirmModal 
         isOpen={!!deletingId}
         title={dict?.confirm_delete || "ยืนยันการลบ"}
         description={`${dict?.confirm_delete_desc || 'คุณต้องการลบ'} ${dict?.confirm_delete_desc2 || 'ใช่หรือไม่?'}`}
         isDanger={true}
         onConfirm={handleDelete}
         onCancel={() => setDeletingId(null)}
         confirmText="ลบ"
       />
    </div>
  )
}

