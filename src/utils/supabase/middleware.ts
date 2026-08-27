import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  // ฟังก์ชันช่วยเหลือสำหรับ Redirect พร้อมแนบ Cookie ใหม่ไปด้วย (ป้องกัน session หลุด)
  const redirectWithCookies = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const redirectRes = NextResponse.redirect(url)
    
    // Copy cookies from supabaseResponse to redirectRes
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectRes
  }

  // ถ้ายังไม่ login และพยายามเข้าหน้าอื่นที่ต้องล็อกอิน (เช่น dashboard) -> เด้งไป login
  if (!user && !isAuthRoute && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/onboarding'))) {
    return redirectWithCookies('/login')
  }

  // ถ้า login แล้ว และพยายามเข้าหน้า login/register -> เด้งไป dashboard
  if (user && isAuthRoute) {
    return redirectWithCookies('/dashboard')
  }

  // ป้องกันการเข้า dashboard โดยตรงถ้ายังไม่ได้ตั้งชื่อร้าน (Onboarding)
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return redirectWithCookies('/onboarding')
    }
  }

  return supabaseResponse
}
