export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import {
  getRegistrosEnCurso,
  getRegistros,
  createRegistro,
  getEspaciosDisponibles,
  getTarifaActiva,
  getRegistroEnCursoByPlaca,
} from "@/lib/data-store"

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const enCurso = await getRegistrosEnCurso()
  const todos = await getRegistros()
  return NextResponse.json({ enCurso, todos })
}

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await request.json()
  const { placa, tipo_vehiculo_id } = body

  if (!placa || !tipo_vehiculo_id) {
    return NextResponse.json({ error: "Placa y tipo de vehiculo son requeridos" }, { status: 400 })
  }

  // Check if vehicle is already inside
  const yaAdentro = await getRegistroEnCursoByPlaca(placa)
  if (yaAdentro) {
    return NextResponse.json({ error: "Este vehiculo ya se encuentra en el parqueadero" }, { status: 400 })
  }

  // Check available spaces
  const espaciosDisponibles = await getEspaciosDisponibles(tipo_vehiculo_id)
  if (espaciosDisponibles.length === 0) {
    return NextResponse.json({ error: "No hay cupos disponibles para este tipo de vehiculo" }, { status: 400 })
  }

  // Get active tariff
  const tarifa = await getTarifaActiva(tipo_vehiculo_id)
  if (!tarifa) {
    return NextResponse.json({ error: "No hay tarifa configurada para este tipo de vehiculo" }, { status: 400 })
  }

  const espacio = espaciosDisponibles[0]
  const registro = await createRegistro({
    placa,
    tipo_vehiculo_id,
    espacio_id: espacio.id,
    tarifa_id: tarifa.id,
    usuario_entrada_id: String(user.id),
  })

  return NextResponse.json({
    registro,
    espacio_codigo: espacio.codigo,
    message: `Vehiculo ${placa} registrado en espacio ${espacio.codigo}`,
  })
}
