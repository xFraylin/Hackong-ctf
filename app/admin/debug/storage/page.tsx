"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DebugStoragePage() {
  const supabase = createClient()
  const [buckets, setBuckets] = useState<any[]>([])
  const [selectedBucket, setSelectedBucket] = useState<string>("challenges")
  const [files, setFiles] = useState<any[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const { data, error } = await supabase.storage.listBuckets()
        if (error) throw error
        setBuckets(data || [])

        // Verificar si existe el bucket challenges
        const challengesBucket = data?.find((bucket) => bucket.name === "challenges")
        if (!challengesBucket) {
          setError("El bucket 'challenges' no existe. Por favor, créalo desde el panel de administración de Supabase.")
        }
      } catch (error: any) {
        console.error("Error fetching buckets:", error)
        toast({
          title: "Error",
          description: `No se pudieron cargar los buckets: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    fetchBuckets()
  }, [supabase])

  useEffect(() => {
    if (selectedBucket) {
      fetchFiles()
    }
  }, [selectedBucket])

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from(selectedBucket).list()
      if (error) throw error
      setFiles(data || [])
    } catch (error: any) {
      console.error(`Error fetching files from ${selectedBucket}:`, error)
      toast({
        title: "Error",
        description: `No se pudieron cargar los archivos: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo primero",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      setTestResult(null)

      // Crear un nombre de archivo único
      const fileExt = uploadedFile.name.split(".").pop()
      const fileName = `test_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Subir el archivo
      const { error: uploadError, data } = await supabase.storage.from(selectedBucket).upload(filePath, uploadedFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Obtener la URL pública
      const { data: urlData } = supabase.storage.from(selectedBucket).getPublicUrl(filePath)

      setTestResult(`Archivo subido correctamente. URL: ${urlData.publicUrl}`)
      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      })

      // Refrescar la lista de archivos
      fetchFiles()
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setTestResult(`Error al subir el archivo: ${error.message}`)
      toast({
        title: "Error",
        description: `Error al subir el archivo: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    try {
      const { error } = await supabase.storage.from(selectedBucket).remove([fileName])
      if (error) throw error

      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente",
      })

      // Refrescar la lista de archivos
      fetchFiles()
    } catch (error: any) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: `Error al eliminar el archivo: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Depuración de Almacenamiento</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Buckets disponibles</h2>
          {buckets.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {buckets.map((bucket) => (
                <div
                  key={bucket.id}
                  className={`p-4 border rounded-md cursor-pointer ${
                    selectedBucket === bucket.name ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedBucket(bucket.name)}
                >
                  <p className="font-medium">{bucket.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Creado: {new Date(bucket.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-md">
              <p>No hay buckets disponibles.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Debes crear el bucket "challenges" desde el panel de administración de Supabase.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Prueba de carga de archivos</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="file-upload">Seleccionar archivo</Label>
              <Input id="file-upload" type="file" onChange={handleFileChange} className="mt-1" />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!uploadedFile || uploading || !buckets.some((b) => b.name === selectedBucket)}
            >
              {uploading ? "Subiendo..." : "Subir archivo de prueba"}
            </Button>
            {testResult && (
              <div
                className={`p-4 rounded-md ${
                  testResult.includes("Error") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                }`}
              >
                {testResult}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Archivos en el bucket "{selectedBucket}"</h2>
          <Button onClick={fetchFiles} variant="outline" size="sm">
            Refrescar lista
          </Button>
          {files.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Tamaño</th>
                    <th className="p-2 text-left">Creado</th>
                    <th className="p-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-t">
                      <td className="p-2">{file.name}</td>
                      <td className="p-2">{Math.round(file.metadata.size / 1024)} KB</td>
                      <td className="p-2">{new Date(file.created_at).toLocaleString()}</td>
                      <td className="p-2">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(file.name)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay archivos en este bucket.</p>
          )}
        </div>
      </div>
    </div>
  )
}
