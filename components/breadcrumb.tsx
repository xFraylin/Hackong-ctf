"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home, LayoutDashboard, Flag, FolderOpen, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function Breadcrumb() {
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  // Don't show breadcrumb on landing pages
  if (pathname === "/" || pathname === "/login" || pathname === "/registro" || pathname === "/acceso-denegado") {
    return null
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b sticky top-14 z-30">
      <div className="container flex h-10 items-center">
        <nav className="flex items-center space-x-1 text-sm">
          <Button variant="ghost" size="sm" asChild className="h-8">
            <Link href="/">
              <Home className="h-4 w-4 mr-1" />
              Inicio
            </Link>
          </Button>

          {!loading && profile && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href={profile.role === "admin" ? "/admin" : "/dashboard"}>
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  {profile.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
              </Button>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/retos">
                  <Flag className="h-4 w-4 mr-1" />
                  Retos
                </Link>
              </Button>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/salas">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Salas
                </Link>
              </Button>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/ranking">
                  <Trophy className="h-4 w-4 mr-1" />
                  Ranking
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
