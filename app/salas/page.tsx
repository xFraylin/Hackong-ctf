import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen } from "lucide-react"

export default async function RoomsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Salas</h1>
      <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-8">
        Accede a salas temáticas con colecciones de retos relacionados.
      </p>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <Link key={room.id} href={`/salas/${room.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <FolderOpen className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                    {room.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs md:text-sm">{room.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-4 md:p-6">
                  <Badge variant="outline" className="text-xs">
                    Sala activa
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8 md:py-12">
            <h2 className="text-lg md:text-xl font-medium mb-2">No hay salas disponibles</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Actualmente no hay salas activas. Vuelve más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
