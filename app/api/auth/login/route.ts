import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUsuarioByEmail, verifyPassword, createSession } from "@/lib/data-store"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
  }

const usuario = await getUsuarioByEmail(email)
  if (!usuario) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
  }

  if (!usuario.activo) {
    return NextResponse.json({ error: "Usuario inactivo. Contacte al administrador." }, { status: 403 })
  }

  if (!verifyPassword(password, usuario.password_hash)) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
  }

  const session = await createSession(usuario.id)
  const cookieStore = await cookies()
  cookieStore.set("session_id", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return NextResponse.json({
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol_id === 1 ? "Administrador" : "Operario",
    },
  })
}
