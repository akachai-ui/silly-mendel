'use client'

import { useState, useRef } from 'react'
import { updateShopProfile, removeLogo } from './actions'
import { toast } from 'sonner'
import { Loader2, Store, Upload, Camera, Building2, Phone, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsForm({ initialShop, dict }: { initialShop: any, dict: any }) {
  const [shop, setShop] = useState<any>(initialShop)
  const [isSaving, setIsSaving] = useState(false)
  const [isRemovingLogo, setIsRemovingLogo] = useState(false)
  
  const [name, setName] = useState(initialShop?.name || '')
  const [phone, setPhone] = useState(initialShop?.phone || '')
  const [address, setAddress] = useState(initialShop?.address || '')
  const [logoUrl, setLogoUrl] = useState(initialShop?.logo_url || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = async () => {
    if (!shop?.id) return
    setIsRemovingLogo(true)
    const result = await removeLogo(shop.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(dict.success_save || 'ลบโลโก้เรียบร้อยแล้ว')
      setLogoUrl('')
      setPreviewUrl(null)
      setImageFile(null)
      router.refresh()
    }
    setIsRemovingLogo(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shop) return
    setIsSaving(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('phone', phone)
    formData.append('address', address)
    formData.append('existing_logo_url', logoUrl)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const result = await updateShopProfile(shop.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(dict.success_save || 'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว')
      router.refresh()
    }
    setIsSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 sm:pb-12">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mt-6 mx-4 sm:mx-0">
        
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
          <div className="bg-zinc-900 p-2.5 rounded-2xl text-white shadow-inner">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">{dict.title}</h1>
            <p className="text-sm text-zinc-400 font-medium">{dict.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Logo Upload */}
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 overflow-hidden flex flex-col items-center justify-center transition-all group-hover:border-zinc-500 group-hover:bg-zinc-100">
                  {previewUrl || logoUrl ? (
                    <img src={previewUrl || logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-300 mb-2 group-hover:text-zinc-500 transition-colors" />
                      <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-600 transition-colors">{dict.upload_logo}</span>
                    </>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full border border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900 hover:scale-110 transition-all">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              {(previewUrl || logoUrl) && (
                <button type="button" onClick={handleRemoveLogo} disabled={isRemovingLogo} className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                  {isRemovingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  {dict.remove_logo || 'ลบรูปโลโก้'}
                </button>
              )}
            </div>
            <div className="text-center sm:text-left flex flex-col justify-center">
              <h3 className="font-bold text-zinc-900 mb-1">{dict.logo_title}</h3>
              <p className="text-sm text-zinc-400" dangerouslySetInnerHTML={{ __html: dict.logo_desc }}></p>
            </div>
            <input type="file" name="image" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
          </div>

          <hr className="border-zinc-100" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" /> {dict.shop_name} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="text-zinc-900 w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" /> {dict.phone}
              </label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder={dict.phone_ph} 
                className="text-zinc-900 w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-1.5 flex items-center gap-2">
                <Store className="w-4 h-4 text-zinc-400" /> {dict.address}
              </label>
              <textarea 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder={dict.address_ph} 
                rows={3}
                className="text-zinc-900 w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow font-medium resize-none"
              />
            </div>
          </div>

          <div className="pt-4 pb-safe sm:pb-0">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : dict.save_btn}
            </button>
          </div>
        </form>

      </div>

      {/* Subscription Link Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden mt-6 mx-4 sm:mx-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 transition-colors">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-600 shadow-inner shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0z"/><path d="M7 12h10"/><path d="M12 7v10"/></svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 leading-tight">แพ็กเกจและการชำระเงิน</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">จัดการแพ็กเกจ อัปเกรดเป็น Pro และแจ้งโอนเงิน</p>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard/settings/billing')} className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl transition-colors shrink-0">
          จัดการ
        </button>
      </div>
    </div>
  )
}
