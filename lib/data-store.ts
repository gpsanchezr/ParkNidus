// In-memory data store simulating MySQL database structure
// This mirrors the MER defined in the project requirements

export interface Role {
  id: number
  nombre: string
  descripcion: string
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  password_hash: string
  rol_id: number
  activo: boolean
  fecha_creacion: string
}

export interface TipoVehiculo {
  id: number
  nombre: string
  descripcion: string
}

export interface Espacio {
  id: number
  codigo: string
  tipo_vehiculo_id: number
  disponible: boolean
}

export interface Tarifa {
  id: number
  tipo_vehiculo_id: number
  nombre: string
  tipo_cobro: "POR_MINUTO" | "POR_HORA" | "POR_DIA" | "FRACCION"
  valor: number
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
}

export interface Registro {
  id: number
  placa: string
  tipo_vehiculo_id: number
  espacio_id: number
  fecha_hora_entrada: string
  fecha_hora_salida: string | null
  minutos_totales: number | null
  tarifa_id: number
  valor_calculado: number | null
  estado: "EN_CURSO" | "FINALIZADO"
  usuario_entrada_id: number
  usuario_salida_id: number | null
  descuento: number | null
}

export interface Ticket {
  id: number
  registro_id: number
  codigo_ticket: string
  email_cliente: string | null
  enviado_email: boolean
  fecha_emision: string
}

export interface Session {
  id: string
  usuario_id: number
  created_at: string
}

// Simple hash function for demo (simulates bcrypt)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `hashed_${Math.abs(hash).toString(36)}_${str.length}`
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return simpleHash(plain) === hashed
}

export function hashPassword(plain: string): string {
  return simpleHash(plain)
}

// Initialize data
const roles: Role[] = [
  { id: 1, nombre: "Administrador", descripcion: "Configurar tarifas, gestionar usuarios, ver reportes" },
  { id: 2, nombre: "Operario", descripcion: "Registrar entradas y salidas, generar tickets" },
]

const usuarios: Usuario[] = [
  {
    id: 1,
    nombre: "Admin Principal",
    email: "admin@parking.com",
    password_hash: simpleHash("admin123"),
    rol_id: 1,
    activo: true,
    fecha_creacion: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Operario 1",
    email: "operario@parking.com",
    password_hash: simpleHash("oper123"),
    rol_id: 2,
    activo: true,
    fecha_creacion: new Date().toISOString(),
  },
]

const tiposVehiculo: TipoVehiculo[] = [
  { id: 1, nombre: "Sedan", descripcion: "Vehiculo tipo sedan" },
  { id: 2, nombre: "Camioneta", descripcion: "Vehiculo tipo camioneta/SUV" },
  { id: 3, nombre: "Moto", descripcion: "Motocicleta" },
]

// Generate 30 spaces for autos + 15 for motos
const espacios: Espacio[] = []
for (let i = 1; i <= 30; i++) {
  espacios.push({
    id: i,
    codigo: `A-${String(i).padStart(2, "0")}`,
    tipo_vehiculo_id: i <= 15 ? 1 : 2, // 15 sedan, 15 camioneta
    disponible: true,
  })
}
for (let i = 1; i <= 15; i++) {
  espacios.push({
    id: 30 + i,
    codigo: `M-${String(i).padStart(2, "0")}`,
    tipo_vehiculo_id: 3,
    disponible: true,
  })
}

const tarifas: Tarifa[] = [
  {
    id: 1,
    tipo_vehiculo_id: 1,
    nombre: "Tarifa Sedan por Hora",
    tipo_cobro: "POR_HORA",
    valor: 5000,
    activo: true,
    fecha_inicio: "2025-01-01",
    fecha_fin: null,
  },
  {
    id: 2,
    tipo_vehiculo_id: 2,
    nombre: "Tarifa Camioneta por Hora",
    tipo_cobro: "POR_HORA",
    valor: 7000,
    activo: true,
    fecha_inicio: "2025-01-01",
    fecha_fin: null,
  },
  {
    id: 3,
    tipo_vehiculo_id: 3,
    nombre: "Tarifa Moto por Hora",
    tipo_cobro: "POR_HORA",
    valor: 3000,
    activo: true,
    fecha_inicio: "2025-01-01",
    fecha_fin: null,
  },
]

const registros: Registro[] = []
const tickets: Ticket[] = []
const sessions: Session[] = []

let nextUsuarioId = 3
let nextTarifaId = 4
let nextRegistroId = 1
let nextTicketId = 1

// ---- ROLES ----
export function getRoles(): Role[] {
  return [...roles]
}

// ---- USUARIOS ----
export function getUsuarios(): (Usuario & { rol_nombre: string })[] {
  return usuarios.map((u) => ({
    ...u,
    rol_nombre: roles.find((r) => r.id === u.rol_id)?.nombre || "",
  }))
}

export function getUsuarioByEmail(email: string): Usuario | undefined {
  return usuarios.find((u) => u.email === email)
}

export function getUsuarioById(id: number): Usuario | undefined {
  return usuarios.find((u) => u.id === id)
}

export function createUsuario(data: Omit<Usuario, "id" | "fecha_creacion" | "password_hash"> & { password: string }): Usuario {
  const newUser: Usuario = {
    id: nextUsuarioId++,
    nombre: data.nombre,
    email: data.email,
    password_hash: hashPassword(data.password),
    rol_id: data.rol_id,
    activo: data.activo,
    fecha_creacion: new Date().toISOString(),
  }
  usuarios.push(newUser)
  return newUser
}

export function updateUsuario(id: number, data: Partial<Omit<Usuario, "id" | "fecha_creacion">> & { password?: string }): Usuario | null {
  const idx = usuarios.findIndex((u) => u.id === id)
  if (idx === -1) return null
  if (data.nombre !== undefined) usuarios[idx].nombre = data.nombre
  if (data.email !== undefined) usuarios[idx].email = data.email
  if (data.rol_id !== undefined) usuarios[idx].rol_id = data.rol_id
  if (data.activo !== undefined) usuarios[idx].activo = data.activo
  if (data.password) usuarios[idx].password_hash = hashPassword(data.password)
  return usuarios[idx]
}

// ---- SESSIONS ----
export function createSession(usuario_id: number): Session {
  const session: Session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    usuario_id,
    created_at: new Date().toISOString(),
  }
  sessions.push(session)
  return session
}

export function getSession(id: string): Session | undefined {
  return sessions.find((s) => s.id === id)
}

export function deleteSession(id: string): void {
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx !== -1) sessions.splice(idx, 1)
}

// ---- TIPOS VEHICULO ----
export function getTiposVehiculo(): TipoVehiculo[] {
  return [...tiposVehiculo]
}

// ---- ESPACIOS ----
export function getEspacios(): Espacio[] {
  return [...espacios]
}

export function getEspaciosDisponibles(tipo_vehiculo_id: number): Espacio[] {
  // For sedan and camioneta, spaces are shared (auto spaces: ids 1-30)
  if (tipo_vehiculo_id === 1 || tipo_vehiculo_id === 2) {
    return espacios.filter((e) => (e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2) && e.disponible)
  }
  return espacios.filter((e) => e.tipo_vehiculo_id === tipo_vehiculo_id && e.disponible)
}

export function getCuposInfo() {
  const autosTotal = espacios.filter((e) => e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2).length
  const autosDisponibles = espacios.filter((e) => (e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2) && e.disponible).length
  const motosTotal = espacios.filter((e) => e.tipo_vehiculo_id === 3).length
  const motosDisponibles = espacios.filter((e) => e.tipo_vehiculo_id === 3 && e.disponible).length
  return { autosTotal, autosDisponibles, motosTotal, motosDisponibles }
}

export function ocuparEspacio(id: number): void {
  const espacio = espacios.find((e) => e.id === id)
  if (espacio) espacio.disponible = false
}

export function liberarEspacio(id: number): void {
  const espacio = espacios.find((e) => e.id === id)
  if (espacio) espacio.disponible = true
}

// ---- TARIFAS ----
export function getTarifas(): (Tarifa & { tipo_vehiculo_nombre: string })[] {
  return tarifas.map((t) => ({
    ...t,
    tipo_vehiculo_nombre: tiposVehiculo.find((tv) => tv.id === t.tipo_vehiculo_id)?.nombre || "",
  }))
}

export function getTarifaActiva(tipo_vehiculo_id: number): Tarifa | undefined {
  return tarifas.find((t) => t.tipo_vehiculo_id === tipo_vehiculo_id && t.activo)
}

export function createTarifa(data: Omit<Tarifa, "id">): Tarifa {
  const newTarifa: Tarifa = { id: nextTarifaId++, ...data }
  tarifas.push(newTarifa)
  return newTarifa
}

export function updateTarifa(id: number, data: Partial<Omit<Tarifa, "id">>): Tarifa | null {
  const idx = tarifas.findIndex((t) => t.id === id)
  if (idx === -1) return null
  Object.assign(tarifas[idx], data)
  return tarifas[idx]
}

// ---- REGISTROS ----
export function getRegistros(): (Registro & { tipo_vehiculo_nombre: string; espacio_codigo: string })[] {
  return registros.map((r) => ({
    ...r,
    tipo_vehiculo_nombre: tiposVehiculo.find((tv) => tv.id === r.tipo_vehiculo_id)?.nombre || "",
    espacio_codigo: espacios.find((e) => e.id === r.espacio_id)?.codigo || "",
  }))
}

export function getRegistrosEnCurso(): (Registro & { tipo_vehiculo_nombre: string; espacio_codigo: string })[] {
  return registros
    .filter((r) => r.estado === "EN_CURSO")
    .map((r) => ({
      ...r,
      tipo_vehiculo_nombre: tiposVehiculo.find((tv) => tv.id === r.tipo_vehiculo_id)?.nombre || "",
      espacio_codigo: espacios.find((e) => e.id === r.espacio_id)?.codigo || "",
    }))
}

export function getRegistroEnCursoByPlaca(placa: string): Registro | undefined {
  return registros.find((r) => r.placa.toUpperCase() === placa.toUpperCase() && r.estado === "EN_CURSO")
}

export function createRegistro(data: {
  placa: string
  tipo_vehiculo_id: number
  espacio_id: number
  tarifa_id: number
  usuario_entrada_id: number
}): Registro {
  const reg: Registro = {
    id: nextRegistroId++,
    placa: data.placa.toUpperCase(),
    tipo_vehiculo_id: data.tipo_vehiculo_id,
    espacio_id: data.espacio_id,
    fecha_hora_entrada: new Date().toISOString(),
    fecha_hora_salida: null,
    minutos_totales: null,
    tarifa_id: data.tarifa_id,
    valor_calculado: null,
    estado: "EN_CURSO",
    usuario_entrada_id: data.usuario_entrada_id,
    usuario_salida_id: null,
    descuento: null,
  }
  registros.push(reg)
  ocuparEspacio(data.espacio_id)
  return reg
}

export function calcularCosto(registro: Registro): { minutos: number; valor: number } {
  const tarifa = tarifas.find((t) => t.id === registro.tarifa_id)
  if (!tarifa) return { minutos: 0, valor: 0 }
  
  const entrada = new Date(registro.fecha_hora_entrada)
  const salida = new Date()
  const diffMs = salida.getTime() - entrada.getTime()
  const minutos = Math.max(1, Math.ceil(diffMs / 60000))
  
  let valor = 0
  switch (tarifa.tipo_cobro) {
    case "POR_MINUTO":
      valor = minutos * tarifa.valor
      break
    case "POR_HORA":
      valor = Math.ceil(minutos / 60) * tarifa.valor
      break
    case "POR_DIA":
      valor = Math.ceil(minutos / 1440) * tarifa.valor
      break
    case "FRACCION":
      valor = Math.ceil(minutos / 30) * tarifa.valor
      break
  }
  
  return { minutos, valor }
}

export function finalizarRegistro(
  id: number,
  usuario_salida_id: number,
  descuento?: number
): { registro: Registro; ticket: Ticket } | null {
  const reg = registros.find((r) => r.id === id)
  if (!reg || reg.estado !== "EN_CURSO") return null
  
  const { minutos, valor } = calcularCosto(reg)
  const descuentoVal = descuento || 0
  const valorFinal = Math.max(0, valor - (valor * descuentoVal / 100))
  
  reg.fecha_hora_salida = new Date().toISOString()
  reg.minutos_totales = minutos
  reg.valor_calculado = Math.round(valorFinal)
  reg.estado = "FINALIZADO"
  reg.usuario_salida_id = usuario_salida_id
  reg.descuento = descuentoVal
  
  liberarEspacio(reg.espacio_id)
  
  const ticket: Ticket = {
    id: nextTicketId++,
    registro_id: reg.id,
    codigo_ticket: `TK-${Date.now().toString(36).toUpperCase()}`,
    email_cliente: null,
    enviado_email: false,
    fecha_emision: new Date().toISOString(),
  }
  tickets.push(ticket)
  
  return { registro: reg, ticket }
}

export function getTicketByRegistroId(registro_id: number): Ticket | undefined {
  return tickets.find((t) => t.registro_id === registro_id)
}

export function getTickets(): Ticket[] {
  return [...tickets]
}

// ---- REPORTES ----
export function getReporteIngresos(fechaInicio?: string, fechaFin?: string) {
  let filtrados = registros.filter((r) => r.estado === "FINALIZADO")
  
  if (fechaInicio) {
    filtrados = filtrados.filter((r) => r.fecha_hora_salida && r.fecha_hora_salida >= fechaInicio)
  }
  if (fechaFin) {
    filtrados = filtrados.filter((r) => r.fecha_hora_salida && r.fecha_hora_salida <= fechaFin)
  }
  
  const totalIngresos = filtrados.reduce((sum, r) => sum + (r.valor_calculado || 0), 0)
  const totalVehiculos = filtrados.length
  
  const porTipo = tiposVehiculo.map((tv) => {
    const regs = filtrados.filter((r) => r.tipo_vehiculo_id === tv.id)
    return {
      tipo: tv.nombre,
      cantidad: regs.length,
      ingresos: regs.reduce((sum, r) => sum + (r.valor_calculado || 0), 0),
    }
  })
  
  return { totalIngresos, totalVehiculos, porTipo }
}
