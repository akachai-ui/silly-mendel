'use client'

import { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export default function SubmitButton({ 
  children, 
  loadingText = 'กำลังดำเนินการ...' 
}: { 
  children: ReactNode
  loadingText?: string 
}) {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> 
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
