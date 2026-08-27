'use client'

export default function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  onConfirm, 
  onCancel,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  isDanger = false
}: { 
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-950\/30 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
          {isDanger ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
        <p className="text-sm text-zinc-400 mt-2">{description}</p>
        
        <div className="mt-8 flex space-x-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors shadow-sm ${isDanger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
