import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ServicesClient from './ServicesClient'
import { getDictionary } from '@/utils/i18n'

export default async function ServicesPage() {
  const supabase = await createClient()
  const dict = await getDictionary()
  
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 sm:pb-0">
      
      <div className="flex items-center space-x-3 px-2 sm:px-0">
        <Link href="/dashboard" className="p-2 -ml-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">{dict.services.title}</h1>
          <p className="text-sm text-zinc-400">{dict.services.subtitle}</p>
        </div>
      </div>

      <ServicesClient initialServices={services || []} dict={dict.services} />

    </div>
  )
}
