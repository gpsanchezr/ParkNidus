import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"
import { getCuposInfo, getEspacios } from "@/lib/data-store"

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const cupos = getCuposInfo()
  const espacios = getEspacios()
  return NextResponse.json({ cupos, espacios })
}
