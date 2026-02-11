import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Trophy } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function RankingPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Obtener los usuarios con sus emails para poder extraer nombres de usuario
  const { data: users } = await supabase.auth.admin.listUsers()

  // Obtener perfiles con puntos
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, points")
    .order("points", { ascending: false })
    .limit(100)

  // Crear un mapa de ID de usuario a nombre de usuario personalizado
  const userMap = new Map()

  if (users?.users) {
    users.users.forEach((user) => {
      // Extraer el nombre de usuario del email (parte antes del @)
      const username = user.email ? user.email.split("@")[0] : "Usuario"
      userMap.set(user.id, username)
    })
  }

  // Combinar los datos de perfiles con los nombres de usuario personalizados
  const rankingData =
    profiles?.map((profile) => ({
      ...profile,
      displayName: profile.username || userMap.get(profile.id) || "Usuario",
    })) || []

  // Obtener la posición del usuario actual
  let userRank = 0
  if (rankingData.length > 0) {
    userRank = rankingData.findIndex((profile) => profile.id === session.user.id) + 1
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Ranking Global</h1>
      <p className="text-muted-foreground mb-8">
        Compite con otros usuarios y comprueba tu posición en el ranking global.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Tu posición</h2>
        <div className="flex items-center">
          <div className="bg-primary/20 rounded-full p-3 mr-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Posición #{userRank || "N/A"}</p>
            <p className="text-muted-foreground">Sigue resolviendo retos para subir en el ranking</p>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Posición</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankingData.length > 0 ? (
              rankingData.map((profile, index) => (
                <TableRow key={profile.id} className={profile.id === session.user.id ? "bg-primary/10" : ""}>
                  <TableCell className="font-medium">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500">
                        1
                      </span>
                    ) : index === 1 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/20 text-gray-400">
                        2
                      </span>
                    ) : index === 2 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-600">
                        3
                      </span>
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell className={profile.id === session.user.id ? "font-bold" : ""}>
                    {profile.displayName}
                    {profile.id === session.user.id && " (Tú)"}
                  </TableCell>
                  <TableCell className="text-right font-bold">{profile.points} pts</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No hay usuarios en el ranking todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
