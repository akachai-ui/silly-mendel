'use client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({ name = 'password', placeholder = '••••••••', minLength }: { name?: string, placeholder?: string, minLength?: number }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input 
        name={name}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 font-medium placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow pr-12"
      />
      <button 
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}
