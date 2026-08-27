'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LanguageSwitcher() {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState('th')

  useEffect(() => {
    // Read current lang from cookie on mount
    const match = document.cookie.match(new RegExp('(^| )lumina_lang=([^;]+)'))
    if (match) {
      setCurrentLang(match[2])
    }
  }, [])

  const toggleLanguage = () => {
    const newLang = currentLang === 'th' ? 'en' : 'th'
    document.cookie = `lumina_lang=${newLang}; path=/; max-age=31536000` // 1 year expiry
    setCurrentLang(newLang)
    
    // Hard refresh to ensure the entire layout (Server Components) re-renders
    window.location.reload()
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-xs font-bold text-zinc-700"
      title="Switch Language (TH/EN)"
    >
      {currentLang.toUpperCase()}
    </button>
  )
}
