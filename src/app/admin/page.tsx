import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/utils/admin'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Validate session & Admin role
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user || !isAdminEmail(user.email)) {
    // Non-admins are redirected back to regular dashboard
    redirect('/dashboard')
  }

  // 2. Fetch all shops, staff, transactions, and slips
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { data: shops },
    { data: staffList },
    { data: allTransactions },
    { data: recentTransactions },
    { data: pendingSlips }
  ] = await Promise.all([
    supabase
      .from('shops')
      .select('id, name, logo_url, created_at, plan_tier, plan_status, plan_expires_at, owner_id')
      .order('created_at', { ascending: false }),
    supabase
      .from('staff')
      .select('id, shop_id'),
    supabase
      .from('transactions')
      .select('id, shop_id, amount, created_at'),
    supabase
      .from('transactions')
      .select('id, shop_id, amount, created_at, payment_method, service_name, staff:staff_id(name), shop:shops(name)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('payment_slips')
      .select('id, shop_id, slip_url, amount, status, created_at, shop:shops(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  ])

  const shopList = shops || []
  const txs = allTransactions || []
  const staff = staffList || []

  // 3. Compute per-shop aggregated stats
  const enrichedShops = shopList.map(shop => {
    const shopTxs = txs.filter(t => t.shop_id === shop.id)
    const shopStaff = staff.filter(s => s.shop_id === shop.id)
    const totalRevenue = shopTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0)

    return {
      ...shop,
      staffCount: shopStaff.length,
      txCount: shopTxs.length,
      totalRevenue
    }
  })

  // 4. Compute platform KPIs
  const todayISO = todayStart.toISOString()
  const todayActiveShopIds = new Set(
    txs.filter(t => t.created_at >= todayISO).map(t => t.shop_id)
  )

  const kpi = {
    totalShops: shopList.length,
    activeToday: todayActiveShopIds.size,
    totalBills: txs.length,
    totalRevenue: txs.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    proCount: shopList.filter(s => s.plan_tier === 'pro').length,
    trialCount: shopList.filter(s => s.plan_tier !== 'pro').length,
  }

  return (
    <AdminClient
      shops={enrichedShops}
      pendingSlips={pendingSlips || []}
      recentActivity={recentTransactions || []}
      kpi={kpi}
      adminEmail={user.email || ''}
    />
  )
}
