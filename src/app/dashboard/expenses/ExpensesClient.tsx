'use client'

import { useState } from 'react'
import { addExpense, deleteExpense, updateExpense } from './actions'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Edit2, Calendar, Tags, FileText, DollarSign, Receipt } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'
import { useRouter } from 'next/navigation'

export default function ExpensesClient({ initialExpenses, dict }: { initialExpenses: any[], dict?: any }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const availableMonths = Array.from(new Set(initialExpenses.map(exp => exp.expense_date?.substring(0, 7) || ''))).filter(Boolean).sort().reverse()
  const currentMonthStr = new Date().toISOString().substring(0, 7)
  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths.includes(currentMonthStr) ? currentMonthStr : (availableMonths[0] || currentMonthStr)
  )

  const filteredExpenses = initialExpenses.filter(exp => exp.expense_date?.startsWith(selectedMonth))
  const totalInMonth = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)

  const router = useRouter()

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    // Auto switch to the month of the newly added/edited expense
    const expDate = formData.get('expense_date') as string
    if (expDate) {
      setSelectedMonth(expDate.substring(0, 7))
    }

    if (editingExpense) {
      const res = await updateExpense(editingExpense.id, formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(dict?.success_update || 'อัปเดตรายจ่ายสำเร็จ')
        setEditingExpense(null)
        router.refresh()
      }
    } else {
      const res = await addExpense(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(dict?.success_save || 'บันทึกรายจ่ายสำเร็จ')
        setIsAdding(false)
        router.refresh()
      }
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const res = await deleteExpense(deletingId)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(dict?.success_delete || 'ลบรายจ่ายสำเร็จ')
      setDeletingId(null)
      router.refresh()
    }
    setIsDeleting(false)
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'rent': return dict?.cat_rent || 'ค่าเช่า/สถานที่'
      case 'utilities': return dict?.cat_utilities || 'ค่าน้ำ/ค่าไฟ/เน็ต'
      case 'supplies': return dict?.cat_supplies || 'ค่าอุปกรณ์/น้ำยา'
      case 'marketing': return dict?.cat_marketing || 'ค่าการตลาด/โฆษณา'
      case 'other': return dict?.cat_other || 'อื่นๆ'
      default: return cat
    }
  }

  return (
    <div className="space-y-6">
      
      {!isAdding && !editingExpense && (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-zinc-900 text-white border-2 border-zinc-900 py-4 rounded-2xl text-base font-bold shadow-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {dict?.add_expense || '+ เพิ่มรายจ่าย'}
        </button>
      )}

      {(isAdding || editingExpense) && (
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <h2 className="font-bold text-zinc-900 text-lg mb-4">
            {editingExpense ? (dict?.edit_title || 'แก้ไขรายจ่าย') : (dict?.add_title || 'เพิ่มรายจ่ายใหม่')}
          </h2>
          <form key={editingExpense ? editingExpense.id : 'new'} onSubmit={handleAddSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {dict?.date || 'วันที่'}</label>
                <input type="date" name="expense_date" required defaultValue={editingExpense ? new Date(editingExpense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> {dict?.amount || 'ยอดเงิน (บาท)'}</label>
                <input type="number" name="amount" required min="1" step="0.01" placeholder="0.00" defaultValue={editingExpense?.amount} className="w-full px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5"><Tags className="w-3.5 h-3.5"/> {dict?.category || 'หมวดหมู่'}</label>
              <select name="category" required defaultValue={editingExpense?.category || 'supplies'} className="w-full px-3 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium appearance-none">
                <option value="supplies">{dict?.cat_supplies || 'ค่าอุปกรณ์/น้ำยา'}</option>
                <option value="utilities">{dict?.cat_utilities || 'ค่าน้ำ/ค่าไฟ/เน็ต'}</option>
                <option value="rent">{dict?.cat_rent || 'ค่าเช่า/สถานที่'}</option>
                <option value="marketing">{dict?.cat_marketing || 'ค่าการตลาด/โฆษณา'}</option>
                <option value="other">{dict?.cat_other || 'อื่นๆ'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> {dict?.description || 'รายละเอียด'}</label>
              <input type="text" name="description" placeholder={dict?.desc_ph || "เช่น ค่าไฟเดือนนี้"} defaultValue={editingExpense?.description || ''} className="w-full px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setIsAdding(false); setEditingExpense(null); }} className="flex-1 py-3 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                ยกเลิก
              </button>
              <button type="submit" disabled={isSaving} className="flex-1 py-3 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingExpense ? (dict?.edit_btn || 'บันทึกการแก้ไข') : (dict?.save_btn || 'บันทึก'))}
              </button>
            </div>

          </form>
        </div>
      )}

      {!isAdding && !editingExpense && initialExpenses.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 mb-4 px-1 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-zinc-900 text-base sm:text-lg">รายการประจำเดือน</h3>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm shrink-0">
              รวม ฿{totalInMonth.toLocaleString()}
            </span>
          </div>
          <div className="relative self-start sm:self-auto">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 appearance-none cursor-pointer"
            >
              {availableMonths.map(m => {
                const [yyyy, mm] = m.split('-')
                const date = new Date(parseInt(yyyy), parseInt(mm) - 1, 1)
                const label = date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })
                return <option key={m} value={m} suppressHydrationWarning>{label}</option>
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* รายการรายจ่าย */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm text-center">
            <Receipt className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <h3 className="text-zinc-900 font-bold mb-1">ไม่มีรายจ่ายในเดือนนี้</h3>
            <p className="text-zinc-400 text-sm">เลือกเดือนอื่นหรือเพิ่มรายจ่ายใหม่</p>
          </div>
        ) : (
          filteredExpenses.map(exp => (
            <div key={exp.id} className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between group relative overflow-hidden transition-all hover:border-zinc-300 gap-2 sm:gap-4">
              
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full shrink-0 max-w-[120px] sm:max-w-none truncate">
                      {getCategoryLabel(exp.category)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-400 font-medium shrink-0" suppressHydrationWarning>
                      {new Date(exp.expense_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 truncate">
                    {exp.description || getCategoryLabel(exp.category)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 sm:gap-2 z-10 shrink-0">
                <div className="text-right">
                  <p className="font-extrabold text-red-600 text-base sm:text-lg" suppressHydrationWarning>
                    ฿{Number(exp.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingExpense(exp)
                      setIsAdding(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="p-1.5 sm:p-2 text-zinc-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title={dict?.edit_btn || "แก้ไข"}
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button 
                    onClick={() => setDeletingId(exp.id)}
                    className="p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title={dict?.actions || "ลบรายจ่าย"}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deletingId}
        title={dict?.confirm_delete || 'ลบรายจ่าย?'}
        description={dict?.confirm_delete_desc || 'คุณต้องการลบรายจ่ายนี้ใช่หรือไม่'}
        isDanger={true}
        confirmText={isDeleting ? '...' : 'ลบทิ้ง'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

    </div>
  )
}
