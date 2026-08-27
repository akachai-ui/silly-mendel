'use client'
import { useState } from 'react'
import { updateTransaction, deleteTransaction } from './transactions/actions'
import { toast } from 'sonner'
import { Edit2, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function RecentTransactions({ transactions, staffList }: { transactions: any[], staffList: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingTx, setEditingTx] = useState<any>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editStaffId, setEditStaffId] = useState('')

  const [deletingTx, setDeletingTx] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) return toast.error('ยอดเงินไม่ถูกต้อง')
    setIsSaving(true)
    const result = await updateTransaction(editingTx.id, parseFloat(editAmount), editStaffId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('แก้ไขบิลสำเร็จ')
      setEditingTx(null)
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTransaction(deletingTx.id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('ลบบิลสำเร็จ')
      setDeletingTx(null)
    }
    setIsDeleting(false)
  }

  if (!transactions || transactions.length === 0) return null

  const displayedTransactions = isExpanded ? transactions : transactions.slice(0, 5)
  const hasMore = transactions.length > 5

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mt-6 mx-4 sm:mx-0">
      <div className="px-5 sm:px-7 py-4 border-b border-zinc-200 bg-zinc-50/50">
        <h2 className="font-bold text-zinc-900">ประวัติรับเงินวันนี้ ({transactions.length} รายการ)</h2>
      </div>
      
      <div className="divide-y divide-zinc-100">
        {displayedTransactions.map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-zinc-100 p-2.5 rounded-2xl text-zinc-400 shadow-inner shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-zinc-900 text-lg" suppressHydrationWarning>฿{tx.amount.toLocaleString()}</p>
                  {tx.payment_method === 'transfer' ? (
                    <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">โอน</span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">เงินสด</span>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-400 truncate" suppressHydrationWarning>
                  {tx.staff?.name} {tx.service_name ? `• ${tx.service_name} ` : ''}• {new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button 
                onClick={() => { setEditingTx(tx); setEditAmount(tx.amount.toString()); setEditStaffId(tx.staff_id); }} 
                className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="แก้ไข"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setDeletingTx(tx)} 
                className="p-2 text-zinc-400 hover:text-red-700 hover:bg-red-950\/30 rounded-xl transition-colors"
                title="ลบ"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-4 text-sm font-bold text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 border-t border-zinc-200"
        >
          {isExpanded ? (
            <>ย่อเก็บประวัติ <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>ดูประวัติทั้งหมดอีก {transactions.length - 5} รายการ <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {/* Modal แก้ไขบิล */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-zinc-900">แก้ไขข้อมูลบิล</h3>
            
            <label className="block text-sm font-medium text-zinc-400 mb-2">ยอดเงิน (บาท)</label>
            <input 
              type="number" 
              value={editAmount} 
              onChange={e => setEditAmount(e.target.value)} 
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl mb-5 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900" 
            />
            
            <label className="block text-sm font-medium text-zinc-400 mb-2">ช่างผู้ให้บริการ</label>
            <select 
              value={editStaffId} 
              onChange={e => setEditStaffId(e.target.value)} 
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl mb-8 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
            >
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingTx(null)} 
                className="flex-1 py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการลบ */}
      <ConfirmModal 
        isOpen={!!deletingTx}
        title="ยกเลิกบิลรับเงิน?"
        description={`คุณต้องการลบบิลยอด ฿${deletingTx?.amount?.toLocaleString()} ของ ${deletingTx?.staff?.name} ใช่หรือไม่? ยอดรวมจะถูกหักออกทันที`}
        isDanger={true}
        confirmText={isDeleting ? 'กำลังลบ...' : 'ลบทิ้ง'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  )
}

