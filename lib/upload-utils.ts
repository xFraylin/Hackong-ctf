import { createClient } from "@/lib/supabase/client"

export async function uploadChallengeFile(file: File): Promise<string | null> {
  const supabase = createClient()

  try {
    // Crear un nombre de archivo único
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `challenge_files/${fileName}`

    console.log(`Intentando subir archivo: ${fileName} (${Math.round(file.size / 1024)} KB)`)

    // Subir el archivo a Supabase Storage con reintentos
    let uploadError = null
    let uploadData = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Intento de subida ${attempt}/3...`)

      const { error, data } = await supabase.storage.from("challenges").upload(filePath, file, {
        cacheControl: "3600",
        upsert: attempt > 1, // Sobrescribir solo en reintentos
      })

      if (!error) {
        uploadData = data
        uploadError = null
        console.log("Archivo subido correctamente")
        break
      } else {
        uploadError = error
        console.error(`Error en intento ${attempt}:`, error)

        // Esperar antes del siguiente intento
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    if (uploadError) throw uploadError

    // Obtener la URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("challenges").getPublicUrl(filePath)

    console.log(`URL pública generada: ${publicUrl}`)
    return publicUrl
  } catch (error: any) {
    console.error("Error completo al subir archivo:", error)
    return null
  }
}
