import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { revalidatePath } from "next/cache"

export default async function AdminRooms() {
  const supabase = createClient()

  const { data: rooms } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Salas</h1>
        <Link href="/admin/salas/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sala
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.id}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>
                    <Badge variant={room.is_active ? "default" : "secondary"}>
                      {room.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(room.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/salas/${room.id}`}>
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
                          await supabase.from("room_challenges").delete().eq("room_id", room.id)
                          // Luego eliminar la sala
                          await supabase.from("rooms").delete().eq("id", room.id)
                          // Revalidar la página para mostrar los cambios
                          revalidatePath("/admin/salas")
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
                <TableCell colSpan={5} className="text-center py-6">
                  No hay salas disponibles. ¡Crea tu primera sala!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
