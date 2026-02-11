"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Upload, File, X, Plus, Trash } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
// Importar la nueva utilidad de carga
import { uploadChallengeFile } from "@/lib/upload-utils"

interface Question {
  id: string
  text: string
  options: { id: string; text: string; isCorrect: boolean }[]
  type: "single" | "multiple"
}

export default function NewChallenge() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [challengeType, setChallengeType] = useState<"flag" | "quiz">("flag")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
      ],
      type: "single",
    },
  ])
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
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*")
        if (error) {
          throw error
        }
        if (data) {
          setCategories(data)
        }
      } catch (error: any) {
        console.error("Error al cargar categorías:", error.message)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [supabase])

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

  const handleChallengeTypeChange = (value: string) => {
    setChallengeType(value as "flag" | "quiz")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
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

  // Funciones para manejar las preguntas del quiz
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        options: [
          { id: Date.now() + "1", text: "", isCorrect: false },
          { id: Date.now() + "2", text: "", isCorrect: false },
          { id: Date.now() + "3", text: "", isCorrect: false },
        ],
        type: "single",
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, text } : q)))
  }

  const updateQuestionType = (questionId: string, type: "single" | "multiple") => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, type } : q)))
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { id: Date.now().toString(), text: "", isCorrect: false }],
          }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optionId),
          }
        }
        return q
      }),
    )
  }

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
          }
        }
        return q
      }),
    )
  }

  const updateOptionCorrect = (questionId: string, optionId: string, isCorrect: boolean) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          // Si es de tipo single, desmarcar todas las demás opciones
          if (q.type === "single" && isCorrect) {
            return {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, isCorrect: true } : { ...o, isCorrect: false },
              ),
            }
          } else {
            return {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, isCorrect } : o)),
            }
          }
        }
        return q
      }),
    )
  }

  const validateQuiz = () => {
    // Verificar que todas las preguntas tengan texto
    if (questions.some((q) => !q.text.trim())) {
      toast({
        title: "Error en el formulario",
        description: "Todas las preguntas deben tener un texto",
        variant: "destructive",
      })
      return false
    }

    // Verificar que todas las preguntas tengan al menos 2 opciones
    if (questions.some((q) => q.options.length < 2)) {
      toast({
        title: "Error en el formulario",
        description: "Cada pregunta debe tener al menos 2 opciones",
        variant: "destructive",
      })
      return false
    }

    // Verificar que todas las opciones tengan texto
    if (questions.some((q) => q.options.some((o) => !o.text.trim()))) {
      toast({
        title: "Error en el formulario",
        description: "Todas las opciones deben tener un texto",
        variant: "destructive",
      })
      return false
    }

    // Verificar que cada pregunta tenga al menos una opción correcta
    if (questions.some((q) => !q.options.some((o) => o.isCorrect))) {
      toast({
        title: "Error en el formulario",
        description: "Cada pregunta debe tener al menos una opción correcta",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Enviando formulario...")

    try {
      setLoading(true)

      // Validaciones básicas
      if (!formData.title.trim()) {
        toast({
          title: "Error en el formulario",
          description: "El título es obligatorio",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!formData.description.trim()) {
        toast({
          title: "Error en el formulario",
          description: "La descripción es obligatoria",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Validar según el tipo de reto
      if (challengeType === "flag") {
        if (!formData.flag.trim()) {
          toast({
            title: "Error en el formulario",
            description: "La flag es obligatoria",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      } else if (challengeType === "quiz") {
        if (!validateQuiz()) {
          setLoading(false)
          return
        }
      }

      // Modificar la parte del handleSubmit donde se procesa el archivo
      // Dentro de handleSubmit, reemplazar la sección de procesamiento de archivo con:
      // Si hay un archivo para subir, procesarlo primero
      let fileUrl = formData.file_url
      if (uploadedFile) {
        console.log("Procesando archivo adjunto...")
        const uploadedUrl = await uploadFile()

        if (uploadedUrl) {
          console.log("URL del archivo subido:", uploadedUrl)
          fileUrl = uploadedUrl
        } else {
          console.error("No se pudo obtener la URL del archivo")
          toast({
            title: "Error con el archivo",
            description: "No se pudo procesar el archivo adjunto. El reto se creará sin archivo.",
            variant: "destructive",
          })
        }
      }

      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        throw new Error("No hay sesión activa")
      }

      // Preparar los datos básicos del reto
      const challengeData: any = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
        points: Number.parseInt(formData.points.toString()),
        difficulty: formData.difficulty,
        file_url: fileUrl,
        created_by: session.session.user.id,
      }

      // Añadir datos específicos según el tipo de reto
      if (challengeType === "flag") {
        challengeData.flag = formData.flag
      } else if (challengeType === "quiz") {
        challengeData.flag = "quiz_challenge" // Valor por defecto para retos tipo quiz

        // Intentar añadir los datos del quiz como metadatos en la descripción
        // ya que la columna quiz_data podría no existir aún
        const quizMetadata = {
          isQuiz: true,
          questions: questions,
        }

        // Añadir metadatos al final de la descripción en formato JSON
        challengeData.description += `\n\n<!-- QUIZ_DATA: ${JSON.stringify(quizMetadata)} -->`
      }

      console.log("Datos a enviar:", challengeData)

      // Intentar insertar el reto
      const { data, error } = await supabase.from("challenges").insert(challengeData).select()

      if (error) {
        console.error("Error al crear reto:", error)
        throw error
      }

      console.log("Reto creado:", data)

      toast({
        title: "Reto creado",
        description: "El reto ha sido creado correctamente",
      })

      router.push("/admin/retos")
    } catch (error: any) {
      console.error("Error completo:", error)
      toast({
        title: "Error al crear el reto",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Reto</h1>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="flag" onValueChange={handleChallengeTypeChange}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="flag">Reto con Flag</TabsTrigger>
            <TabsTrigger value="quiz">Reto tipo Quiz</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos comunes para ambos tipos de reto */}
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
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
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

            <TabsContent value="flag" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="flag">Flag</Label>
                <Input
                  id="flag"
                  name="flag"
                  value={formData.flag}
                  onChange={handleChange}
                  required={challengeType === "flag"}
                />
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
                      <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="*/*"
                      />
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
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Preguntas</h2>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Pregunta
                  </Button>
                </div>

                {questions.map((question, qIndex) => (
                  <Card key={question.id} className="p-4">
                    <CardContent className="p-0 pt-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium">Pregunta {qIndex + 1}</h3>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}`}>Texto de la pregunta</Label>
                          <Input
                            id={`question-${question.id}`}
                            value={question.text}
                            onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            placeholder="Escribe la pregunta aquí"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de respuesta</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => updateQuestionType(question.id, value as "single" | "multiple")}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Respuesta única</SelectItem>
                              <SelectItem value="multiple">Respuesta múltiple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Opciones</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => addOption(question.id)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Añadir opción
                            </Button>
                          </div>

                          <div className="space-y-3 mt-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-start gap-3">
                                {question.type === "single" ? (
                                  <RadioGroup
                                    value={option.isCorrect ? option.id : ""}
                                    onValueChange={(value) => {
                                      if (value === option.id) {
                                        updateOptionCorrect(question.id, option.id, true)
                                      }
                                    }}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                  </RadioGroup>
                                ) : (
                                  <Checkbox
                                    id={`option-${option.id}`}
                                    checked={option.isCorrect}
                                    onCheckedChange={(checked) => {
                                      updateOptionCorrect(question.id, option.id, checked === true)
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <Input
                                    value={option.text}
                                    onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                    placeholder="Texto de la opción"
                                    required
                                  />
                                </div>
                                {question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(question.id, option.id)}
                                    className="text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/retos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Reto"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
