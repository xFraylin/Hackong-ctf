import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"

export default function RoomNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <FolderOpen className="h-20 w-20 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">Sala no encontrada</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        La sala que estás buscando no existe o no está disponible actualmente.
      </p>
      <Link href="/salas">
        <Button>Ver todas las salas</Button>
      </Link>
    </div>
  )
}
