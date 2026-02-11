import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Verificar si la ruta es para actualizar la contraseña y tiene un token
  const isPasswordReset =
    req.nextUrl.pathname === "/actualizar-contrasena" &&
    (req.nextUrl.searchParams.has("token") || req.nextUrl.searchParams.has("code"))

  // Si es una ruta de restablecimiento de contraseña con token, permitir el acceso
  if (isPasswordReset) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          })
          res.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/retos") ||
      req.nextUrl.pathname.startsWith("/salas") ||
      req.nextUrl.pathname.startsWith("/ranking") ||
      req.nextUrl.pathname.startsWith("/perfil") ||
      req.nextUrl.pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Si el usuario está autenticado pero trata de acceder al panel de administración sin ser admin
  if (session && req.nextUrl.pathname.startsWith("/admin")) {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      // Si hay un error o el usuario no es admin, redirigir al dashboard
      if (error || !profile || profile.role !== "admin") {
        // En lugar de redirigir a acceso-denegado, redirigimos al dashboard
        // para evitar problemas de hidratación
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    } catch (error) {
      // En caso de error, redirigir a una página segura
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/retos/:path*",
    "/salas/:path*",
    "/ranking/:path*",
    "/perfil/:path*",
    "/admin/:path*",
    "/actualizar-contrasena",
  ],
}
