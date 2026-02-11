"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Check, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function EditProfilePage() {
  const [username, setUsername] = useState("")
  const [originalUsername, setOriginalUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChanged, setUsernameChanged] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUsername(profile.username || "")
          setOriginalUsername(profile.username || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  // Verificar disponibilidad del nombre de usuario cuando cambia
  useEffect(() => {
    // No verificar si el nombre de usuario no ha cambiado
    if (username === originalUsername) {
      setUsernameAvailable(null)
      setUsernameChanged(false)
      return
    }

    setUsernameChanged(true)

    // No verificar si el nombre de usuario está vacío
    if (!username || username.trim() === "") {
      setUsernameAvailable(false)
      return
    }

    const checkUsernameAvailability = async () => {
      setCheckingUsername(true)
      try {
        const response = await fetch("/api/check-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        })

        const data = await response.json()
        setUsernameAvailable(data.available)
      } catch (error) {
        console.error("Error checking username availability:", error)
        setUsernameAvailable(false)
      } finally {
        setCheckingUsername(false)
      }
    }

    // Debounce para evitar demasiadas solicitudes
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username, originalUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // No permitir guardar si el nombre de usuario no está disponible
    if (usernameChanged && !usernameAvailable) {
      toast({
        title: "Nombre de usuario no disponible",
        description: "Por favor elige otro nombre de usuario.",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
        })
        .eq("id", session.user.id)

      if (error) throw error

      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente.",
      })

      router.push("/perfil")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Shield className="h-12 w-12 text-primary/50" />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-background"></div>
            </div>
          </div>
          <CardTitle className="text-center">Editar Perfil</CardTitle>
          <CardDescription className="text-center">Actualiza tu información de perfil</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="username">Nombre de usuario</Label>
                {usernameChanged && (
                  <div className="flex items-center text-sm">
                    {checkingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : usernameAvailable ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">Disponible</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500">No disponible</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                required
                className={cn(
                  usernameChanged &&
                    (usernameAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : usernameAvailable === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""),
                )}
              />
              {usernameChanged && !usernameAvailable && !checkingUsername && (
                <p className="text-sm text-red-500">Este nombre de usuario ya está en uso. Por favor elige otro.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/perfil")} disabled={updating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updating || (usernameChanged && !usernameAvailable)}>
              {updating ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
