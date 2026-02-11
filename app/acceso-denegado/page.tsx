"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="bg-destructive/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-8">
          No tienes permisos para acceder a esta sección. Esta área está reservada para administradores del sistema.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button>Ir al Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
