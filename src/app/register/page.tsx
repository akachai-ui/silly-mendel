import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import GoogleLoginButton from '@/components/GoogleLoginButton'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-50 px-4">
      
      {/* 🌟 Luxury Soft Glow Background Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-zinc-200/50 blur-[100px] rounded-full opacity-60 animate-pulse duration-[4000ms] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-zinc-200/40 blur-[100px] rounded-full pointer-events-none" />

      {/* 🌟 Entrance Animation for the entire box */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mx-auto mb-2 relative">
            <img src="/lumina-log1.png" alt="Lumina Logo" className="h-40 sm:h-48 w-auto max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-700 tracking-tight">สมัครสมาชิกฟรี</h1>
          <p className="text-zinc-400 text-sm mt-1.5 font-medium tracking-wide">ยกระดับการบริหารธุรกิจซาลอนของคุณวันนี้</p>
        </div>
        
        {message && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium animate-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{message}</p>
          </div>
        )}
        
        {/* 🌟 Glassmorphism Container */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-white/60">
          
          <div className="py-2">
            <GoogleLoginButton text="เข้าสู่ระบบด้วย Google" />
          </div>

        </div>
      </div>
    </div>
  )
}
