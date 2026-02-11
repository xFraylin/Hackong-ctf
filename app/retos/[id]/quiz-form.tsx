"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, X, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuizFormProps {
  challengeId: number
  quizData: any[]
  points: number
}

export function QuizForm({ challengeId, quizData, points }: QuizFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [questionResults, setQuestionResults] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(1)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [attemptsExhausted, setAttemptsExhausted] = useState(false)

  // Máximo número de intentos permitidos
  const MAX_ATTEMPTS = 2

  const totalQuestions = quizData.length

  // Cargar intentos previos desde localStorage al iniciar
  useEffect(() => {
    const savedAttempts = localStorage.getItem(`quiz_attempts_${challengeId}`)
    if (savedAttempts) {
      const parsedAttempts = Number.parseInt(savedAttempts, 10)
      setAttempts(parsedAttempts)

      // Si ya se han agotado los intentos, mostrar mensaje
      if (parsedAttempts > MAX_ATTEMPTS) {
        setAttemptsExhausted(true)
      }
    }

    const quizCompletedStatus = localStorage.getItem(`quiz_completed_${challengeId}`)
    if (quizCompletedStatus === "true") {
      setQuizCompleted(true)
    }
  }, [challengeId])

  const handleSingleAnswer = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: [optionId],
    })
  }

  const handleMultipleAnswer = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || []

    if (checked) {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, optionId],
      })
    } else {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((id) => id !== optionId),
      })
    }
  }

  const isOptionSelected = (questionId: string, optionId: string) => {
    return (answers[questionId] || []).includes(optionId)
  }

  const goToNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    const results: Record<string, boolean> = {}

    quizData.forEach((question) => {
      const userAnswers = answers[question.id] || []
      const correctOptions = question.options.filter((option) => option.isCorrect).map((option) => option.id)

      // Para preguntas de respuesta única
      if (question.type === "single") {
        const isCorrect = userAnswers.length === 1 && correctOptions.includes(userAnswers[0])
        if (isCorrect) correctAnswers++
        results[question.id] = isCorrect
      }
      // Para preguntas de respuesta múltiple
      else if (question.type === "multiple") {
        // Todas las opciones correctas deben estar seleccionadas y ninguna incorrecta
        const allCorrectSelected = correctOptions.every((id) => userAnswers.includes(id))
        const noIncorrectSelected = userAnswers.every((id) => correctOptions.includes(id))
        const isCorrect = allCorrectSelected && noIncorrectSelected

        if (isCorrect) correctAnswers++
        results[question.id] = isCorrect
      }
    })

    return {
      score: Math.round((correctAnswers / totalQuestions) * 100),
      results,
    }
  }

  const resetQuiz = () => {
    // Incrementar el contador de intentos
    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    // Guardar el número de intentos en localStorage
    localStorage.setItem(`quiz_attempts_${challengeId}`, newAttempts.toString())

    // Si se han agotado los intentos, mostrar mensaje
    if (newAttempts > MAX_ATTEMPTS) {
      setAttemptsExhausted(true)
      return
    }

    // Reiniciar el estado del quiz
    setAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setScore(null)
    setQuestionResults({})
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    try {
      setLoading(true)

      // Calcular puntuación
      const { score, results } = calculateScore()
      setScore(score)
      setQuestionResults(results)
      setShowResults(true)

      // Si la puntuación es perfecta (100%), marcar como completado
      if (score === 100) {
        setQuizCompleted(true)
        localStorage.setItem(`quiz_completed_${challengeId}`, "true")
        setSuccess(`¡Quiz completado! Has obtenido ${score}% de respuestas correctas.`)
      } else {
        // Si no es perfecta y aún tiene intentos, mostrar mensaje
        if (attempts < MAX_ATTEMPTS) {
          setSuccess(`Has obtenido ${score}% de respuestas correctas. Te queda ${MAX_ATTEMPTS - attempts} intento.`)
        } else {
          // Si no es perfecta y no tiene más intentos, mostrar mensaje de fallo
          setSuccess(`Has obtenido ${score}% de respuestas correctas. Has agotado tus ${MAX_ATTEMPTS} intentos.`)
          setAttemptsExhausted(true)
          localStorage.setItem(`quiz_attempts_${challengeId}`, (MAX_ATTEMPTS + 1).toString())
        }
      }

      // Solo registrar en la base de datos si es un éxito o si se han agotado los intentos
      if (score === 100 || attempts >= MAX_ATTEMPTS) {
        // Obtener el perfil del usuario
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("No hay sesión activa")
        }

        // Verificar si el reto ya ha sido resuelto
        const { data: existingSolved } = await supabase
          .from("solved_challenges")
          .select("*")
          .eq("profile_id", session.user.id)
          .eq("challenge_id", challengeId)
          .single()

        if (existingSolved) {
          toast({
            title: "Reto ya resuelto",
            description: "Ya has resuelto este reto anteriormente.",
          })
          return
        }

        // Calcular puntos basados en el score
        const earnedPoints = Math.round((score / 100) * points)

        // Registrar el reto como resuelto
        const { error: solvedError } = await supabase.from("solved_challenges").insert({
          profile_id: session.user.id,
          challenge_id: challengeId,
          quiz_score: score,
        })

        if (solvedError) {
          throw solvedError
        }

        // Actualizar los puntos del usuario solo si obtuvo puntos
        if (earnedPoints > 0) {
          const { data: profile } = await supabase.from("profiles").select("points").eq("id", session.user.id).single()

          if (!profile) {
            throw new Error("No se pudo obtener el perfil del usuario")
          }

          const { error: updateError } = await supabase
            .from("profiles")
            .update({ points: (profile.points || 0) + earnedPoints })
            .eq("id", session.user.id)

          if (updateError) {
            throw updateError
          }

          toast({
            title: "Quiz completado",
            description: `Has obtenido ${score}% de respuestas correctas y ganado ${earnedPoints} puntos.`,
          })
        } else if (score < 100 && attempts >= MAX_ATTEMPTS) {
          toast({
            title: "Quiz fallido",
            description: `Has agotado tus ${MAX_ATTEMPTS} intentos. No has ganado puntos.`,
            variant: "destructive",
          })
        }

        // Esperar un momento antes de refrescar para que el usuario vea el mensaje
        setTimeout(() => {
          router.refresh()
        }, 5000)
      }
    } catch (error: any) {
      console.error("Error al enviar quiz:", error)
      setError(error.message || "Ha ocurrido un error al procesar el quiz")
    } finally {
      setLoading(false)
    }
  }

  // Si ya se han agotado los intentos y no se ha completado el quiz
  if (attemptsExhausted && !quizCompleted) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has agotado tus {MAX_ATTEMPTS} intentos para este quiz. No puedes volver a intentarlo.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {quizData.map((question, index) => (
            <Card key={question.id} className="border border-red-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Pregunta {index + 1}</h4>
                  <div className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-500">Intentos agotados</div>
                </div>
                <p className="mb-4">{question.text}</p>

                <div className="space-y-2">
                  {question.options.map((option) => {
                    // Solo mostrar si es la respuesta correcta cuando se han agotado los intentos
                    const isCorrect = option.isCorrect
                    const optionClass = isCorrect ? "bg-green-500/20 border-green-500" : ""

                    return (
                      <div key={option.id} className={`p-2 rounded border ${optionClass} relative`}>
                        <div className="flex items-center justify-between">
                          <span>{option.text}</span>
                          {isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Resultados del Quiz</h3>
          <p className="text-lg mb-4">
            Tu puntuación: <span className="font-bold text-primary">{score}%</span>
          </p>
          <Progress value={score || 0} className="h-2 mb-6" />
        </div>

        {success && (
          <Alert variant="default" className="bg-green-500/20 text-green-500 border-green-500/50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {quizData.map((question, index) => (
            <Card
              key={question.id}
              className={`border ${questionResults[question.id] ? "border-green-500" : "border-red-500"}`}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Pregunta {index + 1}</h4>
                  <div
                    className={`px-2 py-1 rounded text-xs ${questionResults[question.id] ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
                  >
                    {questionResults[question.id] ? "Correcta" : "Incorrecta"}
                  </div>
                </div>
                <p className="mb-4">{question.text}</p>

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = isOptionSelected(question.id, option.id)
                    const isCorrect = option.isCorrect

                    // Determinar la clase de estilo para cada opción
                    let optionClass = ""
                    let showIcon = false

                    // Solo mostrar si la opción fue seleccionada
                    if (isSelected) {
                      // Si seleccionó una opción correcta
                      if (isCorrect) {
                        optionClass = "bg-green-500/20 border-green-500"
                        showIcon = true
                      }
                      // Si seleccionó una opción incorrecta
                      else {
                        optionClass = "bg-red-500/20 border-red-500"
                        showIcon = true
                      }
                    }
                    // No mostrar ninguna indicación para las opciones no seleccionadas

                    return (
                      <div key={option.id} className={`p-2 rounded border ${optionClass} relative`}>
                        <div className="flex items-center justify-between">
                          <span>{option.text}</span>
                          {showIcon && isCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
                          {showIcon && !isCorrect && <X className="h-4 w-4 text-red-500 ml-2" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botón para reintentar si no ha completado el quiz y aún tiene intentos */}
        {!quizCompleted && attempts < MAX_ATTEMPTS && (
          <div className="flex justify-center mt-6">
            <Button onClick={resetQuiz} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar Quiz (Intento {attempts + 1} de {MAX_ATTEMPTS})
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Si no hay datos de quiz válidos, mostrar un mensaje de error
  if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error: No se pudieron cargar las preguntas del quiz. Por favor, contacta al administrador.
        </AlertDescription>
      </Alert>
    )
  }

  const currentQuizQuestion = quizData[currentQuestion]
  const hasAnsweredCurrent = answers[currentQuizQuestion.id]?.length > 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">
              Pregunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              Intento {attempts} de {MAX_ATTEMPTS}
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-4">{currentQuizQuestion.text}</h3>

          {currentQuizQuestion.type === "single" ? (
            <RadioGroup
              value={answers[currentQuizQuestion.id]?.[0] || ""}
              onValueChange={(value) => handleSingleAnswer(currentQuizQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuizQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50">
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                  <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {currentQuizQuestion.options.map((option) => (
                <div key={option.id} className="flex items-start space-x-2 p-2 rounded border hover:bg-muted/50">
                  <Checkbox
                    id={`option-${option.id}`}
                    checked={isOptionSelected(currentQuizQuestion.id, option.id)}
                    onCheckedChange={(checked) => {
                      handleMultipleAnswer(currentQuizQuestion.id, option.id, checked === true)
                    }}
                  />
                  <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestion === 0}>
          Anterior
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button type="button" onClick={goToNextQuestion} disabled={!hasAnsweredCurrent}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={loading || !hasAnsweredCurrent}>
            {loading ? "Enviando..." : "Finalizar Quiz"}
          </Button>
        )}
      </div>
    </div>
  )
}
