"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FlagFormProps {
  challengeId: number
  correctFlag: string
  points: number
}

export function FlagForm({ challengeId, correctFlag, points }: FlagFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [flag, setFlag] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!flag.trim()) {
      setError("Por favor, introduce una flag")
      return
    }

    try {
      setLoading(true)

      if (flag.trim() !== correctFlag) {
        setError("La flag introducida no es correcta. Inténtalo de nuevo.")
        setLoading(false)
        return
      }

      // Si llegamos aquí, la flag es correcta
      setSuccess(`¡Flag correcta! Has ganado ${points} puntos.`)

      // Obtener el perfil del usuario
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("No hay sesión activa")
      }

      // Verificar si el reto ya ha sido resuelto
      const { data: existingSolved } = await supabase
        .from("solved_challenges")
        .select("*")
        .eq("profile_id", session.user.id)
        .eq("challenge_id", challengeId)
        .single()

      if (existingSolved) {
        toast({
          title: "Reto ya resuelto",
          description: "Ya has resuelto este reto anteriormente.",
        })
        setLoading(false)
        return
      }

      // Registrar el reto como resuelto
      const { error: solvedError } = await supabase.from("solved_challenges").insert({
        profile_id: session.user.id,
        challenge_id: challengeId,
      })

      if (solvedError) {
        console.error("Error al registrar reto como resuelto:", solvedError)
        throw solvedError
      }

      // Actualizar los puntos del usuario
      const { data: profile } = await supabase.from("profiles").select("points").eq("id", session.user.id).single()

      if (!profile) {
        throw new Error("No se pudo obtener el perfil del usuario")
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points: (profile.points || 0) + points })
        .eq("id", session.user.id)

      if (updateError) {
        console.error("Error al actualizar puntos:", updateError)
        throw updateError
      }

      toast({
        title: "¡Flag correcta!",
        description: `Has ganado ${points} puntos. ¡Felicidades!`,
      })

      // Esperar un momento antes de refrescar para que el usuario vea el mensaje
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error("Error al enviar flag:", error)
      setError(error.message || "Ha ocurrido un error al procesar la flag")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Introduce la flag (ej: CTF{flag_aqui})"
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-500/20 text-green-500 border-green-500/50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
        {loading ? "Verificando..." : "Enviar flag"}
      </Button>
    </form>
  )
}
