import { createClient } from "@/lib/supabase/server"
import { UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { revalidatePath } from "next/cache"

export default async function AdminUsers() {
  const supabase = createClient()

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  async function toggleUserRole(userId: string, currentRole: string) {
    "use server"

    const supabase = createClient()
    const newRole = currentRole === "admin" ? "user" : "admin"

    await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

    revalidatePath("/admin/usuarios")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Fecha de registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles && profiles.length > 0 ? (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.username}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                      {profile.role === "admin" ? "Administrador" : "Usuario"}
                    </Badge>
                  </TableCell>
                  <TableCell>{profile.points}</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <form action={toggleUserRole.bind(null, profile.id, profile.role)}>
                      <Button variant="ghost" size="sm" type="submit">
                        <UserCog className="mr-2 h-4 w-4" />
                        Cambiar rol
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
