'use client'
import { useState, useRef } from 'react'
import { addStaff, updateStaff } from './actions'
import { toast } from 'sonner'
import { Loader2, ImagePlus } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'
import { useRouter } from 'next/navigation'

export default function StaffForm({ staff, onSuccess, dict }: { staff?: any, onSuccess?: () => void, dict?: any }) {
  const isEdit = !!staff
  const [isLoading, setIsLoading] = useState(false)
  const [wageType, setWageType] = useState(staff?.wage_type || 'percent')
  const [previewImage, setPreviewImage] = useState<string | null>(staff?.image_url || null)
  
  // สถานะสำหรับ Popup
  const [isModalOpen, setIsModalOpen] = useState(false)
  const formDataRef = useRef<FormData | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    }
  }

  // เมื่อกด Submit ให้เก็บข้อมูลฟอร์มไว้ก่อน แล้วเปิด Popup เตือน
  function onPreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    formDataRef.current = new FormData(e.currentTarget)
    setIsModalOpen(true)
  }

  // เมื่อกดยืนยันใน Popup ค่อยทำงานจริง
  async function handleConfirmSubmit() {
    setIsModalOpen(false)
    setIsLoading(true)
    
    if (!formDataRef.current) return
    
    const result = isEdit 
      ? await updateStaff(staff.id, formDataRef.current, staff.image_url)
      : await addStaff(formDataRef.current)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(isEdit ? (dict?.success_edit || 'แก้ไขข้อมูลสำเร็จ!') : (dict?.success_add || 'เพิ่มรายชื่อช่างสำเร็จ!'))
      if (!isEdit) {
        formRef.current?.reset()
        setPreviewImage(null)
        setWageType('percent')
        if (onSuccess) onSuccess()
      } else {
        router.push('/dashboard/staff')
      }
    }
    
    setIsLoading(false)
  }

  const lblAddPic = dict?.upload_photo || 'เพิ่มรูป'
  const lblNamePh = dict?.staff_name_ph || 'ชื่อช่าง (เช่น ช่างเอก)'
  const lblStartDate = 'วันที่เริ่มงาน' // Hardcoded for simplicity if missing from dict
  
  return (
    <>
      <form ref={formRef} onSubmit={onPreSubmit} className="mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          
          <div 
            className="w-24 h-24 sm:w-20 sm:h-20 shrink-0 bg-zinc-50 border border-zinc-300 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 hover:border-zinc-400 transition-all relative overflow-hidden group mx-auto sm:mx-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-zinc-400 group-hover:text-zinc-400 mb-1" />
                <span className="text-[10px] text-zinc-400 font-medium">{lblAddPic}</span>
              </>
            )}
            <input type="file" name="image" accept="image/*" ref={fileInputRef} className="text-zinc-900 hidden" onChange={handleImageChange} />
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input 
                type="text" 
                name="name"
                defaultValue={staff?.name || ''}
                placeholder={lblNamePh} 
                required 
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-zinc-900 placeholder:text-zinc-400"
              />
              <div className="relative w-full">
                <input 
                  type="date" 
                  name="start_date"
                  defaultValue={staff?.start_date || new Date().toISOString().split('T')[0]}
                  required 
                  className="w-full min-w-0 max-w-full appearance-none bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-white block"
                  style={{ WebkitAppearance: 'none' }}
                />
                <span className="absolute right-3 -top-2 bg-white px-1 text-[10px] text-zinc-400">{lblStartDate}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
              <select 
                name="wage_type" 
                value={wageType} 
                onChange={(e) => setWageType(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-zinc-600 text-sm"
              >
                <option value="percent">แบ่งยอด (%)</option>
                <option value="monthly">รายเดือน</option>
                <option value="weekly">รายอาทิตย์</option>
                <option value="daily">รายวัน</option>
              </select>

              {wageType === 'percent' ? (
                <div className="relative w-full sm:w-1/2">
                  <input type="number" step="0.1" name="commission_percent" defaultValue={staff?.commission_percent || ''} placeholder="เช่น 50" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-zinc-900" />
                  <span className="absolute right-4 top-3 text-zinc-400">%</span>
                </div>
              ) : (
                <div className="relative w-full sm:w-1/2">
                  <input type="number" step="1" name="wage_amount" defaultValue={staff?.wage_amount || ''} placeholder="ค่าจ้าง" required className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-zinc-900" />
                  <span className="absolute right-4 top-3 text-zinc-400">฿</span>
                </div>
              )}
            </div>
            
            <textarea
              name="note"
              defaultValue={staff?.note || ''}
              placeholder="หมายเหตุ / ข้อตกลงพิเศษ (ถ้ามี)"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-zinc-900 placeholder:text-zinc-400 resize-none text-sm"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? (dict?.edit || 'อัปเดตข้อมูล') : (dict?.save_btn || 'บันทึกข้อมูลช่าง'))}
        </button>
      </form>

      <ConfirmModal 
        isOpen={isModalOpen}
        title={isEdit ? (dict?.edit_title || "ยืนยันการแก้ไขข้อมูล") : (dict?.add_title || "ยืนยันการเพิ่มช่าง")}
        description={isEdit ? (dict?.edit_subtitle || "คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลช่างนี้ใช่หรือไม่?") : "ตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึกเข้าสู่ระบบ"}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmText={dict?.save_btn || "บันทึกข้อมูล"}
      />
    </>
  )
}

