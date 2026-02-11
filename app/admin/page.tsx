import Link from "next/link"
import { Users, Flag, FolderOpen, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = createClient()

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: challengesCount } = await supabase.from("challenges").select("*", { count: "exact", head: true })

  const { count: roomsCount } = await supabase.from("rooms").select("*", { count: "exact", head: true })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
      <p className="text-muted-foreground mb-8">Gestiona retos, salas y usuarios de la plataforma</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/usuarios">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Usuarios</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{usersCount}</p>
              <CardDescription>Usuarios registrados</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/retos">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Retos</CardTitle>
              <Flag className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{challengesCount}</p>
              <CardDescription>Retos creados</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/salas">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Salas</CardTitle>
              <FolderOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{roomsCount}</p>
              <CardDescription>Salas creadas</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categorias">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Categorías</CardTitle>
              <Settings className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gestionar categorías de retos</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
