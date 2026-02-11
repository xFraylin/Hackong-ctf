import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get room details
  const { data: room, error: roomError } = await supabase.from("rooms").select("*").eq("id", params.id).single()

  if (roomError || !room) {
    notFound()
  }

  // Get challenges in this room - modified query to properly join with challenges
  const { data: roomChallenges, error: challengesError } = await supabase
    .from("room_challenges")
    .select(`
      challenge_id,
      challenges:challenge_id (
        id, 
        title, 
        description, 
        points, 
        difficulty,
        challenge_type,
        categories:category_id (
          name
        )
      )
    `)
    .eq("room_id", params.id)

  console.log("Room challenges query result:", { roomChallenges, error: challengesError })

  // Get solved challenges for the current user
  const { data: solvedChallenges } = await supabase
    .from("solved_challenges")
    .select("challenge_id")
    .eq("profile_id", session.user.id)

  // Create a set of solved challenge IDs for quick lookup
  const solvedChallengeIds = new Set(solvedChallenges?.map((sc) => sc.challenge_id) || [])

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/salas" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground">{room.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roomChallenges && roomChallenges.length > 0 ? (
          roomChallenges.map((rc) => {
            const challenge = rc.challenges
            if (!challenge) return null

            const isSolved = solvedChallengeIds.has(challenge.id)

            return (
              <Link key={challenge.id} href={`/retos/${challenge.id}`}>
                <Card
                  className={`hover:bg-muted/50 transition-colors cursor-pointer h-full ${
                    isSolved ? "border-green-500/50 bg-green-500/5" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flag className={`mr-2 h-5 w-5 ${isSolved ? "text-green-500" : "text-primary"}`} />
                      {challenge.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {challenge.description?.replace(/<!--[\s\S]*?-->/g, "").substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Badge variant="outline">{challenge.categories?.name || "Sin categoría"}</Badge>
                      <Badge variant="outline">{challenge.difficulty}</Badge>
                    </div>
                    <div className="font-bold text-primary">{challenge.points} pts</div>
                  </CardFooter>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <h2 className="text-xl font-medium mb-2">No hay retos disponibles</h2>
            <p className="text-muted-foreground">Esta sala no tiene retos asignados actualmente.</p>
          </div>
        )}
      </div>
    </div>
  )
}
