import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username || username.trim() === "") {
      return NextResponse.json(
        { available: false, error: "El nombre de usuario no puede estar vacío" },
        { status: 400 },
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el nombre de usuario ya existe
    const { data, error } = await supabase.from("profiles").select("id").eq("username", username).limit(1)

    if (error) {
      console.error("Error checking username:", error)
      return NextResponse.json({ available: false, error: "Error al verificar el nombre de usuario" }, { status: 500 })
    }

    // Si no hay datos, el nombre de usuario está disponible
    const available = data.length === 0

    return NextResponse.json({ available })
  } catch (error) {
    console.error("Error in check-username route:", error)
    return NextResponse.json({ available: false, error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
