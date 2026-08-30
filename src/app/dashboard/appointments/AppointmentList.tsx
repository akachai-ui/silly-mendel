'use client'
import { useState } from 'react'
import { updateAppointmentStatus, deleteAppointment, updateAppointmentDetails } from './actions'
import { toast } from 'sonner'
import { Clock, CheckCircle, XCircle, Phone, Edit2, Trash2, Loader2, Check, X } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

export default function AppointmentList({ appointments, staffList, servicesList, dict }: { appointments: any[], staffList: any[], servicesList: any[], dict?: any }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const [deletingApt, setDeletingApt] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [editingApt, setEditingApt] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [visibleCount, setVisibleCount] = useState(10)

  const handleStatusChange = async (id: string, status: string) => {
    setLoadingId(id)
    const res = await updateAppointmentStatus(id, status)
    if (res?.error) toast.error(res.error)
    else toast.success(dict?.success_save || 'อัปเดตสถานะคิวสำเร็จ')
    setLoadingId(null)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteAppointment(deletingApt.id)
    if (res?.error) toast.error(res.error)
    else {
      toast.success(dict?.cancel_queue ? `${dict.cancel_queue} สำเร็จ` : 'ลบคิวสำเร็จ')
      setDeletingApt(null)
    }
    setIsDeleting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateAppointmentDetails(editingApt.id, formData)
    if (res?.error) toast.error(res.error)
    else {
      toast.success(dict?.success_save || 'แก้ไขข้อมูลคิวสำเร็จ')
      setEditingApt(null)
    }
    setIsSaving(false)
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm text-center">
        <p className="text-zinc-400 font-medium">{dict?.no_queues || 'ยังไม่มีคิวจองล่วงหน้า'}</p>
      </div>
    )
  }

  const displayedAppointments = appointments.slice(0, visibleCount)
  const hasMore = appointments.length > visibleCount

  const getLocalYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const todayStr = getLocalYMD(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalYMD(tomorrow);

  const formatGroupDate = (dateString: string) => {
    if (dateString === todayStr) return 'วันนี้';
    if (dateString === tomorrowStr) return 'พรุ่งนี้';
    
    return new Date(dateString).toLocaleDateString('th-TH', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // จัดกลุ่มคิวตามวันที่
  const groupedAppointments = displayedAppointments.reduce((acc, apt) => {
    const date = apt.appointment_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      {Object.keys(groupedAppointments).map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200"></div>
            <h3 className="font-extrabold text-zinc-900 text-lg px-2" suppressHydrationWarning>
              {formatGroupDate(dateKey)}
            </h3>
            <div className="h-px flex-1 bg-zinc-200"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {groupedAppointments[dateKey].map((apt: any) => {
              const isCompleted = apt.status === 'completed'
              const isCancelled = apt.status === 'cancelled'
              return (
                <div key={apt.id} className={`bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm transition-all relative group overflow-hidden flex flex-col justify-between ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                  
                  {/* Color accent line based on status */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-emerald-500' : isCancelled ? 'bg-red-500' : 'bg-indigo-500'}`}></div>

                  <div>
                    <div className="flex justify-between items-start pl-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-lg mb-0.5">
                          <Clock className="w-4 h-4" />
                          {apt.appointment_time.slice(0, 5)} {dict?.time ? '' : 'น.'}
                        </div>
                        <h3 className="font-bold text-zinc-900 text-sm leading-tight truncate pr-2">{apt.customer_name}</h3>
                        {apt.customer_phone && (
                          <a href={`tel:${apt.customer_phone}`} className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate">
                            <Phone className="w-3 h-3 shrink-0" /> {apt.customer_phone}
                          </a>
                        )}
                      </div>
                      
                      {/* ปุ่มแก้ไข / ลบ */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => setEditingApt(apt)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white" title={dict?.actions || "แก้ไข"}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingApt(apt)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white" title={dict?.cancel_queue || "ลบ"}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pl-2 mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        👤 {apt.staff?.name}
                      </span>
                      {apt.service_name && (
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                          ✂️ {apt.service_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* สถานะ และ การเปลี่ยนสถานะ */}
                  <div className="pl-2 mt-4 pt-3 border-t border-zinc-100">
                    {apt.status === 'pending' && (
                      <div className="space-y-2">
                        {/* Auto Bill Button */}
                        <a
                          href={`/dashboard/transactions/new?staff_id=${apt.staff_id || ''}&service=${encodeURIComponent(apt.service_name || '')}&customer=${encodeURIComponent(apt.customer_name || '')}&apt_id=${apt.id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                          เสร็จ → เปิดบิลรับเงิน
                        </a>
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusChange(apt.id, 'completed')} disabled={loadingId === apt.id} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm text-center">
                            {dict?.completed || 'เสร็จ (ไม่เปิดบิล)'}
                          </button>
                          <button onClick={() => handleStatusChange(apt.id, 'cancelled')} disabled={loadingId === apt.id} className="flex-1 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors shadow-sm text-center">
                            {dict?.cancel_queue || 'ยกเลิก'}
                          </button>
                        </div>
                      </div>
                    )}
                    {isCompleted && <span className="inline-flex px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold items-center gap-1.5 w-full justify-center"><CheckCircle className="w-3.5 h-3.5"/> {dict?.completed || 'ลูกค้ามาใช้บริการแล้ว'}</span>}
                    {isCancelled && <span className="inline-flex px-2 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold items-center gap-1.5 w-full justify-center"><XCircle className="w-3.5 h-3.5"/> {dict?.cancelled || 'ยกเลิกคิวแล้ว'}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <button 
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full py-4 bg-white border border-zinc-200 rounded-3xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm mt-4"
        >
          {dict?.load_more || `โหลดข้อมูลคิวเพิ่มเติม (${appointments.length - visibleCount} รายการ)`}
        </button>
      )}

      {/* Modal ลบคิว */}
      <ConfirmModal 
        isOpen={!!deletingApt}
        title={`${dict?.cancel_queue || 'ลบคิว'} ?`}
        description={`${deletingApt?.customer_name} - ${deletingApt?.appointment_date}`}
        isDanger={true}
        confirmText={isDeleting ? '...' : (dict?.cancel_queue || 'ลบทิ้ง')}
        onConfirm={handleDelete}
        onCancel={() => setDeletingApt(null)}
      />

      {/* Modal แก้ไขคิว */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <h3 className="text-xl font-bold mb-6 text-zinc-900">{dict?.actions || 'แก้ไขข้อมูลคิว'}</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.date || 'วันที่'}</label>
                  <input type="date" name="appointment_date" defaultValue={editingApt.appointment_date} required className="text-zinc-900 w-full min-w-0 px-3 py-2.5 text-sm sm:text-base border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.time || 'เวลา'}</label>
                  <input type="time" name="appointment_time" defaultValue={editingApt.appointment_time} required className="text-zinc-900 w-full min-w-0 px-3 py-2.5 text-sm sm:text-base border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.customer_name || 'ชื่อลูกค้า'}</label>
                <input type="text" name="customer_name" defaultValue={editingApt.customer_name} required className="text-zinc-900 w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.phone || 'เบอร์โทรติดต่อ'}</label>
                <input type="tel" name="customer_phone" defaultValue={editingApt.customer_phone || ''} className="text-zinc-900 w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.staff || 'ช่าง'}</label>
                <select name="staff_id" defaultValue={editingApt.staff_id} required className="text-zinc-900 w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium bg-white">
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1.5">{dict?.service || 'บริการ'}</label>
                <input type="text" name="service_name" defaultValue={editingApt.service_name || ''} className="text-zinc-900 w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingApt(null)} className="flex-1 py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors">
                  {dict?.cancelled || 'ยกเลิก'}
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (dict?.save_btn || 'บันทึก')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
