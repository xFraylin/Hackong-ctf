import { Navbar } from "@/components/navbar"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-5xl py-12">
          <h1 className="text-4xl font-bold text-center mb-4">Nuestro Equipo</h1>
          <p className="text-center text-gray-300 mb-12">
            Conoce a la persona detrás de xNueve MindSploit
          </p>

          <div className="flex justify-center">
            <div className="bg-muted/30 rounded-lg p-8 border border-border/40 max-w-xl">
              <div className="flex flex-col items-center">
                <div className="bg-primary/20 rounded-full p-6 mb-4">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Fraylin López</h2>
                <p className="text-primary mb-4">CEO & Fundador</p>
                <p className="text-gray-300 text-center mb-6">
Apasionado por la ciberseguridad y el mundo CTF. Representante internacional en competencias como WorldSkills, con medallas en República Dominicana y Chile. Creador de desafíos, formador en técnicas ofensivas y defensor del aprendizaje práctico en plataformas como TryHackMe y Root-Me. :/
                </p>
                <div className="flex space-x-4">
                  <Link href="https://www.linkedin.com/in/xfraylin/" target="_blank" className="text-primary hover:text-primary/80">
                    LinkedIn
                  </Link>
                  <Link href="https://www.instagram.com/xfraylin" target="_blank" className="text-primary hover:text-primary/80">
                    Instagram
                  </Link>
                  <Link href="https://github.com/xFraylin" target="_blank" className="text-primary hover:text-primary/80">
                    GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
