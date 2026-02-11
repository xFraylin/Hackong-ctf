"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home, LayoutDashboard, Flag, FolderOpen, Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  retos: "Retos",
  salas: "Salas",
  ranking: "Ranking",
  perfil: "Perfil",
  nuevo: "Nuevo",
  nueva: "Nueva",
  editar: "Editar",
  categorias: "Categorías",
  usuarios: "Usuarios",
  "recuperar-contrasena": "Recuperar contraseña",
  "actualizar-contrasena": "Actualizar contraseña",
}

const SEGMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: LayoutDashboard,
  dashboard: LayoutDashboard,
  retos: Flag,
  salas: FolderOpen,
  ranking: Trophy,
  perfil: User,
}

function getSegmentLabel(segment: string, index: number, segments: string[]): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  // IDs (uuid o número): mostrar etiqueta genérica según contexto
  if (index === segments.length - 1 && segments.length > 1) {
    const parent = segments[segments.length - 2]
    if (parent === "retos") return "Reto"
    if (parent === "salas") return "Sala"
    if (parent === "categorias") return "Categoría"
  }
  return segment
}

export function Breadcrumb() {
  const pathname = usePathname()

  if (pathname === "/" || pathname === "/login" || pathname === "/registro" || pathname === "/acceso-denegado") {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)
  const items: { href: string; label: string; segment: string }[] = []
  let href = ""
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    href += `/${segment}`
    items.push({
      href,
      segment,
      label: getSegmentLabel(segment, i, segments),
    })
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border-b sticky top-14 z-30">
      <div className="container flex h-10 items-center">
        <nav className="flex items-center space-x-1 text-sm">
          <Button variant="ghost" size="sm" asChild className="h-8">
            <Link href="/">
              <Home className="h-4 w-4 mr-1" />
              Inicio
            </Link>
          </Button>

          {items.map((item, i) => {
            const Icon = SEGMENT_ICONS[item.segment]
            const isLast = i === items.length - 1
            return (
              <span key={item.href} className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                {isLast ? (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" asChild className="h-8">
                    <Link href={item.href}>
                      {Icon && <Icon className="h-4 w-4 mr-1" />}
                      {item.label}
                    </Link>
                  </Button>
                )}
              </span>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
