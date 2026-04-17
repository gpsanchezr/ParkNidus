import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 1. Validación: Nos aseguramos de que las variables existan antes de conectar
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Revisa tu archivo .env.local')
}

// 2. Conexión: Usamos estrictamente la llave pública (ANON_KEY) para el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
