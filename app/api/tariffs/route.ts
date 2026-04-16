import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import { getTarifas, createTarifa, updateTarifa } from "@/lib/data-store"

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const tarifas = getTarifas()
  return NextResponse.json({ tarifas })
}

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const { tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio, fecha_fin } = body

  if (!tipo_vehiculo_id || !nombre || !tipo_cobro || valor === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const tarifa = createTarifa({
    tipo_vehiculo_id,
    nombre,
    tipo_cobro,
    valor: Number(valor),
    activo: activo ?? true,
    fecha_inicio: fecha_inicio || new Date().toISOString().split("T")[0],
    fecha_fin: fecha_fin || null,
  })

  return NextResponse.json({ tarifa, message: "Tarifa creada exitosamente" })
}

export async function PUT(request: Request) {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: "ID de tarifa requerido" }, { status: 400 })
  }

  if (data.valor !== undefined) data.valor = Number(data.valor)

  const tarifa = updateTarifa(id, data)
  if (!tarifa) {
    return NextResponse.json({ error: "Tarifa no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ tarifa, message: "Tarifa actualizada exitosamente" })
}
