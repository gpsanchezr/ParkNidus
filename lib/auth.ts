import { cookies } from "next/headers"
import { createClient } from '@supabase/supabase-js'
import type { Database } from "./supabase/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function getServerUser() {
  console.log('--- getServerUser CALLED ---')
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  console.log('Session ID from cookie:', sessionId || 'NO SESSION ID')
  
  if (!sessionId) {
    console.log('No session_id cookie')
    return null
  }

  console.log('Buscando session en DB con service_role...')
  const { data: session } = await supabaseAdmin
    .from('sesiones')
    .select('*')
    .eq('id', sessionId)
    .single()
    
  console.log('Session found:', session ? 'SÍ' : 'NO')
  
  if (!session) {
    console.log('Session not found in DB')
    return null
  }

  console.log('Buscando usuario ID:', session.usuario_id)
  const { data: usuario } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('id', session.usuario_id)
    .single()
    
  console.log('Usuario found:', usuario ? 'SÍ' : 'NO')
  
  if (!usuario || !usuario.activo) {
    console.log('Usuario null or inactive')
    return null
  }

  console.log('Usuario válido devuelto')
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol_id,
    rol_nombre: usuario.rol_id === 1 ? "Administrador" : "Operario",
  }
}
