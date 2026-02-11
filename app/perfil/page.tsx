import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Trophy, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
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
    .select("*, challenges(id, title, points, difficulty, category_id, categories(name))", { count: "exact" })
    .eq("profile_id", session.user.id)
    .order("solved_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
              <p className="text-sm text-muted-foreground">Información de tu cuenta</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="relative w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                  <Shield className="h-16 w-16 text-primary/50" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-background"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre de usuario</p>
                  <p className="font-medium">{profile?.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    Free
                  </div>
                </div>
              </div>

              <Link href="/perfil/editar" passHref>
                <Button variant="outline" className="w-full">
                  Editar perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <p className="text-sm text-muted-foreground">Tu progreso en la plataforma</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Trophy className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">Puntos Totales</h3>
                    <p className="text-3xl font-bold">{profile?.points || 0}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">Retos Resueltos</h3>
                    <p className="text-3xl font-bold">{solvedCount || 0}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">Último Reto Resuelto</h3>
                    <p className="text-lg font-medium">
                      {solvedChallenges && solvedChallenges.length > 0
                        ? "Hace " + formatDate(solvedChallenges[0].solved_at)
                        : "Ninguno todavía"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retos Recientes</CardTitle>
                <p className="text-sm text-muted-foreground">Últimos retos que has resuelto</p>
              </CardHeader>
              <CardContent>
                {solvedChallenges && solvedChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {solvedChallenges.slice(0, 5).map((solved) => (
                      <div
                        key={solved.challenge_id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{solved.challenges?.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              {solved.challenges?.categories?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(solved.solved_at)}</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary">+{solved.challenges?.points}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No has resuelto ningún reto todavía.</p>
                    <Link href="/retos" passHref>
                      <Button variant="outline" className="mt-4">
                        Explorar retos
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
