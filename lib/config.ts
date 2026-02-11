// Configuración global de la aplicación

// URL base del sitio
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

// Nombre de la aplicación
export const APP_NAME = "Hackong2026 CTF"

// Dominio interno para auth: Supabase exige "email", usamos usuario@ este dominio (no se muestra al usuario)
export const AUTH_INTERNAL_EMAIL_DOMAIN = "auth.hackong2026.local"

/** Convierte nombre de usuario al email interno usado en Supabase */
export function usernameToInternalEmail(username: string): string {
  return `${String(username).trim().toLowerCase()}@${AUTH_INTERNAL_EMAIL_DOMAIN}`
}

// Configuración de autenticación
export const AUTH_REDIRECT_URL = `${SITE_URL}/dashboard`
export const PASSWORD_RESET_REDIRECT_URL = `${SITE_URL}/actualizar-contrasena`
