import { createShop } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, Store } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (shop) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">ตั้งชื่อร้านของคุณ</h1>
          <p className="text-zinc-400 mt-3 font-medium">คุณสามารถเปลี่ยนชื่อร้านในภายหลังได้</p>
        </div>
        
        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium animate-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
          <form action={createShop} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">ชื่อร้านตัดผม / ซาลอน</label>
              <input 
                name="name" 
                type="text" 
                required 
                placeholder="เช่น เอกบาร์เบอร์ช็อป"
                className="text-zinc-900 w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-lg font-bold transition-shadow"
              />
            </div>
            <div className="pt-2">
              <SubmitButton loadingText="กำลังตั้งค่าระบบ กรุณารอสักครู่...">
                เริ่มต้นใช้งานระบบ
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
