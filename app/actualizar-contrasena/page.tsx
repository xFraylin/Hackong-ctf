"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function ActualizarContrasena() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatingSession, setValidatingSession] = useState(true)
  const supabase = createClient()

  // Verificar si hay un token de restablecimiento válido
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar si hay un token en la URL
        const hasToken = searchParams.has("token") || searchParams.has("code")

        if (!hasToken) {
          // Si no hay token, verificar si hay una sesión activa
          const { data } = await supabase.auth.getSession()

          if (!data.session) {
            throw new Error("No se ha encontrado un token válido para cambiar la contraseña")
          }
        }

        setValidatingSession(false)
      } catch (error: any) {
        console.error("Error al verificar la sesión:", error.message)
        toast({
          title: "Error",
          description: "No se ha encontrado un token válido para cambiar la contraseña",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    checkSession()
  }, [router, searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      })

      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error al actualizar la contraseña:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (validatingSession) {
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
          <p className="mt-4">Verificando token...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-col items-center justify-center min-h-screen py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Image src="/logo.png" alt="Hackong2026 CTF Logo" width={64} height={64} className="mx-auto" />
            <h1 className="text-2xl font-semibold tracking-tight">Actualizar contraseña</h1>
            <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña</p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
