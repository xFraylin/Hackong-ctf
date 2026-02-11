import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

/**
 * Cliente Supabase con service_role. SOLO usar en el servidor (API routes, server components).
 * Nunca exponer SUPABASE_SERVICE_ROLE_KEY en el cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    const missing = []
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY")
    throw new Error(`Faltan en .env: ${missing.join(", ")}. Reinicia el servidor (pnpm dev) después de guardar el .env.`)
  }
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
