import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { revalidatePath } from "next/cache"

export default async function AdminChallenges() {
  const supabase = createClient()

  const { data: challenges } = await supabase
    .from("challenges")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Retos</h1>
        <Link href="/admin/retos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Reto
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges && challenges.length > 0 ? (
              challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">{challenge.id}</TableCell>
                  <TableCell>{challenge.title}</TableCell>
                  <TableCell>{challenge.categories?.name || "Sin categoría"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        challenge.difficulty === "fácil"
                          ? "outline"
                          : challenge.difficulty === "medio"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {challenge.difficulty || "No definida"}
                    </Badge>
                  </TableCell>
                  <TableCell>{challenge.points}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/retos/${challenge.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <form
                        action={async () => {
                          "use server"
                          const supabase = createClient()
                          // Primero eliminar las relaciones en room_challenges
                          await supabase.from("room_challenges").delete().eq("challenge_id", challenge.id)
                          // Luego eliminar los registros de retos resueltos
                          await supabase.from("solved_challenges").delete().eq("challenge_id", challenge.id)
                          // Finalmente eliminar el reto
                          await supabase.from("challenges").delete().eq("id", challenge.id)
                          // Revalidar la página para mostrar los cambios
                          revalidatePath("/admin/retos")
                        }}
                      >
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No hay retos disponibles. ¡Crea tu primer reto!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
