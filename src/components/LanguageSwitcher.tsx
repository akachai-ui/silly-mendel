'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function ThaiFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#ED1C24" />
      <rect y="66.67" width="600" height="266.67" fill="#FFFFFF" />
      <rect y="133.33" width="600" height="133.33" fill="#241D4F" />
    </svg>
  )
}

function UKFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
      <clipPath id="uk-clip">
        <path d="M0 0v30h60v-30z"/>
      </clipPath>
      <path d="M0 0v30h60v-30z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#ffffff" strokeWidth="6"/>
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-clip)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30 0v30M0 15h60" stroke="#ffffff" strokeWidth="10"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )
}

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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/80 transition-all text-xs font-bold text-zinc-700 shadow-sm active:scale-95 shrink-0"
      title={currentLang === 'th' ? 'คลิกเพื่อเปลี่ยนเป็น English' : 'Click to switch to ภาษาไทย'}
    >
      {currentLang === 'th' ? (
        <>
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-zinc-300 flex items-center justify-center">
            <ThaiFlag className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-bold text-zinc-800">TH</span>
        </>
      ) : (
        <>
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-zinc-300 flex items-center justify-center">
            <UKFlag className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-bold text-zinc-800">EN</span>
        </>
      )}
    </button>
  )
}
