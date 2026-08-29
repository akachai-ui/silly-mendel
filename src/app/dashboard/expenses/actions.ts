'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return { error: 'Unauthorized' }

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) return { error: 'Shop not found' }

  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const expense_date = formData.get('expense_date') as string

  if (isNaN(amount) || amount <= 0) return { error: 'จำนวนเงินไม่ถูกต้อง' }
  if (!category) return { error: 'กรุณาเลือกหมวดหมู่' }

  const { error } = await supabase
    .from('expenses')
    .insert({
      shop_id: shop.id,
      amount,
      category,
      description,
      expense_date
    })

  if (error) {
    console.error('Add Expense Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard/summary')
  return { success: true }
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return { error: 'Unauthorized' }

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) return { error: 'Shop not found' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('shop_id', shop.id) // double check security

  if (error) {
    console.error('Delete Expense Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard/summary')
  return { success: true }
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return { error: 'Unauthorized' }

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) return { error: 'Shop not found' }

  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const expense_date = formData.get('expense_date') as string

  if (isNaN(amount) || amount <= 0) return { error: 'จำนวนเงินไม่ถูกต้อง' }
  if (!category) return { error: 'กรุณาเลือกหมวดหมู่' }

  const { error } = await supabase
    .from('expenses')
    .update({
      amount,
      category,
      description,
      expense_date
    })
    .eq('id', expenseId)
    .eq('shop_id', shop.id) // double check security

  if (error) {
    console.error('Update Expense Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/expenses')
  revalidatePath('/dashboard/summary')
  return { success: true }
}
