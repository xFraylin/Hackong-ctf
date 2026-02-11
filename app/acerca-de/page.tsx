import { Navbar } from "@/components/navbar"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <h1 className="text-4xl font-bold mb-8">Acerca de Hackong2026 CTF</h1>

          <div className="space-y-8">
            <section>
              <p className="text-lg text-gray-300 mb-6">
                Hackong2026 CTF es una plataforma educativa diseñada para ayudar a estudiantes, profesionales y
                entusiastas a mejorar sus habilidades en ciberseguridad a través de desafíos prácticos y competitivos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-gray-300 mb-4">
                Nuestra misión es democratizar el aprendizaje de la ciberseguridad, ofreciendo una plataforma accesible
                donde las personas puedan poner a prueba sus conocimientos, aprender nuevas técnicas y competir en un
                ambiente seguro y controlado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">¿Qué es un CTF?</h2>
              <p className="text-gray-300 mb-4">
                CTF (Capture The Flag) es un tipo de competición de seguridad informática donde los participantes deben
                encontrar "flags" (banderas) ocultas en sistemas vulnerables, aplicaciones web, archivos encriptados, y
                otros escenarios. Estas competiciones son una excelente manera de aprender habilidades prácticas de
                ciberseguridad en un entorno controlado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Categorías de Retos</h2>
              <p className="text-gray-300 mb-4">Nuestra plataforma ofrece retos en diversas categorías, incluyendo:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>
                  <span className="font-semibold">Web:</span> Vulnerabilidades en aplicaciones web, como XSS, SQLi,
                  CSRF, etc.
                </li>
                <li>
                  <span className="font-semibold">Criptografía:</span> Desafíos relacionados con cifrado, hashing y
                  sistemas criptográficos.
                </li>
                <li>
                  <span className="font-semibold">Forense:</span> Análisis de archivos, memoria, tráfico de red y otros
                  artefactos digitales.
                </li>
                <li>
                  <span className="font-semibold">Esteganografía:</span> Descubrir información oculta en imágenes, audio
                  y otros medios.
                </li>
                <li>
                  <span className="font-semibold">OSINT:</span> Inteligencia de fuentes abiertas, investigación y
                  recopilación de información.
                </li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Contacto</h2>
              <p className="text-gray-300 mb-2">
                Si tienes preguntas, sugerencias o quieres colaborar con nosotros, no dudes en contactarnos:
              </p>
              <ul className="text-primary space-y-1">
                <li>
                  📧{" "}
                  <a href="mailto:info@hackong2026.com" className="hover:underline">
                    info@hackong2026.com
                  </a>
                </li>
                <li>
                  📸{" "}
                  <a
                    href="https://www.instagram.com/hackong2026/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    @hackong2026
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
