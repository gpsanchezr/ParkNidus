export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession, getUsuarioById } from '@/lib/data-store'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const session = await getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const usuario = await getUsuarioById(session.usuario_id)
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: 'User inactive' }, { status: 401 })
    }

    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol_id === 1 ? 'Administrador' : 'Operario'
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
