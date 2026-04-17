

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import type { Database } from "@/lib/supabase/database.types"
import { getUsuarioByEmail } from "@/lib/data-store"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('--- LOGIN API LLAMADA ---')
    const body = await request.json()
    const { email, password } = body

    console.log('Email recibido:', email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const usuario = await getUsuarioByEmail(email)
    if (!usuario) {
      console.log('Usuario no encontrado')
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    console.log('Usuario encontrado:', usuario.id)

    if (!usuario.activo) {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 })
    }

    if (!bcrypt.compareSync(password, usuario.password_hash)) {
      console.log('Contraseña incorrecta')
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    console.log('Contraseña correcta - Creando sesión')

    // Service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sesiones')
      .insert({
        id: sessionId,
        usuario_id: usuario.id
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Session Error:', sessionError)
      return NextResponse.json({ error: 'Error creando sesión: ' + sessionError.message }, { status: 500 })
    }

    console.log('Sesión creada:', sessionId)

    // Set cookie CRÍTICO
    const cookieStore = await cookies()
    await cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    console.log('Cookie seteada:', sessionId)

    // RETORNO EXPLÍCITO CRÍTICO
    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol_id === 1 ? "Administrador" : "Operario"
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('LOGIN API ERROR GLOBAL:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 })
  }
}
