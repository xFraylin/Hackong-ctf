import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { usernameToInternalEmail } from "@/lib/config"

/**
 * Registro solo con usuario y contraseña (sin correo).
 * Crea el usuario en Supabase con un email interno (usuario@auth.hackong2026.local)
 * ya confirmado, para no enviar correos ni depender de confirmación.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = typeof body.username === "string" ? body.username.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!username) {
      return NextResponse.json(
        { error: "El nombre de usuario es obligatorio" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Variable de entorno faltante"
      console.error("Register API: missing env vars", message)
      return NextResponse.json(
        {
          error: `Configuración incompleta: ${message}`,
        },
        { status: 503 },
      )
    }

    const internalEmail = usernameToInternalEmail(username)

    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { username },
    })

    if (createError) {
      if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
        return NextResponse.json(
          { error: "Ese nombre de usuario ya está en uso" },
          { status: 409 },
        )
      }
      console.error("Error creating user:", createError)
      return NextResponse.json(
        { error: createError.message || "Error al crear la cuenta" },
        { status: 400 },
      )
    }

    if (!user.user?.id) {
      return NextResponse.json(
        { error: "Error al crear la cuenta" },
        { status: 500 },
      )
    }

    // Asegurar que exista el perfil (por si no hay trigger en la BD)
    await supabase.from("profiles").upsert(
      {
        id: user.user.id,
        username,
        role: "user",
        points: 0,
      },
      { onConflict: "id" },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json(
      { error: "Error al procesar el registro" },
      { status: 500 },
    )
  }
}
