'use client'
import { useState } from 'react'
import { addAppointment } from '../actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const QUICK_TIME_SLOTS = [
  '09:00', '10:00', '10:30', '11:00', '11:30', '12:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '19:00', '20:00'
]

export default function AppointmentForm({ staffList, servicesList, dict }: { staffList: any[], servicesList: any[], dict?: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [appointmentTime, setAppointmentTime] = useState('')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [selectedServices, setSelectedServices] = useState<any[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointmentTime) {
      toast.error('กรุณาเลือกเวลานัดหมาย')
      return
    }
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('customer_name', customerName)
    formData.append('customer_phone', customerPhone)
    formData.append('appointment_date', appointmentDate)
    formData.append('appointment_time', appointmentTime)
    formData.append('staff_id', selectedStaffId)
    formData.append('service_name', serviceName)
    
    const result = await addAppointment(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success(dict?.success_save || 'เพิ่มคิวสำเร็จ!')
      router.push('/dashboard/appointments')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">{dict?.date || 'วันที่'} <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              required 
              value={appointmentDate} 
              onChange={e => setAppointmentDate(e.target.value)} 
              className="text-zinc-900 w-full px-3 py-3 text-sm sm:text-base border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">{dict?.time || 'เวลา'} <span className="text-red-500">*</span></label>
            <input 
              type="time" 
              required 
              value={appointmentTime} 
              onChange={e => setAppointmentTime(e.target.value)} 
              className="text-zinc-900 w-full px-3 py-3 text-sm sm:text-base border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium bg-white" 
            />
          </div>
        </div>

        {/* 📱 ปุ่มลัดเลือกเวลาด่วนสำหรับสมาร์ตโฟน */}
        <div>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">แตะเลือกเวลาด่วน:</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
            {QUICK_TIME_SLOTS.map(slot => {
              const isSelected = appointmentTime === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setAppointmentTime(slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm scale-105'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {slot} น.
                </button>
              )
            })}
          </div>
        </div>
      </div>


      <div>
        <label className="block text-sm font-bold text-zinc-900 mb-2">{dict?.customer_name || 'ชื่อลูกค้า'} <span className="text-red-500">*</span></label>
        <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={dict?.customer_name_ph || "เช่น คุณเอ, พี่บี"} className="text-zinc-900 w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
      </div>

      <div>
        <label className="block text-sm font-bold text-zinc-900 mb-2">{dict?.phone || 'เบอร์โทรติดต่อ'}</label>
        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={dict?.phone_ph || "08X-XXX-XXXX"} className="text-zinc-900 w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
      </div>

      <div>
        <label className="block text-sm font-bold text-zinc-900 mb-3 px-1">{dict?.select_staff || 'เลือกช่างผู้ให้บริการ'} <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {staffList.map(staff => {
            const isSelected = selectedStaffId === staff.id;
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffId(staff.id)}
                className={`relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${isSelected ? 'border-zinc-900 bg-zinc-50 shadow-md scale-105' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-zinc-900 animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-5 h-5 fill-zinc-900 text-zinc-900 shadow-sm rounded-full" />
                  </div>
                )}
                {staff.image_url ? (
                  <img src={staff.image_url} alt={staff.name} className="w-12 h-12 rounded-full object-cover shadow-sm mb-2 border border-zinc-200" />
                ) : (
                  <div className="w-12 h-12 bg-zinc-200 text-zinc-400 rounded-full flex items-center justify-center font-bold text-xl mb-2 shadow-sm border border-zinc-200">
                    {staff.name.charAt(0)}
                  </div>
                )}
                <span className={`font-bold text-sm ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>{staff.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-zinc-900 mb-2 px-1">{dict?.services_req || 'บริการที่จอง'}</label>
        <input type="text" value={serviceName} onChange={e => {
            setServiceName(e.target.value)
            setSelectedServices([]) // Clear selected buttons if typed manually
        }} placeholder={dict?.services_ph || "เช่น ตัดผม + สระผม"} className="text-zinc-900 w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium" />
        
        {servicesList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
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
                      setServiceName(updated.map(s => s.name).join(' + '))
                  }} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                >
                  {isSelected ? '✓ ' : '+ '}{svc.name} ฿{svc.price}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-4 pb-safe sm:pb-0">
        <button type="submit" disabled={isLoading || !selectedStaffId} className="w-full bg-zinc-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm active:scale-95">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (dict?.save_btn || 'บันทึกคิว')}
        </button>
      </div>

    </form>
  )
}

