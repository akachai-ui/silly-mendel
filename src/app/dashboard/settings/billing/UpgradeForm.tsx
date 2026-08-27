'use client'

import { useState } from 'react'
import { uploadSlipAction } from './actions'
import { CheckCircle2, Upload, AlertCircle } from 'lucide-react'

export default function UpgradeForm({ shopId }: { shopId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.append('shop_id', shopId)
    formData.append('plan_tier', 'pro')
    formData.append('amount', '390')
    formData.append('months', '1')

    const res = await uploadSlipAction(formData)
    
    if (res.error) {
      setError(res.error)
    } else if (res.success) {
      setSuccess(true)
    }
    
    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-emerald-900 mb-2">แจ้งชำระเงินสำเร็จ!</h3>
        <p className="text-emerald-700 text-sm">เราได้รับสลิปของคุณแล้ว ระบบจะทำการตรวจสอบและต่ออายุการใช้งานให้ภายใน 1-2 ชั่วโมงครับ</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
          กลับสู่หน้าแพ็กเกจ
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900 mb-6">ต่ออายุการใช้งานแพลตฟอร์ม 🚀</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Payment Details */}
        <div className="flex-1 space-y-4">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <p className="text-sm text-zinc-500 mb-1">ยอดที่ต้องชำระ (แพ็กเกจรายเดือน)</p>
            <p className="text-3xl font-extrabold text-zinc-900">฿390 <span className="text-base font-normal text-zinc-500">/ เดือน</span></p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-zinc-900">โอนเงินเข้าบัญชีพร้อมเพย์ (PromptPay):</p>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-center">
              <p className="font-bold text-blue-800 text-lg mb-2">พร้อมเพย์ (PromptPay)</p>
              
              {/* Dynamic QR Code from promptpay.io */}
              <div className="flex justify-center mb-3">
                <img 
                  src="https://promptpay.io/0924797666/390.png" 
                  alt="PromptPay QR Code 390 THB" 
                  className="w-48 h-48 object-contain rounded-lg border border-zinc-200 shadow-sm bg-white p-2"
                />
              </div>

              <p className="text-2xl font-mono tracking-widest text-zinc-900 my-1">0924797666</p>
              <p className="text-sm text-zinc-500">นายเอกชัย หาบ้านแท่น</p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">แนบหลักฐานการโอนเงิน (สลิป)</label>
              
              <label className="cursor-pointer block relative">
                <input 
                  type="file" 
                  name="slip_file" 
                  accept="image/*" 
                  required 
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className={`w-full aspect-[3/4] sm:aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${preview ? 'border-zinc-200' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50'}`}>
                  {preview ? (
                    <img src={preview} alt="Slip preview" className="w-full h-full object-contain bg-zinc-900" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                      <span className="text-sm font-medium text-zinc-600">คลิกเพื่ออัปโหลดสลิป</span>
                      <span className="text-xs text-zinc-400 mt-1">รองรับ JPG, PNG</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting || !preview}
              className="w-full h-12 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการชำระเงิน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
