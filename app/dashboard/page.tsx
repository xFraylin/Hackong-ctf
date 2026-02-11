import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Flag, FolderOpen, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Dashboard() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const { data: solvedChallenges, count: solvedCount } = await supabase
    .from("solved_challenges")
    .select("*", { count: "exact" })
    .eq("profile_id", session.user.id)

  const { data: lastSolvedChallenge } = await supabase
    .from("solved_challenges")
    .select("*, challenges(title)")
    .eq("profile_id", session.user.id)
    .order("solved_at", { ascending: false })
    .limit(1)
    .single()

  const { data: rooms, count: roomsCount } = await supabase
    .from("rooms")
    .select("*", { count: "exact" })
    .eq("is_active", true)

  const { data: challenges, count: challengesCount } = await supabase.from("challenges").select("*", { count: "exact" })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="text-sm text-muted-foreground mb-8">
        Bienvenido, <span className="font-medium text-foreground">{profile?.username}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Puntos</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.points || 0}</div>
            <p className="text-xs text-muted-foreground">Puntos totales acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retos Resueltos</CardTitle>
            <Flag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{solvedCount || 0}</div>
            <p className="text-xs text-muted-foreground">de {challengesCount || 0} disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salas</CardTitle>
            <FolderOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roomsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Salas disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Último Reto</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">
              {lastSolvedChallenge?.challenges?.title || "Ninguno completado"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastSolvedChallenge ? new Date(lastSolvedChallenge.solved_at).toLocaleDateString() : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-primary" />
              Retos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Explora los diferentes retos de seguridad disponibles en la plataforma.
            </p>
            <Link href="/retos">
              <Button className="w-full">Ver Retos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5 text-primary" />
              Salas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Accede a salas temáticas con colecciones de retos relacionados.
            </p>
            <Link href="/salas">
              <Button className="w-full">Ver Salas</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Compite con otros usuarios y comprueba tu posición en el ranking global.
            </p>
            <Link href="/ranking">
              <Button className="w-full">Ver Ranking</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
