import { supabase } from './supabase'
import type { Database } from './supabase/database.types' // Auto-generated after schema

// Types from Supabase
type DB = Database['public']['Tables']

import bcrypt from 'bcryptjs';

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed)
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12)
}

// ROLES
export async function getRoles(): Promise<DB['roles']['Row'][]> {
  const { data, error } = await supabase.from('roles').select('*')
  if (error) throw error
  return data
}

// USUARIOS
export async function getUsuarios(): Promise<(DB['usuarios']['Row'] & { rol_nombre: string })[]> {
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      roles (nombre)
    `)
  if (error) throw error
  return usuarios!.map(u => ({
    ...u,
    rol_nombre: u.roles?.nombre || ''
  })) as any
}

export async function getUsuarioByEmail(email: string): Promise<DB['usuarios']['Row'] | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function getUsuarioById(id: string): Promise<DB['usuarios']['Row'] | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data || null
}

export async function createUsuario(data: {
  nombre: string
  email: string
  password: string
  rol_id: number
  activo?: boolean
}): Promise<DB['usuarios']['Row']> {
  const { data: user, error } = await supabase
    .from('usuarios')
    .insert({
      nombre: data.nombre,
      email: data.email,
      password_hash: hashPassword(data.password),
      rol_id: data.rol_id,
      activo: data.activo ?? true
    })
    .select()
    .single()
  if (error) throw error
  return user
}

export async function updateUsuario(id: string, data: {
  nombre?: string
  email?: string
  rol_id?: number
  activo?: boolean
  password?: string
}): Promise<DB['usuarios']['Row'] | null> {
  const updateData: any = { ...data }
  if (data.password) updateData.password_hash = hashPassword(data.password)
  delete updateData.password

  const { data: user, error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return user
}

// SESSIONS
export async function createSession(usuario_id: string): Promise<DB['sesiones']['Row']> {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const { data, error } = await supabase
    .from('sesiones')
    .insert({
      id: sessionId,
      usuario_id
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSession(id: string): Promise<DB['sesiones']['Row'] | null> {
  const { data, error } = await supabase
    .from('sesiones')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('sesiones')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// TIPOS VEHICULO
export async function getTiposVehiculo(): Promise<DB['tipos_vehiculo']['Row'][]> {
  const { data, error } = await supabase.from('tipos_vehiculo').select('*')
  if (error) throw error
  return data
}

// ESPACIOS
export async function getEspacios(): Promise<DB['espacios']['Row'][]> {
  const { data, error } = await supabase.from('espacios').select('*')
  if (error) throw error
  return data
}

export async function getEspaciosDisponibles(tipo_vehiculo_id: number): Promise<DB['espacios']['Row'][]> {
  let query = supabase
    .from('espacios')
    .select('*')
    .eq('disponible', true)
  
  if (tipo_vehiculo_id === 1 || tipo_vehiculo_id === 2) {
    query = query.or(`tipo_vehiculo_id.eq.1,tipo_vehiculo_id.eq.2`)
  } else {
    query = query.eq('tipo_vehiculo_id', tipo_vehiculo_id)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCuposInfo() {
  const { data: espacios, error } = await supabase.from('espacios').select('*')
  if (error) throw error

  const autosTotal = espacios.filter(e => e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2).length
  const autosDisponibles = espacios.filter(e => (e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2) && e.disponible).length
  const motosTotal = espacios.filter(e => e.tipo_vehiculo_id === 3).length
  const motosDisponibles = espacios.filter(e => e.tipo_vehiculo_id === 3 && e.disponible).length

  return { autosTotal, autosDisponibles, motosTotal, motosDisponibles }
}

export async function ocuparEspacio(id: string): Promise<void> {
  const { error } = await supabase
    .from('espacios')
    .update({ disponible: false })
    .eq('id', id)
  if (error) throw error
}

export async function liberarEspacio(id: string): Promise<void> {
  const { error } = await supabase
    .from('espacios')
    .update({ disponible: true })
    .eq('id', id)
  if (error) throw error
}

// TARIFAS
export async function getTarifas(): Promise<(DB['tarifas']['Row'] & { tipo_vehiculo_nombre: string })[]> {
  const { data: tarifas, error } = await supabase
    .from('tarifas')
    .select(`
      *,
      tipos_vehiculo(nombre)
    `)
  if (error) throw error
  return tarifas!.map(t => ({
    ...t,
    tipo_vehiculo_nombre: t.tipos_vehiculo?.nombre || ''
  })) as any
}

export async function getTarifaActiva(tipo_vehiculo_id: number): Promise<DB['tarifas']['Row'] | null> {
  const { data, error } = await supabase
    .from('tarifas')
    .select('*')
    .eq('tipo_vehiculo_id', tipo_vehiculo_id)
    .eq('activo', true)
    .order('fecha_inicio', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function createTarifa(data: Omit<DB['tarifas']['Insert'], 'id'>): Promise<DB['tarifas']['Row']> {
  const { data: tarifa, error } = await supabase
    .from('tarifas')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return tarifa
}

export async function updateTarifa(id: string, data: Partial<DB['tarifas']['Update']>): Promise<DB['tarifas']['Row'] | null> {
  const { data: tarifa, error } = await supabase
    .from('tarifas')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return tarifa
}

// REGISTROS
export async function getRegistros(): Promise<any[]> {
  const { data, error } = await supabase
    .from('registros')
    .select(`
      *,
      tipos_vehiculo(nombre),
      espacios(codigo),
      usuarios_entrada:nombre,
      usuarios_salida:nombre
    `)
  if (error) throw error
  return data
}

export async function getRegistrosEnCurso(): Promise<any[]> {
  const { data, error } = await supabase
    .from('registros')
    .select(`
      *,
      tipos_vehiculo(nombre),
      espacios(codigo)
    `)
    .eq('estado', 'EN_CURSO')
  if (error) throw error
  return data
}

export async function getRegistroEnCursoByPlaca(placa: string): Promise<DB['registros']['Row'] | null> {
  const { data, error } = await supabase
    .from('registros')
    .select('*')
    .eq('placa', placa.toUpperCase())
    .eq('estado', 'EN_CURSO')
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function createRegistro(data: {
  placa: string
  tipo_vehiculo_id: number
  espacio_id: string
  tarifa_id: number
  usuario_entrada_id: string
}): Promise<DB['registros']['Row']> {
  const { data: reg, error } = await supabase
    .from('registros')
    .insert({
      placa: data.placa.toUpperCase(),
      tipo_vehiculo_id: data.tipo_vehiculo_id,
      espacio_id: data.espacio_id,
      tarifa_id: data.tarifa_id,
      usuario_entrada_id: data.usuario_entrada_id
    })
    .select()
    .single()
  if (error) throw error

  await ocuparEspacio(data.espacio_id)
  return reg
}

export async function calcularCosto(registro: DB['registros']['Row']): Promise<{ minutos: number; valor: number }> {
  const tarifa = await getTarifaActiva(registro.tipo_vehiculo_id)
  if (!tarifa) return { minutos: 0, valor: 0 }

  const entrada = new Date(registro.fecha_hora_entrada)
  const salida = new Date()
  const diffMs = salida.getTime() - entrada.getTime()
  const minutos = Math.max(1, Math.ceil(diffMs / 60000))

  let valor = 0
  switch (tarifa.tipo_cobro) {
    case "POR_MINUTO":
      valor = minutos * Number(tarifa.valor)
      break
    case "POR_HORA":
      valor = Math.ceil(minutos / 60) * Number(tarifa.valor)
      break
    case "POR_DIA":
      valor = Math.ceil(minutos / 1440) * Number(tarifa.valor)
      break
    case "FRACCION":
      valor = Math.ceil(minutos / 30) * Number(tarifa.valor)
      break
  }

  return { minutos, valor }
}

export async function finalizarRegistro(
  id: string,
  usuario_salida_id: string,
  descuento = 0
): Promise<{ registro: DB['registros']['Row']; ticket: DB['tickets']['Row'] } | null> {
  const reg = await supabase
    .from('registros')
    .select('*')
    .eq('id', id)
    .eq('estado', 'EN_CURSO')
    .single()

  if (!reg.data) return null

  const { minutos, valor } = await calcularCosto(reg.data)
  const valorFinal = Math.max(0, valor - (valor * descuento / 100))

  // Update registro
  const { data: updatedReg, error: regError } = await supabase
    .from('registros')
    .update({
      fecha_hora_salida: new Date().toISOString(),
      minutos_totales: minutos,
      valor_calculado: Math.round(valorFinal),
      estado: 'FINALIZADO',
      usuario_salida_id,
      descuento
    })
    .eq('id', id)
    .select()
    .single()
  if (regError) throw regError

  await liberarEspacio(reg.data.espacio_id)

  // Create ticket
  const ticketCode = `TK-${Date.now().toString(36).toUpperCase()}`
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      registro_id: id,
      codigo_ticket: ticketCode
    })
    .select()
    .single()
  if (ticketError) throw ticketError

  return { registro: updatedReg!, ticket: ticket! }
}

export async function getTicketByRegistroId(registro_id: string): Promise<DB['tickets']['Row'] | null> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('registro_id', registro_id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function getTickets(): Promise<DB['tickets']['Row'][]> {
  const { data, error } = await supabase.from('tickets').select('*')
  if (error) throw error
  return data
}

// REPORTES
export async function getReporteIngresos(fechaInicio?: string, fechaFin?: string) {
  let query = supabase
    .from('registros')
    .select('*, tipos_vehiculo(nombre)')
    .eq('estado', 'FINALIZADO')

  if (fechaInicio) query = query.gte('fecha_hora_salida', fechaInicio)
  if (fechaFin) query = query.lte('fecha_hora_salida', fechaFin)

  const { data: registros, error } = await query
  if (error) throw error

  const totalIngresos = registros.reduce((sum, r: any) => sum + (r.valor_calculado || 0), 0)
  const totalVehiculos = registros.length

  const porTipo = {} as any
  registros.forEach((r: any) => {
    const tipo = r.tipos_vehiculo.nombre
    if (!porTipo[tipo]) porTipo[tipo] = { cantidad: 0, ingresos: 0 }
    porTipo[tipo].cantidad++
    porTipo[tipo].ingresos += (r.valor_calculado || 0)
  })

  return { totalIngresos, totalVehiculos, porTipo: Object.values(porTipo) }
}

