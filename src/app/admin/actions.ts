'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminEmail } from '@/utils/admin'

/**
 * Guard function to ensure only Super Admins can execute these actions
 */
async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user || !isAdminEmail(user.email)) {
    throw new Error('Unauthorized: Admin access required')
  }

  return { supabase, user }
}

/**
 * Approve a subscription payment slip and upgrade the shop to PRO
 */
export async function approvePaymentSlip(slipId: string, shopId: string, daysToAdd: number = 30) {
  try {
    const { supabase } = await ensureAdmin()

    // 1. Calculate new expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + daysToAdd)

    // 2. Update shop plan to PRO
    const { error: shopError } = await supabase
      .from('shops')
      .update({
        plan_tier: 'pro',
        plan_status: 'active',
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', shopId)

    if (shopError) {
      console.error('Failed to update shop plan:', shopError)
      return { error: 'Failed to update shop plan' }
    }

    // 3. Mark payment slip as approved
    const { error: slipError } = await supabase
      .from('payment_slips')
      .update({ status: 'approved' })
      .eq('id', slipId)

    if (slipError) {
      console.error('Failed to update slip status:', slipError)
      return { error: 'Failed to update slip status' }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Server error' }
  }
}

/**
 * Reject a subscription payment slip
 */
export async function rejectPaymentSlip(slipId: string) {
  try {
    const { supabase } = await ensureAdmin()

    const { error } = await supabase
      .from('payment_slips')
      .update({ status: 'rejected' })
      .eq('id', slipId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Server error' }
  }
}

/**
 * Manually update any shop's plan (e.g. give a customer trial extension or grant pro access)
 */
export async function updateShopSubscription(
  shopId: string, 
  planTier: 'trial' | 'pro', 
  planStatus: 'active' | 'expired',
  daysFromNow: number = 30
) {
  try {
    const { supabase } = await ensureAdmin()

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + daysFromNow)

    const { error } = await supabase
      .from('shops')
      .update({
        plan_tier: planTier,
        plan_status: planStatus,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', shopId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Server error' }
  }
}
