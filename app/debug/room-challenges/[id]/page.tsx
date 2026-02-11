import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"

export default async function DebugRoomChallengesPage({ params }: { params: { id: string } }) {
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

  // Get raw room_challenges data
  const { data: roomChallenges, error: roomChallengesError } = await supabase
    .from("room_challenges")
    .select("*")
    .eq("room_id", params.id)

  // Get challenges data
  const { data: challenges, error: challengesError } = await supabase.from("challenges").select("*")

  // Get joined data
  const { data: joinedData, error: joinedError } = await supabase
    .from("room_challenges")
    .select(`
      room_id,
      challenge_id,
      challenges:challenge_id (*)
    `)
    .eq("room_id", params.id)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Room Challenges: {room.name}</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Room Details</h2>
          <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(room, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Room Challenges Raw Data</h2>
          <p className="text-muted-foreground mb-2">Error: {roomChallengesError?.message || "None"}</p>
          <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(roomChallenges, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">All Challenges</h2>
          <p className="text-muted-foreground mb-2">Error: {challengesError?.message || "None"}</p>
          <p className="text-muted-foreground mb-2">Count: {challenges?.length || 0}</p>
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            {JSON.stringify(challenges?.slice(0, 3), null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Joined Data</h2>
          <p className="text-muted-foreground mb-2">Error: {joinedError?.message || "None"}</p>
          <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(joinedData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
