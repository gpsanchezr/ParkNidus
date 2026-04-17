export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import { getReporteIngresos, getTiposVehiculo } from "@/lib/data-store"

export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user || user.rol_id !== 1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const url = new URL(request.url)
  const fechaInicio = url.searchParams.get("fechaInicio") || undefined
  const fechaFin = url.searchParams.get("fechaFin") || undefined

  const reporte = await getReporteIngresos(fechaInicio, fechaFin)
  const tipos = await getTiposVehiculo()

  return NextResponse.json({ reporte, tipos })
}
