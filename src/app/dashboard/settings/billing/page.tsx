import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Crown, CheckCircle2, Clock } from 'lucide-react'
import UpgradeForm from './UpgradeForm'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase.from('shops')
    .select('id, name, plan_tier, plan_status, plan_expires_at')
    .eq('owner_id', user.id)
    .single()
    
  if (!shop) redirect('/dashboard')

  // Check if they have a pending slip
  const { data: pendingSlip } = await supabase.from('payment_slips')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const isPro = shop.plan_tier === 'pro'
  const isExpired = shop.plan_status === 'expired' || (shop.plan_expires_at && new Date(shop.plan_expires_at) < new Date())

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">แพ็กเกจและการชำระเงิน</h1>
          <p className="text-sm text-zinc-400">จัดการแพ็กเกจร้านค้าของคุณ</p>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className={`p-6 rounded-3xl border ${isPro ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-900'} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPro ? 'bg-white/10 text-yellow-400' : 'bg-zinc-100 text-zinc-500'}`}>
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-sm mb-1 ${isPro ? 'text-zinc-400' : 'text-zinc-500'}`}>สถานะแพ็กเกจของคุณ</p>
            <h2 className="text-2xl font-bold mb-2">{isPro ? 'Pro (ใช้งานจริง)' : 'Trial (ทดลองใช้ฟรี)'}</h2>
            
            {shop.plan_expires_at ? (
              <p className={`text-sm ${isPro ? 'text-zinc-300' : 'text-zinc-500'}`}>
                หมดอายุวันที่: <span className={`font-bold ${isPro ? 'text-white' : 'text-zinc-900'}`}>{new Date(shop.plan_expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {isExpired && <span className="ml-2 text-red-500 font-bold">(หมดอายุแล้ว)</span>}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                {!isPro ? 'คุณกำลังอยู่ในช่วงทดลองใช้ฟรี 2 เดือน' : 'ใช้งานได้ปกติ'}
              </p>
            )}
          </div>
        </div>
        
        {!isExpired && (
          <div className={`${isPro ? 'bg-white/10 border-white/20' : 'bg-emerald-50 border-emerald-200 text-emerald-700'} px-4 py-2 rounded-xl text-sm font-medium border`}>
            สถานะ: 🟢 ใช้งานได้ปกติ
          </div>
        )}
        {isExpired && (
          <div className="bg-red-50 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-700">
            สถานะ: 🔴 หมดอายุการใช้งาน
          </div>
        )}
      </div>

      {/* Pending Slip Notification */}
      {pendingSlip && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900">กำลังรอตรวจสอบยอดเงิน</h3>
            <p className="text-sm text-amber-700 mt-1">คุณได้ส่งสลิปแจ้งโอนเงินเรียบร้อยแล้วเมื่อ {new Date(pendingSlip.created_at).toLocaleString('th-TH')} <br/> ระบบจะทำการต่ออายุการใช้งานให้ภายใน 1-2 ชั่วโมงครับ</p>
          </div>
        </div>
      )}

      {/* Upgrade Section */}
      {(!isPro || isExpired) && !pendingSlip && (
        <UpgradeForm shopId={shop.id} />
      )}

    </div>
  )
}
