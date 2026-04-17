import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { getServerUser } from "@/lib/auth"
import { getUsuarios, updateUsuario, getRoles, getUsuarioByEmail } from "@/lib/data-store"
import type { Database } from "@/lib/supabase/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug logs (move inside POST for per-request logging)
export async function GET() {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const usuarios = await getUsuarios()
  const usuariosSafe = usuarios.map((u) => ({
    ...u,
    password_hash: undefined,
  }))
  const roles = await getRoles()
  return NextResponse.json({ usuarios: usuariosSafe, roles })
}

export async function POST(request: Request) {
  // Public registration for Operario (no auth required)
  // Frontend sends: nombre, email, password, rol_id=2, activo=true (no confirmPassword)
  
  const { nombre, email, password, rol_id = 2, activo = true } = await request.json()

  // Validation (no confirmPassword required)
  if (!nombre || !email || !password) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  // 1. Log para la terminal de VS Code
  console.log("--- TEST DE LLAVES ---");
  console.log("URL existe:", !!supabaseUrl);
  console.log("Admin Key existe:", !!supabaseAdminKey);

  // 2. Validación estricta
  if (!supabaseUrl || !supabaseAdminKey) {
    return NextResponse.json({ error: "Faltan variables de entorno en el servidor" }, { status: 500 });
  }

  // 3. Creación del cliente
  const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Service role client to bypass RLS
  const serviceSupabase = supabaseAdmin

  // Check existing email
  const { data: existing } = await serviceSupabase
    .from('usuarios')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
  }

  // Create user with hashed password
  const hashedPassword = bcrypt.hashSync(password, 12)

  const { data: usuario, error } = await serviceSupabase
    .from('usuarios')
    .insert({
      nombre,
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      rol_id,
      activo
    })
    .select()
    .single()

  if (error) {
    console.error('Error de Supabase:', error)
    return NextResponse.json({ 
      error: error.message || error.details || 'Error desconocido en INSERT usuarios',
      code: error.code
    }, { status: 400 })
  }

  return NextResponse.json({
    message: 'Usuario registrado exitosamente',
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id
    }
  }, { status: 201 })

  // ADMIN CREATION (below for logged-in admins creating other users)
  /*
  const adminUser = await getServerUser()
  if (!adminUser || adminUser.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // ... admin logic using data-store
  */
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
