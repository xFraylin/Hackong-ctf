# Hackong2026 CTF

Plataforma web de retos **CTF (Capture The Flag)** para aprender y competir en ciberseguridad. Los participantes se registran con **usuario y contraseña**, resuelven retos, suman puntos y compiten en el ranking. Pensada para quien quiera **usar o modificar la interfaz** (pantallas, flujos, diseño) sin meterse en el backend.

---

## Qué es la plataforma (vista de usuario)

- **Inicio** — Página de bienvenida con logo, botones “Comenzar ahora” e “Iniciar sesión”.
- **Registro** — Solo pide **usuario** y **contraseña** (sin correo). Tras registrarse entras directo al dashboard.
- **Login** — Mismo concepto: **usuario** y **contraseña**.
- **Dashboard** — Resumen del usuario: último reto resuelto, acceso rápido a retos, salas y ranking.
- **Retos** — Listado de retos por categoría. Al entrar a un reto ves la descripción y:
  - **Flag:** campo para escribir la flag correcta.
  - **Quiz:** preguntas de opción múltiple.
- **Salas** — Colecciones temáticas de retos; cada sala muestra sus retos.
- **Ranking** — Tabla global con usuarios ordenados por puntos.
- **Perfil** — Tus datos, retos completados, puntos y opción de editar tu nombre de usuario.
- **Admin** — Solo para cuentas con rol admin: gestión de categorías, retos, salas y usuarios.

La interfaz usa **tema oscuro** por defecto, **breadcrumbs** (Inicio > Retos > …) y es **responsive** (escritorio y móvil).

---

## Cómo usar la app (flujos en pantalla)

### Participante

1. Entras a la **portada** y pulsas “Comenzar ahora” o “Iniciar sesión”.
2. Si no tienes cuenta: **Registro** → eliges usuario y contraseña → te lleva al **Dashboard**.
3. Si ya tienes cuenta: **Login** → usuario y contraseña → **Dashboard**.
4. Desde el menú superior: **Retos**, **Salas**, **Ranking**, **Perfil**.
5. En **Retos** eliges uno, lees la descripción y envías la flag o respondes el quiz. Al acertar sumas puntos.
6. En **Ranking** ves tu posición y la de los demás.
7. En **Perfil** ves tus retos completados y puedes cambiar tu nombre de usuario.

### Administrador

1. Inicias sesión con una cuenta que tenga rol **admin**.
2. En el menú aparece **Admin**. Ahí puedes:
   - **Categorías** — Crear y listar categorías de retos.
   - **Retos** — Crear y editar retos (título, descripción, tipo flag/quiz, puntos, dificultad, archivos).
   - **Salas** — Crear salas y asignar retos a cada una.
   - **Usuarios** — Ver listado de usuarios.

---

## Dónde está cada pantalla (para editar la interfaz)

Todo lo que ves en el navegador está en la carpeta **`app/`**. Cada ruta es una carpeta con su `page.tsx`:

| Ruta en la web     | Archivo / carpeta           | Qué verás |
|--------------------|-----------------------------|-----------|
| `/`                | `app/page.tsx`              | Portada (logo, bienvenida, botones) |
| `/registro`        | `app/registro/page.tsx`      | Formulario de registro (usuario + contraseña) |
| `/login`           | `app/login/page.tsx`        | Formulario de inicio de sesión |
| `/dashboard`       | `app/dashboard/page.tsx`    | Dashboard del usuario |
| `/retos`           | `app/retos/page.tsx`        | Listado de retos |
| `/retos/[id]`      | `app/retos/[id]/page.tsx`   | Detalle de un reto (flag o quiz) |
| `/salas`           | `app/salas/page.tsx`        | Listado de salas |
| `/salas/[id]`      | `app/salas/[id]/page.tsx`   | Retos de una sala |
| `/ranking`         | `app/ranking/page.tsx`      | Ranking global |
| `/perfil`          | `app/perfil/page.tsx`       | Perfil y retos completados |
| `/perfil/editar`   | `app/perfil/editar/page.tsx`| Editar nombre de usuario |
| `/admin`           | `app/admin/page.tsx`        | Panel admin (resumen) |
| `/admin/retos`     | `app/admin/retos/`          | Gestión de retos |
| `/admin/salas`     | `app/admin/salas/`          | Gestión de salas |
| `/admin/categorias`| `app/admin/categorias/`     | Gestión de categorías |
| `/admin/usuarios`  | `app/admin/usuarios/page.tsx` | Listado de usuarios |

Los **componentes reutilizables** (navbar, botones, cards, formularios, etc.) están en **`components/`**:

- **`components/navbar.tsx`** — Barra superior de la portada (logo, enlaces, login/registro).
- **`components/dashboard-navbar.tsx`** — Barra cuando estás logueado (Admin, Retos, Salas, Ranking, Perfil, Salir).
- **`components/breadcrumb.tsx`** — Migas de pan (Inicio > Retos > …).
- **`components/ui/`** — Botones, inputs, cards, diálogos, etc. (base de la interfaz).

El **logo y las imágenes** están en **`public/`** (por ejemplo `public/logo.png`). Los **estilos globales** están en **`app/globals.css`** y se usa **Tailwind** en todo el proyecto.

---

## Cómo levantar el proyecto (para ver los gráficos en local)

Si solo quieres **ver y tocar la interfaz** en tu máquina:

1. **Clonar y entrar al proyecto:**
   ```bash
   git clone https://github.com/xFraylin/Hackong-ctf.git
   cd Hackong-ctf
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar el `.env`**  
   En la raíz del proyecto crea un archivo `.env` con (alguien del equipo te puede pasar los valores):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://....
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Arrancar:**
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

El backend (base de datos, auth) ya está montado; tú solo necesitas esas variables para que la app se conecte. Si algo falla al registrarte o al iniciar sesión, suele ser por el `.env` o por reiniciar el servidor después de cambiarlo.

---

## Tecnologías de la interfaz

- **Next.js 15** — Páginas y rutas.
- **React 19** — Componentes de la UI.
- **Tailwind CSS** — Estilos (clases en los componentes).
- **Radix UI** (en `components/ui/`) — Componentes accesibles: botones, inputs, modales, tabs, etc.
- **Lucide React** — Iconos (bandera, trofeo, carpeta, usuario, etc.).

No necesitas tocar base de datos ni API para cambiar textos, colores, layouts o flujos de pantalla; basta con editar los `page.tsx` y los componentes en `components/`.

---

## Resumen rápido

- **¿Quieres solo usar la plataforma?** → Entra a la URL que te den, regístrate con usuario y contraseña y navega por Retos, Salas, Ranking y Perfil.
- **¿Quieres cambiar pantallas o diseño?** → Trabaja en `app/` (páginas) y `components/` (navbar, breadcrumb, ui). Logo e imágenes en `public/`, estilos en `app/globals.css` y Tailwind.
- **¿Quieres ver el proyecto en tu PC?** → Clone, `pnpm install`, `.env` con las tres variables, `pnpm dev` y abre localhost:3000.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
