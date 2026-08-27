'use client'

import { useEffect } from 'react'
import { Printer, ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrintTrigger() {
  const router = useRouter()
  
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 0mm; }
          body { margin: 1cm; }
          .no-print { display: none !important; }
        }
        /* Hide dashboard layout elements so it looks like a standalone document on screen */
        header, nav { display: none !important; }
        main { padding: 0 !important; max-width: none !important; margin: 0 !important; }
      `}} />
      
      {/* Floating Action Bar */}
      <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-zinc-200 z-50">
        <a 
          href="/dashboard/summary"
          className="flex items-center justify-center w-12 h-12 bg-zinc-100 text-zinc-700 rounded-full hover:bg-zinc-200 transition-colors"
          title="กลับ"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 h-12 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-colors shadow-lg"
        >
          <Printer className="w-5 h-5" />
          <span>พิมพ์ / เซฟ PDF</span>
        </button>
      </div>
    </>
  )
}
