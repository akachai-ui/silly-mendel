import { cookies } from 'next/headers'

// In a real app, you might want these to be dynamic imports if the dicts get huge
import th from '@/dictionaries/th.json'
import en from '@/dictionaries/en.json'

const dictionaries = {
  th,
  en,
}

export type SupportedLocale = keyof typeof dictionaries

export const getDictionary = async () => {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lumina_lang')?.value as SupportedLocale) || 'th'
  
  return dictionaries[lang] || dictionaries.th
}
