"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Flag, FolderOpen, Trophy, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function DashboardNavbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()

        if (session.session) {
          const { data } = await supabase.from("profiles").select("*").eq("id", session.session.user.id).single()
          setProfile(data)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  const NavLinks = () => (
    <>
      {/* Renderizado condicional basado en el estado del cliente */}
      {!loading && profile?.role === "admin" ? (
        <Link
          href="/admin"
          className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
            isActive("/admin") ? "text-primary" : "text-foreground/60"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Admin
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
            isActive("/dashboard") ? "text-primary" : "text-foreground/60"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      )}
      <Link
        href="/retos"
        className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
          isActive("/retos") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Flag className="mr-2 h-4 w-4" />
        Retos
      </Link>
      <Link
        href="/salas"
        className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
          isActive("/salas") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <FolderOpen className="mr-2 h-4 w-4" />
        Salas
      </Link>
      <Link
        href="/ranking"
        className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
          isActive("/ranking") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Ranking
      </Link>
      <Link
        href="/perfil"
        className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
          isActive("/perfil") ? "text-primary" : "text-foreground/60"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <User className="mr-2 h-4 w-4" />
        Perfil
      </Link>
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
        <LogOut className="mr-2 h-4 w-4" />
        Salir
      </Button>
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
        <div className="hidden md:flex flex-1 items-center justify-between ml-8">
          <nav className="flex items-center space-x-6">
            <NavLinks />
          </nav>
        </div>

        {/* Menú móvil */}
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
