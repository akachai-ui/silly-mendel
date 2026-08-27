'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import Link from 'next/link'

export default function GoogleLoginButton({ text = 'เข้าสู่ระบบด้วย Google' }: { text?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  
  async function handleGoogleLogin() {
    if (!agreed) return;
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 🌟 Legal Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
          agreed 
            ? 'bg-zinc-900 border-zinc-900' 
            : 'bg-white border-zinc-300 group-hover:border-zinc-500'
        }`}>
          {agreed && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
        </div>
        
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        
        <p className="text-sm font-medium text-zinc-500 leading-relaxed select-none">
          ข้าพเจ้าได้อ่าน ทำความเข้าใจ และยอมรับ <Link href="/terms" className="text-zinc-900 underline hover:text-zinc-600 transition-colors" onClick={(e) => e.stopPropagation()} target="_blank">เงื่อนไขการให้บริการ</Link> และ <Link href="/privacy" className="text-zinc-900 underline hover:text-zinc-600 transition-colors" onClick={(e) => e.stopPropagation()} target="_blank">นโยบายความเป็นส่วนตัว</Link> ของแพลตฟอร์มแล้ว
        </p>
      </label>

      {/* 🌟 Google Button */}
      <button 
        type="button" 
        onClick={handleGoogleLogin}
        disabled={isLoading || !agreed}
        className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold transition-all duration-200 ${
          agreed 
            ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800 active:scale-[0.98]' 
            : 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed opacity-80'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <div className="bg-white p-1 rounded-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        )}
        {text}
      </button>

    </div>
  )
}
