import { cookies } from "next/headers"
import { getSession, getUsuarioById } from "./data-store"

export async function getServerUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  if (!sessionId) return null

  const session = getSession(sessionId)
  if (!session) return null

  const usuario = getUsuarioById(session.usuario_id)
  if (!usuario || !usuario.activo) return null

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol_id,
    rol_nombre: usuario.rol_id === 1 ? "Administrador" : "Operario",
  }
}
