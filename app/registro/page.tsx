"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { usernameToInternalEmail } from "@/lib/config"
import { toast } from "@/components/ui/use-toast"

export default function Register() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        // Si hay sesión, obtener el rol del usuario
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).single()

        // Redirigir según el rol
        if (profile?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Error al registrarse")
      }

      const internalEmail = usernameToInternalEmail(formData.username)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password: formData.password,
      })

      if (signInError) {
        throw new Error("Cuenta creada pero falló el acceso. Intenta iniciar sesión.")
      }

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      })

      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id
      const { data: profile } = userId
        ? await supabase.from("profiles").select("role").eq("id", userId).single()
        : { data: null }
      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mostrar un indicador de carga mientras se verifica la sesión
  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Hackong2026 CTF Logo"
            width={64}
            height={64}
            className="mx-auto animate-pulse"
          />
          <p className="mt-4">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-col items-center justify-center min-h-screen py-12">
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center justify-center text-sm font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Image src="/logo.png" alt="Hackong2026 CTF Logo" width={64} height={64} className="mx-auto" />
            <h1 className="text-2xl font-semibold tracking-tight">Crear una cuenta</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus datos para registrarte</p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="usuario123"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
