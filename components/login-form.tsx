"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, CarFront, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rolId, setRolId] = useState("2")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rol_id: rolId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión")
        return
      }

      console.log("REDIRECCIÓN INICIADA A /DASHBOARD")
      setLoading(false)
      window.location.assign('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError("Error de conexión. Intente nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 p-8 relative overflow-hidden fade-in-up z-10">
      <Card className="w-full max-w-lg card-neon glow-cyan mx-auto fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl glow-lime pulse-neon">
            <Car className="h-10 w-10 text-glow-cyan drop-shadow-lg" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg text-glow-cyan mb-1">ParkNidus</CardTitle>
          <CardDescription className="text-glow-lime text-lg backdrop-blur-sm">
            Sistema de Control de Parqueadero Cyberpunk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl card-neon border-red-500/40 bg-gradient-to-r from-red-500/20 to-rose-500/20 p-4 text-sm backdrop-blur-md glow-red shadow-xl animate-pulse">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-glow-cyan font-semibold tracking-wide uppercase text-sm">📧 Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-lg card-neon border-cyan-500/50 bg-black/30 backdrop-blur-md focus:ring-2 focus:ring-glow-cyan"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-glow-violet font-semibold tracking-wide uppercase text-sm">🔒 Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 text-lg card-neon border-purple-500/50 bg-black/30 backdrop-blur-md focus:ring-2 focus:ring-glow-violet"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-glow-lime font-semibold tracking-wide uppercase text-sm">🎛️ Tipo de Acceso</Label>
              <Select value={rolId} onValueChange={setRolId}>
                <SelectTrigger className="h-14 card-neon border-lime-500/50 bg-black/30 backdrop-blur-md focus:ring-2 focus:ring-glow-lime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="card-neon backdrop-blur-xl border-lime-500/50 w-[300px]">
                  <SelectItem value="1" className="text-glow-cyan">
                    🔐 Administrador (Tarifas/Usuarios/Reportes)
                  </SelectItem>
                  <SelectItem value="2" className="text-glow-lime">
                    ⚙️ Operario (Entradas/Salidas/Cupos)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-16 text-xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-glow-cyan pulse-neon shadow-2xl glow-cyan transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 border-0 drop-shadow-2xl" disabled={loading}>
              {loading ? "🔐 ACCEDIENDO AL SISTEMA..." : "INICIAR SESIÓN"}
            </Button>

            <div className="flex items-center justify-between text-xs text-glow-violet mt-6 pt-4 border-t border-cyan-500/30 px-1">
              <a href="#" className="hover:text-glow-cyan transition-all duration-300 font-mono uppercase tracking-wider">¿Olvidaste tu clave?</a>
              <a href="/registro" className="hover:text-glow-cyan transition-all duration-300 font-bold uppercase tracking-wider">Regístrate</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
