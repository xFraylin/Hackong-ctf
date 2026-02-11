// Configuración global de la aplicación

// URL base del sitio
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

// Nombre de la aplicación
export const APP_NAME = "xNueve MindSploit"

// Configuración de autenticación
export const AUTH_REDIRECT_URL = `${SITE_URL}/dashboard`
export const PASSWORD_RESET_REDIRECT_URL = `${SITE_URL}/actualizar-contrasena`
