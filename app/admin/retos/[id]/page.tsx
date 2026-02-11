"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Upload, File, X, Download } from "lucide-react"

// Importar la nueva utilidad de carga
import { uploadChallengeFile } from "@/lib/upload-utils"

export default function EditChallenge({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [existingFile, setExistingFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    points: 100,
    flag: "",
    file_url: "",
    difficulty: "medio",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el reto
        const { data: challenge, error: challengeError } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", params.id)
          .single()

        if (challengeError) throw challengeError

        // Obtener las categorías
        const { data: categoriesData } = await supabase.from("categories").select("*")

        if (categoriesData) setCategories(categoriesData)

        // Establecer los datos del formulario
        setFormData({
          title: challenge.title,
          description: challenge.description,
          category_id: challenge.category_id ? challenge.category_id.toString() : "",
          points: challenge.points,
          flag: challenge.flag,
          file_url: challenge.file_url || "",
          difficulty: challenge.difficulty || "medio",
        })

        // Si hay un archivo existente, guardarlo
        if (challenge.file_url) {
          setExistingFile(challenge.file_url)
        }
      } catch (error: any) {
        toast({
          title: "Error al cargar el reto",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0])
      // Limpiar la URL existente si se selecciona un nuevo archivo
      setFormData({
        ...formData,
        file_url: "",
      })
      setExistingFile(null)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setExistingFile(null)
    setFormData({
      ...formData,
      file_url: "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Reemplazar la función uploadFile con la siguiente implementación
  const uploadFile = async () => {
    if (!uploadedFile) return null

    try {
      setUploading(true)

      // Usar la nueva utilidad de carga
      const publicUrl = await uploadChallengeFile(uploadedFile)

      if (!publicUrl) {
        throw new Error("No se pudo obtener la URL del archivo subido")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente",
      })

      return publicUrl
    } catch (error: any) {
      console.error("Error detallado al subir archivo:", error)
      toast({
        title: "Error al subir el archivo",
        description: error.message || "Ocurrió un error al subir el archivo",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split("/")
      return pathSegments[pathSegments.length - 1]
    } catch (e) {
      return url
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Si hay un archivo para subir, procesarlo primero
      let fileUrl = formData.file_url
      if (uploadedFile) {
        const uploadedUrl = await uploadFile()
        if (uploadedUrl) {
          fileUrl = uploadedUrl
        }
      } else if (existingFile && !formData.file_url) {
        // Si hay un archivo existente y no se ha ingresado una nueva URL, mantener el archivo existente
        fileUrl = existingFile
      }

      const { error } = await supabase
        .from("challenges")
        .update({
          ...formData,
          file_url: fileUrl,
          category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
          points: Number.parseInt(formData.points.toString()),
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Reto actualizado",
        description: "El reto ha sido actualizado correctamente",
      })

      router.push("/admin/retos")
    } catch (error: any) {
      toast({
        title: "Error al actualizar el reto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Editar Reto</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleSelectChange("category_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fácil">Fácil</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Puntos</Label>
            <Input
              id="points"
              name="points"
              type="number"
              min="10"
              step="10"
              value={formData.points}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag">Flag</Label>
            <Input id="flag" name="flag" value={formData.flag} onChange={handleChange} required />
            <p className="text-xs text-muted-foreground">Formato recomendado: CTF{"{texto_aquí}"}</p>
          </div>

          <div className="space-y-2">
            <Label>Archivo del reto</Label>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Subiendo..." : "Subir archivo"}
                  </Button>
                  <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="*/*" />
                </div>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{uploadedFile.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({Math.round(uploadedFile.size / 1024)} KB)
                      </span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}

                {existingFile && !uploadedFile && (
                  <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{getFileNameFromUrl(existingFile)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={existingFile} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="ghost" size="sm">
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                      </a>
                      <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_url">O ingresa una URL externa</Label>
                <Input
                  id="file_url"
                  name="file_url"
                  value={formData.file_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/archivo.zip"
                  disabled={!!uploadedFile}
                />
                <p className="text-xs text-muted-foreground">
                  Puedes subir un archivo o proporcionar una URL externa, pero no ambos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/retos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
