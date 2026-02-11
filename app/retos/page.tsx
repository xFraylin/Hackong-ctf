import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ChallengesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Obtener todos los retos
  const { data: allChallengesData } = await supabase
    .from("challenges")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })

  // Obtener los retos resueltos por el usuario
  const { data: solvedChallengesData } = await supabase
    .from("solved_challenges")
    .select("challenge_id, quiz_score")
    .eq("profile_id", session.user.id)

  // Crear un mapa de retos resueltos para búsqueda rápida
  const solvedChallengesMap = new Map()
  solvedChallengesData?.forEach((solved) => {
    solvedChallengesMap.set(solved.challenge_id, solved.quiz_score)
  })

  // Marcar los retos como resueltos o no
  const allChallenges =
    allChallengesData?.map((challenge) => {
      const quizScore = solvedChallengesMap.get(challenge.id)
      const isQuizChallenge = challenge.challenge_type === "quiz" || challenge.description?.includes("<!-- QUIZ_DATA:")
      const isFullyCompleted = quizScore === 100 || (solvedChallengesMap.has(challenge.id) && !isQuizChallenge)

      return {
        ...challenge,
        solved: solvedChallengesMap.has(challenge.id),
        isFullyCompleted,
        quiz_score: quizScore,
      }
    }) || []

  // Separar retos por tipo
  const flagChallenges = allChallenges.filter((challenge) => {
    // Exclude challenges that are explicitly marked as quiz type
    if (challenge.challenge_type === "quiz") return false

    // Exclude challenges that have quiz data in their description
    if (challenge.description?.includes("<!-- QUIZ_DATA:")) return false

    // Include all other challenges (flag challenges or unspecified type)
    return true
  })

  const quizChallenges = allChallenges.filter((challenge) => {
    return challenge.challenge_type === "quiz" || challenge.description?.includes("<!-- QUIZ_DATA:")
  })

  // Función para determinar si un quiz tiene preguntas de respuesta múltiple
  const hasMultipleChoiceQuestions = (challenge: any) => {
    if (challenge.quiz_data) {
      return challenge.quiz_data.some((q: any) => q.type === "multiple")
    }

    // Verificar en la descripción
    const quizDataMatch = challenge.description.match(/<!-- QUIZ_DATA: (.*?) -->/)
    if (quizDataMatch) {
      try {
        const quizMetadata = JSON.parse(quizDataMatch[1])
        if (quizMetadata.isQuiz && quizMetadata.questions) {
          return quizMetadata.questions.some((q: any) => q.type === "multiple")
        }
      } catch (e) {
        console.error("Error al parsear datos de quiz:", e)
      }
    }

    return false
  }

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Retos disponibles</h1>

      <Tabs defaultValue="flag" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-8">
          <TabsTrigger value="flag">Retos con Flag</TabsTrigger>
          <TabsTrigger value="quiz">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="flag" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {flagChallenges.length > 0 ? (
              flagChallenges.map((challenge) => (
                <Link href={`/retos/${challenge.id}`} key={challenge.id} className="block">
                  <Card className={`h-full transition-all hover:shadow-md ${challenge.solved ? "border-primary" : ""}`}>
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg md:text-xl">{challenge.title}</CardTitle>
                        {challenge.solved && <Badge className="bg-primary">Resuelto</Badge>}
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        {challenge.categories?.name || "Sin categoría"} | {challenge.difficulty || "No definida"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      <p className="line-clamp-3 text-sm">
                        {challenge.description.replace(/<!-- QUIZ_DATA: (.*?) -->/g, "")}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 md:p-6">
                      <p className="text-xs md:text-sm font-medium">{challenge.points} pts</p>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 md:py-12">
                <p className="text-muted-foreground">No hay retos con flag disponibles</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quizChallenges.length > 0 ? (
              quizChallenges.map((challenge) => (
                <Link href={`/retos/${challenge.id}`} key={challenge.id} className="block">
                  <Card
                    className={`h-full transition-all hover:shadow-md ${
                      challenge.isFullyCompleted ? "border-primary" : challenge.solved ? "border-amber-500" : ""
                    }`}
                  >
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg md:text-xl">{challenge.title}</CardTitle>
                        {challenge.solved && (
                          <Badge className={challenge.isFullyCompleted ? "bg-primary" : "bg-amber-500"}>
                            {challenge.isFullyCompleted
                              ? `Resuelto (${challenge.quiz_score}%)`
                              : `Incompleto (${challenge.quiz_score || 0}%)`}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        {challenge.categories?.name || "Sin categoría"} | {challenge.difficulty || "No definida"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      <p className="line-clamp-3 text-sm">
                        {challenge.description.replace(/<!-- QUIZ_DATA: (.*?) -->/g, "")}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 md:p-6 flex justify-between items-center">
                      <p className="text-xs md:text-sm font-medium">{challenge.points} pts</p>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {hasMultipleChoiceQuestions(challenge) ? "Respuesta Múltiple" : "Respuesta Única"}
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 md:py-12">
                <p className="text-muted-foreground">No hay quizzes disponibles</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
