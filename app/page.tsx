"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Trophy, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      if (data.session) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()
        setProfile(profileData)
      }

      setLoading(false)
    }

    fetchSession()
  }, [supabase])

  const handleStartNow = () => {
    if (session) {
      // Si hay sesión, redirigir según el rol
      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      // Si no hay sesión, redirigir al registro
      router.push("/registro")
    }
  }

  const handleLogin = () => {
    if (session) {
      // Si hay sesión, redirigir según el rol
      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      // Si no hay sesión, redirigir al login
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-8 md:py-16 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="mb-4 md:mb-6">
                <Image
                  src="/logo.png"
                  alt="xNueve MindSploit Logo"
                  width={150}
                  height={150}
                  className="mx-auto w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                  priority
                />
              </div>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Bienvenido a xNueve MindSploit
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Plataforma de Retos de Seguridad
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 text-sm md:text-base lg:text-xl">
                  Pon a prueba tus habilidades en ciberseguridad con nuestros retos CTF.
                  <br className="hidden md:inline" />
                  Resuelve desafíos, gana puntos y compite en el ranking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mt-6">
                <Button size="lg" onClick={handleStartNow} className="w-full sm:w-auto">
                  {session ? "Ir al Dashboard" : "Comenzar ahora"}
                </Button>
                <Button variant="outline" size="lg" onClick={handleLogin} className="w-full sm:w-auto">
                  {session ? "Ir a mi perfil" : "Iniciar sesión"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-8 md:py-16 lg:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4 md:p-6">
                  <Image
                    src="/logo.png"
                    alt="xNueve MindSploit Logo"
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-10 md:h-10"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Retos Variados</h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Explora diferentes categorías de retos de seguridad, desde web hasta criptografía.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4 md:p-6">
                  <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Ranking Global</h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Compite con otros usuarios y comprueba tu posición en el ranking global.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none">
                <div className="rounded-full bg-primary/10 p-4 md:p-6">
                  <FolderOpen className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Salas Exclusivas</h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Accede a salas temáticas con colecciones de retos relacionados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/40 py-4 md:py-6">
        <div className="container flex flex-col items-center justify-center gap-2 md:gap-4 px-4">
          <p className="text-center text-xs md:text-sm text-gray-400">
            © 2023 xNueve MindSploit. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
