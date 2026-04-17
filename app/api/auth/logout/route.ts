export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/data-store"

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  if (sessionId) {
  await deleteSession(sessionId)
  }
  cookieStore.delete("session_id")
  return NextResponse.json({ ok: true })
}
