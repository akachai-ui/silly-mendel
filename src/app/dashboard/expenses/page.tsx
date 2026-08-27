import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ExpensesClient from './ExpensesClient'
import { getDictionary } from '@/utils/i18n'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
  if (!shop) {
    redirect('/onboarding')
  }

  const dict = await getDictionary()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('shop_id', shop.id)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 sm:pb-0">
      <div className="flex items-center gap-4 px-4 sm:px-0">
        <Link href="/dashboard" className="p-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm">
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{dict.expenses?.title || 'รายจ่าย'}</h1>
          <p className="mt-1 text-sm text-zinc-400 font-medium">{dict.expenses?.subtitle || 'บันทึกรายจ่ายของร้าน'}</p>
        </div>
      </div>

      <div className="px-4 sm:px-0 max-w-2xl mx-auto">
        <ExpensesClient initialExpenses={expenses || []} dict={dict.expenses} />
      </div>
    </div>
  )
}
