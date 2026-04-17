import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import {
  getRegistroEnCursoByPlaca,
  calcularCosto,
  finalizarRegistro,
} from "@/lib/data-store"

// Preview cost before confirming exit
export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const url = new URL(request.url)
  const placa = url.searchParams.get("placa")
  if (!placa) return NextResponse.json({ error: "Placa requerida" }, { status: 400 })

  const registro = await getRegistroEnCursoByPlaca(placa)
  if (!registro) {
    return NextResponse.json({ error: "No se encontro un vehiculo con esa placa en el parqueadero" }, { status: 404 })
  }

  const { minutos, valor } = await calcularCosto(registro)

  return NextResponse.json({
    registro,
    minutos,
    valor,
    horas: Math.ceil(minutos / 60),
  })
}

// Confirm exit
export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await request.json()
  const { registro_id, descuento } = body

  if (!registro_id) {
    return NextResponse.json({ error: "ID de registro requerido" }, { status: 400 })
  }

  const result = await finalizarRegistro(registro_id, String(user.id), descuento || 0)
  if (!result) {
    return NextResponse.json({ error: "No se pudo finalizar el registro" }, { status: 400 })
  }

  return NextResponse.json({
    registro: result.registro,
    ticket: result.ticket,
    message: "Salida registrada exitosamente",
  })
}
