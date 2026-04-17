import { NextResponse } from 'next/server'
import { hashPassword, createUsuario } from '@/lib/data-store'
import { getUsuarioByEmail } from '@/lib/data-store'

export async function POST(request: Request) {
  try {
    const { nombre, email, password, confirmPassword } = await request.json()

    if (!nombre || !email || !password || password !== confirmPassword) {
      return NextResponse.json({ error: 'Datos incompletos o contraseñas no coinciden' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existingUser = await getUsuarioByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    }

    const hashedPassword = hashPassword(password)
    const usuario = await createUsuario({
      nombre,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      rol_id: 2, // Operario por defecto
      activo: true
    })

    return NextResponse.json({
      message: 'Usuario registrado exitosamente como Operario',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

