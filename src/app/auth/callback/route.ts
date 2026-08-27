import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If error, redirect to login page with error message
  return NextResponse.redirect(`${origin}/login?message=เกิดข้อผิดพลาดในการยืนยันตัวตน`)
}
