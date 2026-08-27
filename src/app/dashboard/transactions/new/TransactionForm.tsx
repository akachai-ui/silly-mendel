'use client'
import { useState } from 'react'
import { addTransaction } from '../actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, CalendarClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'

export default function TransactionForm({ staffList, servicesList, pendingAppointments = [], dict }: { staffList: any[], servicesList: any[], pendingAppointments?: any[], dict: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [serviceName, setServiceName] = useState<string>('')
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const router = useRouter()

  const handleSelectAppointment = (apt: any) => {
    if (selectedAppointmentId === apt.id) {
      // Deselect
      setSelectedAppointmentId(null)
      setServiceName('')
      setSelectedStaffId('')
      setAmount('')
      setSelectedServices([])
    } else {
      setSelectedAppointmentId(apt.id)
      
      if (apt.service_name) {
        setServiceName(apt.service_name)
        
        // Auto-calculate price based on matched standard services
        const serviceNames = apt.service_name.split(' + ')
        let calculatedTotal = 0
        let matchedServices: any[] = []
        
        serviceNames.forEach((name: string) => {
          const found = servicesList.find((s: any) => s.name === name.trim())
          if (found) {
            calculatedTotal += Number(found.price || 0)
            matchedServices.push(found)
          }
        })
        
        if (calculatedTotal > 0) {
          setAmount(calculatedTotal.toString())
          setSelectedServices(matchedServices)
        } else {
          setAmount('')
          setSelectedServices([])
        }
      } else {
        setAmount('')
        setSelectedServices([])
      }

      if (apt.staff_id) setSelectedStaffId(apt.staff_id)
    }
  }

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaffId) {
      toast.error(dict.error_no_staff)
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(dict.error_invalid_amount)
      return
    }
    setIsModalOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false)
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('staff_id', selectedStaffId)
    formData.append('service_name', serviceName)
    formData.append('payment_method', paymentMethod)
    if (selectedAppointmentId) {
      formData.append('appointment_id', selectedAppointmentId)
    }
    
    const result = await addTransaction(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success(dict.success_save)
      router.push('/dashboard')
    }
  }

  const selectedStaffName = staffList.find(s => s.id === selectedStaffId)?.name

  return (
    <>
      <form onSubmit={handlePreSubmit} className="space-y-6 sm:space-y-8 mt-6">
        
        {/* เลือกคิวที่จองไว้ (ถ้ามี) */}
        {pendingAppointments && pendingAppointments.length > 0 && (
          <div>
            <label className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-500" />
              {dict.select_queue}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {pendingAppointments.map(apt => {
                const isSelected = selectedAppointmentId === apt.id
                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => handleSelectAppointment(apt)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'}`}
                  >
                    <div className="text-sm font-bold flex items-center gap-2">
                      {apt.appointment_time.slice(0, 5)} 
                      <span className={isSelected ? 'text-zinc-300' : 'text-zinc-400'}>|</span> 
                      {apt.customer_name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {/* 0. ปุ่มบริการด่วน (เลือกได้หลายอัน) */}
        {servicesList && servicesList.length > 0 && (
          <div>
            <p className="text-zinc-900 font-bold mb-3 px-1">{dict.quick_menu}</p>
            <div className="flex flex-wrap gap-2.5 pb-2">
              {servicesList.map(svc => {
                const isSelected = selectedServices.some(s => s.id === svc.id)
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      let updated: any[] = []
                      if (isSelected) {
                        updated = selectedServices.filter(s => s.id !== svc.id)
                      } else {
                        updated = [...selectedServices, svc]
                      }
                      setSelectedServices(updated)
                      
                      const newTotal = updated.reduce((sum, s) => sum + Number(s.price || 0), 0)
                      setAmount(newTotal > 0 ? newTotal.toString() : '')
                      setServiceName(updated.map(s => s.name).join(' + '))
                    }}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm border ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 scale-105'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {svc.name} ฿{svc.price}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 1. ใส่ยอดเงิน */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-sm text-center relative overflow-hidden">
          <p className="text-zinc-400 font-medium mb-2">{dict.revenue_amount}</p>
          {serviceName && (
             <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-4 animate-in fade-in zoom-in">
               {serviceName}
             </span>
          )}
          <div className="flex items-center justify-center">
            <span className="text-4xl text-zinc-600 font-bold mr-2 select-none">฿</span>
            <input 
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setServiceName('')
                setSelectedServices([]) // เคลียร์เมนูด่วนถ้ามีการพิมพ์แก้เลขเอง
              }}
              placeholder="0"
              required
              min="1"
              autoFocus
              className="text-6xl sm:text-7xl font-bold text-zinc-900 bg-transparent w-full max-w-[280px] focus:outline-none placeholder:text-zinc-200 text-center"
            />
          </div>
        </div>

        {/* 2. เลือกช่าง */}
        <div>
          <p className="text-zinc-900 font-bold mb-4 px-1">{dict.select_staff}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {staffList.map(staff => {
              const isSelected = selectedStaffId === staff.id
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`relative flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${isSelected ? 'border-zinc-900 bg-zinc-50 shadow-md scale-105' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'}`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-zinc-900 animate-in zoom-in duration-200">
                      <CheckCircle2 className="w-6 h-6 fill-zinc-900 text-zinc-900 shadow-sm rounded-full" />
                    </div>
                  )}
                  {staff.image_url ? (
                    <img src={staff.image_url} alt={staff.name} className="w-16 h-16 rounded-full object-cover shadow-sm mb-3 border border-zinc-200" />
                  ) : (
                    <div className="w-16 h-16 bg-zinc-200 text-zinc-400 rounded-full flex items-center justify-center font-bold text-2xl mb-3 shadow-sm border border-zinc-200">
                      {staff.name.charAt(0)}
                    </div>
                  )}
                  <span className={`font-bold text-lg ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>{staff.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. วิธีการชำระเงิน */}
        <div>
          <p className="text-zinc-900 font-bold mb-4 px-1">{dict.payment_method}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === 'cash' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              💵 {dict.cash}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all ${
                paymentMethod === 'transfer' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              📱 {dict.transfer}
            </button>
          </div>
        </div>

        {/* 4. ปุ่มบันทึก */}
        <div className="mt-8 pt-4 pb-12 sm:pb-0">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-lg active:scale-95"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dict.save_bill}
          </button>
        </div>
      </form>

      <ConfirmModal 
        isOpen={isModalOpen}
        title={dict.confirm_title}
        description={`${dict.confirm_desc} ฿${amount ? parseFloat(amount).toLocaleString() : 0} ${dict.confirm_desc_to} ${selectedStaffName || ''} ${dict.confirm_desc_end}`}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmText={dict.confirm_btn}
      />
    </>
  )
}


