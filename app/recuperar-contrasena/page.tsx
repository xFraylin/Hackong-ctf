"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Por favor, ingresa tu dirección de email",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Obtener la URL base del sitio
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/actualizar-contrasena`,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      toast({
        title: "Email enviado",
        description: "Se ha enviado un enlace para restablecer tu contraseña a tu dirección de email",
      })
    } catch (error: any) {
      console.error("Error al enviar el email de recuperación:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al enviar el email de recuperación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-col items-center justify-center min-h-screen py-12">
        <Link
          href="/login"
          className="absolute top-4 left-4 inline-flex items-center justify-center text-sm font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Image src="/logo.png" alt="xNueve MindSploit Logo" width={64} height={64} className="mx-auto" />
            <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {success ? (
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md">
              <p className="text-green-800 dark:text-green-200 text-center">
                Se ha enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>. Por favor, revisa tu
                bandeja de entrada y sigue las instrucciones.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center text-sm">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
