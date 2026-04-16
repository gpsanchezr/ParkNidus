import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import { getUsuarios, createUsuario, updateUsuario, getRoles, getUsuarioByEmail } from "@/lib/data-store"

export async function GET() {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const usuarios = getUsuarios().map((u) => ({
    ...u,
    password_hash: undefined,
  }))
  const roles = getRoles()
  return NextResponse.json({ usuarios, roles })
}

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const { nombre, email, password, rol_id, activo } = body

  if (!nombre || !email || !password || !rol_id) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const existing = getUsuarioByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 })
  }

  const usuario = createUsuario({
    nombre,
    email,
    password,
    rol_id,
    activo: activo ?? true,
  })

  return NextResponse.json({
    usuario: { ...usuario, password_hash: undefined },
    message: "Usuario creado exitosamente",
  })
}

export async function PUT(request: Request) {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
  }

  const usuario = updateUsuario(id, data)
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    usuario: { ...usuario, password_hash: undefined },
    message: "Usuario actualizado exitosamente",
  })
}
