import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { getTarifas, getTarifaActiva, createTarifa, updateTarifa } from '@/lib/data-store'

export async function GET() {
  try {
    const tarifas = await getTarifas()
    return NextResponse.json(tarifas)
  } catch (error) {
    console.error('Tarifas GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || user.rol_id !== 1) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    const data = await request.json()
    const tarifa = await createTarifa(data)
    return NextResponse.json(tarifa, { status: 201 })
  } catch (error) {
    console.error('Tarifas POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || user.rol_id !== 1) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    const { id, ...data } = await request.json()
    const tarifa = await updateTarifa(id, data)
    return NextResponse.json(tarifa)
  } catch (error) {
    console.error('Tarifas PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
