"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function NewRoom() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<number[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  })

  useState(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase.from("challenges").select("id, title, categories(name)").order("title")

      if (data) setChallenges(data)
    }
    fetchChallenges()
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    })
  }

  const handleChallengeToggle = (challengeId: number) => {
    setSelectedChallenges((prev) => {
      if (prev.includes(challengeId)) {
        return prev.filter((id) => id !== challengeId)
      } else {
        return [...prev, challengeId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        throw new Error("No hay sesión activa")
      }

      // Crear la sala
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          ...formData,
          created_by: session.session.user.id,
        })
        .select()

      if (roomError) {
        throw roomError
      }

      const roomId = roomData[0].id

      // Asociar los retos seleccionados a la sala
      if (selectedChallenges.length > 0) {
        const roomChallenges = selectedChallenges.map((challengeId) => ({
          room_id: roomId,
          challenge_id: challengeId,
        }))

        const { error: relationError } = await supabase.from("room_challenges").insert(roomChallenges)

        if (relationError) {
          throw relationError
        }
      }

      toast({
        title: "Sala creada",
        description: "La sala ha sido creada correctamente",
      })

      router.push("/admin/salas")
    } catch (error: any) {
      toast({
        title: "Error al crear la sala",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Sala</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la sala</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="is_active">Sala activa</Label>
          </div>

          <div className="space-y-2">
            <Label>Retos en esta sala</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`challenge-${challenge.id}`}
                      checked={selectedChallenges.includes(challenge.id)}
                      onChange={() => handleChallengeToggle(challenge.id)}
                      className="rounded border-gray-400 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`challenge-${challenge.id}`} className="text-sm">
                      {challenge.title}
                      {challenge.categories?.name && (
                        <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{challenge.categories.name}</span>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No hay retos disponibles. Crea algunos retos primero.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/salas")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Sala"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
