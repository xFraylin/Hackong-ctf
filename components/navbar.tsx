"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(data)
      }

      setLoading(false)
    }

    fetchSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)

      if (session) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const isActive = (path: string) => pathname === path

  const NavLinks = () => (
    <>
      <Link
        href="/acerca-de"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive("/acerca-de") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        Acerca de
      </Link>
      <Link
        href="/equipo"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive("/equipo") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        Equipo
      </Link>

      {!loading && !session ? (
        <>
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/registro" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="w-full justify-start md:w-auto">
              Registrarse
            </Button>
          </Link>
        </>
      ) : !loading && session ? (
        <>
          {/* Solo mostrar el enlace de Admin si el usuario tiene rol de administrador */}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/admin") ? "text-primary" : "text-foreground/60"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          )}
          <div className="flex items-center space-x-2">
            <Link href="/perfil" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start md:w-auto">
                Puntos: {profile?.points || 0}
              </Button>
            </Link>
          </div>
        </>
      ) : null}
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="xNueve MindSploit Logo" width={32} height={32} className="h-8 w-auto" />
          <span className="text-lg font-bold text-primary">xNueve MindSploit</span>
        </Link>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavLinks />
        </nav>

        {/* Menú móvil - SOLO visible en móviles */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <SheetTitle>Menú de navegación</SheetTitle>
              <div className="flex flex-col space-y-4 py-4 mt-4">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
