import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FlagForm } from "./flag-form"
import { QuizForm } from "./quiz-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*, categories(name)")
    .eq("id", params.id)
    .single()

  if (challengeError || !challenge) {
    redirect("/retos")
  }

  const { data: solved } = await supabase
    .from("solved_challenges")
    .select("*, quiz_score")
    .eq("profile_id", session.user.id)
    .eq("challenge_id", challenge.id)
    .single()

  const isSolved = !!solved
  const isQuizChallenge = challenge.challenge_type === "quiz" || challenge.description?.includes("<!-- QUIZ_DATA:")

  // Determinar si el reto está completado (100% para quizzes o cualquier porcentaje para flags)
  const isFullyCompleted =
    isSolved &&
    (!isQuizChallenge ||
      solved.quiz_score === 100 ||
      (challenge.challenge_type !== "quiz" && !challenge.description?.includes("<!-- QUIZ_DATA:")))

  // Determinar si es un reto tipo quiz
  let quizData = null

  // Verificar si tiene la columna challenge_type
  if (challenge.challenge_type === "quiz") {
    quizData = challenge.quiz_data
  } else {
    // Verificar si hay datos de quiz en la descripción
    const quizDataMatch = challenge.description.match(/<!-- QUIZ_DATA: (.*?) -->/)
    if (quizDataMatch) {
      try {
        const quizMetadata = JSON.parse(quizDataMatch[1])
        if (quizMetadata.isQuiz) {
          quizData = quizMetadata.questions

          // Limpiar la descripción para no mostrar el JSON
          challenge.description = challenge.description.replace(/<!-- QUIZ_DATA: (.*?) -->/, "").trim()
        }
      } catch (e) {
        console.error("Error al parsear datos de quiz:", e)
      }
    }
  }

  // Función para obtener el nombre del archivo de una URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split("/")
      return pathSegments[pathSegments.length - 1]
    } catch (e) {
      return "Descargar archivo"
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <CardDescription className="mt-2">
                  Categoría: {challenge.categories?.name || "Sin categoría"} | Dificultad:{" "}
                  {challenge.difficulty || "No definida"} | Puntos: {challenge.points}
                </CardDescription>
              </div>
              {isSolved && (
                <Badge className={isFullyCompleted ? "bg-primary" : "bg-amber-500"}>
                  {isFullyCompleted
                    ? isQuizChallenge && solved.quiz_score !== null
                      ? `Resuelto (${solved.quiz_score}%)`
                      : "Resuelto"
                    : `Incompleto (${solved.quiz_score || 0}%)`}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p>{challenge.description}</p>
            </div>

            {challenge.file_url && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Archivo adjunto:</h3>
                <a
                  href={challenge.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {getFileNameFromUrl(challenge.file_url)}
                  </Button>
                </a>
              </div>
            )}

            {!isSolved ? (
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  {isQuizChallenge ? "Responde las preguntas:" : "Enviar flag:"}
                </h3>
                {isQuizChallenge && quizData ? (
                  <QuizForm challengeId={challenge.id} quizData={quizData} points={challenge.points} />
                ) : (
                  <FlagForm challengeId={challenge.id} correctFlag={challenge.flag} points={challenge.points} />
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-md ${isFullyCompleted ? "bg-primary/20" : "bg-amber-500/20"}`}>
                <h3 className={`text-lg font-medium mb-2 ${isFullyCompleted ? "text-primary" : "text-amber-500"}`}>
                  {isFullyCompleted ? "¡Reto completado!" : "Reto incompleto"}
                </h3>
                <p>
                  {isFullyCompleted
                    ? `Ya has resuelto este reto correctamente.${isQuizChallenge && solved.quiz_score !== null ? ` Obtuviste ${solved.quiz_score}% de aciertos.` : ""} ¡Felicidades!`
                    : `Has intentado este reto pero solo obtuviste ${solved.quiz_score || 0}% de aciertos. Puedes intentarlo nuevamente.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
