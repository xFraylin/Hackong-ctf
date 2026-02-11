import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { revalidatePath } from "next/cache"

export default async function AdminRoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/acceso-denegado")
  }

  // Get room details
  const { data: room, error: roomError } = await supabase.from("rooms").select("*").eq("id", params.id).single()

  if (roomError || !room) {
    notFound()
  }

  // Get all challenges
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*, categories(name)")
    .order("id", { ascending: true })

  // Get challenges in this room
  const { data: roomChallenges } = await supabase
    .from("room_challenges")
    .select("challenge_id")
    .eq("room_id", params.id)

  // Create a set of challenge IDs in this room for quick lookup
  const roomChallengeIds = new Set(roomChallenges?.map((rc) => rc.challenge_id) || [])

  // Function to toggle a challenge in a room
  async function toggleChallengeInRoom(formData: FormData) {
    "use server"

    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      redirect("/acceso-denegado")
    }

    const roomId = formData.get("roomId") as string
    const challengeId = formData.get("challengeId") as string
    const action = formData.get("action") as string

    console.log("Toggle challenge in room:", { roomId, challengeId, action })

    if (action === "add") {
      // Add challenge to room
      const { error } = await supabase.from("room_challenges").insert({ room_id: roomId, challenge_id: challengeId })

      if (error) {
        console.error("Error adding challenge to room:", error)
      }
    } else if (action === "remove") {
      // Remove challenge from room
      const { error } = await supabase
        .from("room_challenges")
        .delete()
        .eq("room_id", roomId)
        .eq("challenge_id", challengeId)

      if (error) {
        console.error("Error removing challenge from room:", error)
      }
    }

    revalidatePath(`/admin/salas/${roomId}`)
    revalidatePath(`/salas/${roomId}`)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Sala: {room.name}</h1>
        <div className="flex gap-2">
          <Link href={`/salas/${room.id}`}>
            <Button variant="outline">Ver Sala</Button>
          </Link>
          <Link href="/admin/salas">
            <Button variant="secondary">Volver</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Sala</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Nombre:</span> {room.name}
              </div>
              <div>
                <span className="font-medium">Descripción:</span> {room.description || "Sin descripción"}
              </div>
              <div>
                <span className="font-medium">Estado:</span>{" "}
                <Badge variant={room.is_active ? "default" : "secondary"}>
                  {room.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Creada:</span>{" "}
                {new Date(room.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retos en la Sala</CardTitle>
            <CardDescription>
              Selecciona los retos que quieres incluir en esta sala. Los cambios se guardan automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {challenges?.map((challenge) => (
                <div key={challenge.id} className="flex items-start space-x-3 p-3 border rounded-md">
                  <form action={toggleChallengeInRoom} id={`form-${challenge.id}`}>
                    <input type="hidden" name="roomId" value={room.id} />
                    <input type="hidden" name="challengeId" value={challenge.id} />
                    <input type="hidden" name="action" value={roomChallengeIds.has(challenge.id) ? "remove" : "add"} />
                    <Checkbox
                      id={`challenge-${challenge.id}`}
                      checked={roomChallengeIds.has(challenge.id)}
                      onCheckedChange={(checked) => {
                        const form = document.getElementById(`form-${challenge.id}`) as HTMLFormElement
                        form.requestSubmit()
                      }}
                    />
                  </form>
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`challenge-${challenge.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {challenge.title}
                    </label>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description?.replace(/<!--[\s\S]*?-->/g, "").substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{challenge.categories?.name || "Sin categoría"}</Badge>
                      <Badge variant="outline">{challenge.difficulty}</Badge>
                      <Badge variant="outline">{challenge.points} pts</Badge>
                      <Badge variant="outline">{challenge.challenge_type === "quiz" ? "Quiz" : "Flag"}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
