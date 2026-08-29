'use client'
import { useState } from 'react'
import { updateTransaction, deleteTransaction } from './transactions/actions'
import { toast } from 'sonner'
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

// ─── Deterministic color from name ───
const AVATAR_COLORS = [
  'bg-violet-600', 'bg-sky-600', 'bg-emerald-600',
  'bg-rose-600', 'bg-amber-600', 'bg-indigo-600',
  'bg-teal-600', 'bg-pink-600',
]
function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

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
    if (result?.error) toast.error(result.error)
    else { toast.success('แก้ไขบิลสำเร็จ'); setEditingTx(null) }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTransaction(deletingTx.id)
    if (result?.error) toast.error(result.error)
    else { toast.success('ลบบิลสำเร็จ'); setDeletingTx(null) }
    setIsDeleting(false)
  }

  if (!transactions || transactions.length === 0) return null

  const displayedTransactions = isExpanded ? transactions : transactions.slice(0, 5)
  const hasMore = transactions.length > 5

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mx-4 sm:mx-0">
      {/* Header */}
      <div className="px-5 sm:px-7 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-zinc-900 text-base">ประวัติรับเงินวันนี้</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{transactions.length} รายการ</p>
        </div>
        {/* Total badge */}
        <span className="bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          ฿{transactions.reduce((s, t) => s + Number(t.amount), 0).toLocaleString()}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-zinc-50">
        {displayedTransactions.map(tx => {
          const staffName = tx.staff?.name || '—'
          const avatarColor = getAvatarColor(staffName)
          return (
            <div key={tx.id} className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-zinc-50/80 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                {/* Staff Avatar */}
                {tx.staff?.image_url ? (
                  <img src={tx.staff.image_url} alt={staffName} className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 shrink-0" />
                ) : (
                  <div className={`w-10 h-10 ${avatarColor} text-white rounded-2xl flex items-center justify-center font-bold text-sm shrink-0`}>
                    {staffName.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-zinc-900" suppressHydrationWarning>
                      ฿{Number(tx.amount).toLocaleString()}
                    </p>
                    {tx.payment_method === 'transfer' ? (
                      <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100">โอน</span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-100">สด</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate" suppressHydrationWarning>
                    {staffName}{tx.service_name ? ` • ${tx.service_name}` : ''} • {new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingTx(tx); setEditAmount(tx.amount.toString()); setEditStaffId(tx.staff_id) }}
                  className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingTx(tx)}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3.5 text-xs font-bold text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 border-t border-zinc-100"
        >
          {isExpanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> ย่อเก็บ</>
            : <><ChevronDown className="w-3.5 h-3.5" /> ดูอีก {transactions.length - 5} รายการ</>
          }
        </button>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-5 text-zinc-900">แก้ไขข้อมูลบิล</h3>

            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">ยอดเงิน (บาท)</label>
            <input
              type="number"
              value={editAmount}
              onChange={e => setEditAmount(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-200 rounded-2xl mb-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
            />

            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">ช่างผู้ให้บริการ</label>
            <select
              value={editStaffId}
              onChange={e => setEditStaffId(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-200 rounded-2xl mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
            >
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setEditingTx(null)} className="flex-1 py-3 rounded-2xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition-colors text-sm">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors text-sm shadow-sm">
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingTx}
        title="ยกเลิกบิลรับเงิน?"
        description={`คุณต้องการลบบิลยอด ฿${deletingTx?.amount?.toLocaleString()} ของ ${deletingTx?.staff?.name} ใช่หรือไม่?`}
        isDanger={true}
        confirmText={isDeleting ? 'กำลังลบ...' : 'ลบทิ้ง'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  )
}
