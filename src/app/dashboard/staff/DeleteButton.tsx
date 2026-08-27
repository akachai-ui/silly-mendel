'use client'
import { Trash2 } from 'lucide-react'
import { deleteStaff } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal'

export default function DeleteButton({ id, name, imageUrl, dict }: { id: string, name: string, imageUrl: string | null, dict?: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function handleConfirmDelete() {
    setIsModalOpen(false)
    setIsDeleting(true)
    const result = await deleteStaff(id, imageUrl)
    
    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
    } else {
      toast.success(dict?.success_delete || 'ลบข้อมูลสำเร็จ')
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="p-2 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 shrink-0"
        title={dict?.delete_btn || 'ลบ'}
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <ConfirmModal 
        isOpen={isModalOpen}
        title={`${dict?.confirm_delete || 'ยืนยันการลบ'} "${name}"`}
        description={`${dict?.confirm_delete_desc || 'คุณต้องการลบช่าง'} "${name}" ${dict?.confirm_delete_desc2 || 'ใช่หรือไม่?'}`}
        isDanger={true}
        confirmText={dict?.delete_btn || 'ลบทิ้ง'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
