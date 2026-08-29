'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, Users, Wallet, Receipt, ShieldCheck, 
  ArrowLeft, Search, CheckCircle, XCircle, Clock, 
  Sparkles, AlertCircle, ExternalLink, Calendar
} from 'lucide-react'
import { approvePaymentSlip, rejectPaymentSlip, updateShopSubscription } from './actions'
import { toast } from 'sonner'

export default function AdminClient({
  shops,
  pendingSlips,
  recentActivity,
  kpi,
  adminEmail
}: {
  shops: any[]
  pendingSlips: any[]
  recentActivity: any[]
  kpi: {
    totalShops: number
    activeToday: number
    totalBills: number
    totalRevenue: number
    proCount: number
    trialCount: number
  }
  adminEmail: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'shops' | 'slips' | 'activity'>('shops')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Filter shops by search
  const filteredShops = shops.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApproveSlip = async (slipId: string, shopId: string) => {
    setProcessingId(slipId)
    const res = await approvePaymentSlip(slipId, shopId, 30)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('อนุมัติสลิปและอัปเกรดเป็น PRO สำเร็จ (30 วัน)')
    }
    setProcessingId(null)
  }

  const handleRejectSlip = async (slipId: string) => {
    setProcessingId(slipId)
    const res = await rejectPaymentSlip(slipId)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('ปฏิเสธสลิปเรียบร้อย')
    }
    setProcessingId(null)
  }

  const handleQuickExtend = async (shopId: string, shopName: string) => {
    const confirm = window.confirm(`คุณต้องการต่ออายุ PRO ให้ร้าน "${shopName}" ฟรี 30 วัน ใช่หรือไม่?`)
    if (!confirm) return

    setProcessingId(shopId)
    const res = await updateShopSubscription(shopId, 'pro', 'active', 30)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(`ต่ออายุ PRO ให้ "${shopName}" เรียบร้อย`)
    }
    setProcessingId(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* ─── Top Admin Bar ─── */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base leading-none">Lumina Dev Console</h1>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{adminEmail}</p>
            </div>
          </div>

          {/* Mode Switcher: Back to regular Shop */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าร้านของฉัน</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* ─── Pending Slips Notice Banner (if any) ─── */}
        {pendingSlips.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-300 text-sm">มีสลิปโอนเงินรอตรวจสอบ ({pendingSlips.length} รายการ)</h3>
                <p className="text-xs text-amber-400/80 mt-0.5">มีลูกค้าแนบสลิปเพื่อขอต่ออายุหรืออัปเกรดเป็น PRO Plan</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('slips')}
              className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors shrink-0"
            >
              ดูสลิปที่รอตรวจสอบ
            </button>
          </div>
        )}

        {/* ─── KPI Metrics Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Shops */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">ร้านค้าทั้งหมด</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{kpi.totalShops} <span className="text-xs font-medium text-zinc-400">ร้าน</span></p>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRO: {kpi.proCount}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">Trial: {kpi.trialCount}</span>
            </div>
          </div>

          {/* Active Shops Today */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">ใช้งานวันนี้</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{kpi.activeToday} <span className="text-xs font-medium text-zinc-400">ร้าน</span></p>
            <p className="text-[10px] text-zinc-400 mt-2">มีความเคลื่อนไหววันนี้</p>
          </div>

          {/* Total Platform Transactions */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">บิลทั้งหมดในระบบ</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{kpi.totalBills.toLocaleString()} <span className="text-xs font-medium text-zinc-400">บิล</span></p>
            <p className="text-[10px] text-zinc-400 mt-2">ยอดเปิดบิลรวมทุกร้าน</p>
          </div>

          {/* Platform GMV */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">ยอดเงินสะพัดรวม (GMV)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">฿{kpi.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-400 mt-2">เงินหมุนเวียนในระบบ</p>
          </div>
        </div>

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'shops' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>รายชื่อร้านค้าทั้งหมด ({shops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 relative ${
              activeTab === 'slips' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>สลิปรออนุมัติ</span>
            {pendingSlips.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-extrabold flex items-center justify-center">
                {pendingSlips.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'activity' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ฟีดความเคลื่อนไหวล่าสุด</span>
          </button>
        </div>

        {/* ─── TAB 1: Shops Directory ─── */}
        {activeTab === 'shops' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อร้าน หรือ ID ร้านค้า..."
                className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Shops Table / Cards */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-800/60">
              {filteredShops.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-sm">
                  ไม่พบข้อมูลร้านค้าที่ตรงกับคำค้นหา
                </div>
              ) : (
                filteredShops.map((shop) => {
                  const isPro = shop.plan_tier === 'pro'
                  const isExpired = shop.plan_status === 'expired'
                  return (
                    <div key={shop.id} className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Shop Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 rounded-2xl object-cover border border-zinc-800 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/50 text-zinc-300 font-extrabold text-lg flex items-center justify-center shrink-0">
                            {shop.name?.charAt(0) || '💈'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white text-base leading-tight truncate">{shop.name}</p>
                            {isPro ? (
                              <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                PRO PLAN
                              </span>
                            ) : (
                              <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                TRIAL
                              </span>
                            )}
                            {isExpired && (
                              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                EXPIRED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 truncate">
                            ID: <span className="font-mono text-zinc-400">{shop.id}</span>
                            {shop.created_at && (
                              <span> • สมัครเมื่อ {new Date(shop.created_at).toLocaleDateString('th-TH')}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-zinc-400">ช่าง <span className="font-bold text-white">{shop.staffCount || 0}</span> คน</p>
                          <p className="text-xs text-zinc-400 mt-0.5">บิล <span className="font-bold text-white">{shop.txCount || 0}</span> รายการ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">ยอดขายร้านนี้</p>
                          <p className="text-sm font-extrabold text-emerald-400">฿{(shop.totalRevenue || 0).toLocaleString()}</p>
                        </div>

                        {/* Quick Grant PRO Button */}
                        <button
                          onClick={() => handleQuickExtend(shop.id, shop.name)}
                          disabled={processingId === shop.id}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                          title="ต่ออายุ PRO 30 วันฟรี"
                        >
                          {processingId === shop.id ? 'กำลังบันทึก...' : '+ 30 วัน PRO'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: Pending Slips ─── */}
        {activeTab === 'slips' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {pendingSlips.length === 0 ? (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
                <h3 className="font-bold text-white text-base">ไม่มีสลิปรออนุมัติในขณะนี้</h3>
                <p className="text-xs text-zinc-500 mt-1">เมื่อมีร้านค้าแจ้งโอนเงินเพื่ออัปเกรด จะมาแสดงที่หน้านี้ทันที</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSlips.map((slip) => (
                  <div key={slip.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-white text-base">{slip.shop?.name || 'ร้านค้า'}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">ยอดแจ้งโอน: <span className="font-bold text-emerald-400 text-sm">฿{slip.amount?.toLocaleString()}</span></p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">ส่งเมื่อ {new Date(slip.created_at).toLocaleString('th-TH')}</p>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        รอตรวจสอบ
                      </span>
                    </div>

                    {/* Slip Image Preview */}
                    {slip.slip_url && (
                      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 max-h-64 flex items-center justify-center">
                        <a href={slip.slip_url} target="_blank" rel="noreferrer" className="block relative group">
                          <img src={slip.slip_url} alt="Payment Slip" className="max-h-64 object-contain mx-auto" />
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            คลิกเพื่อดูรูปเต็ม <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleRejectSlip(slip.id)}
                        disabled={processingId === slip.id}
                        className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleApproveSlip(slip.id, slip.shop_id)}
                        disabled={processingId === slip.id}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-extrabold transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {processingId === slip.id ? 'กำลังบันทึก...' : '✓ อนุมัติ PRO (30 วัน)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: Recent Activity ─── */}
        {activeTab === 'activity' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-800/60 animate-in fade-in duration-200">
            <div className="p-4 sm:px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">รายการรับเงินล่าสุดจากทุกร้านค้า</h3>
              <span className="text-xs text-zinc-500">20 รายการล่าสุด</span>
            </div>
            {recentActivity.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                ยังไม่มีข้อมูลรายการรับเงินในระบบ
              </div>
            ) : (
              recentActivity.map((tx) => (
                <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {tx.shop?.name || 'ร้านค้า'}
                        {tx.service_name && <span className="text-zinc-400 font-normal text-xs"> • {tx.service_name}</span>}
                      </p>
                      <p className="text-xs text-zinc-500">
                        ช่าง: {tx.staff?.name || '—'} • {new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-white text-base">฿{Number(tx.amount).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tx.payment_method === 'transfer' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {tx.payment_method === 'transfer' ? 'โอน' : 'สด'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  )
}
