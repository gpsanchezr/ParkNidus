"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarFront, UserPlus, Mail, Lock, User, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rol_id: 2, // Operario fijo
          activo: true
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        return
      }

      // Mostrar mensaje neón verde
      setError("¡Usuario registrado con éxito! Redirigiendo...")
      
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900 p-4">
      <Card className="w-full max-w-md card-neon glow-cyan mx-auto fade-in-up">
        <CardHeader className="text-center">
<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-500 shadow-2xl glow-lime pulse-neon">
            <CarFront className="h-10 w-10 text-glow-cyan" />
          </div>
          <CardTitle className="text-3xl font-black bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent text-glow-lime">
            Nuevo Operario
          </CardTitle>
          <CardDescription className="text-glow-violet">
            Crea tu cuenta gratuita (Rol: Operario)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
{error && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-bold backdrop-blur-md shadow-2xl animate-pulse transition-all duration-500 ${
                error.includes('éxito') 
                  ? 'card-neon border-lime-500/50 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 text-lime-100 glow-lime' 
                  : 'border-red-500/40 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-100 glow-red'
              }`}>
                <CheckCircle className={`h-5 w-5 shrink-0 ${error.includes('éxito') ? 'text-lime-400' : 'text-red-400'}`} />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label className="text-glow-lime font-semibold uppercase text-xs tracking-wider">👤 Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-glow-lime font-semibold uppercase text-xs tracking-wider">📧 Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="operario@parking.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-glow-lime font-semibold uppercase text-xs tracking-wider">🔒 Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="pl-10 h-12"
                  minLength={6}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="h-14 w-full font-black uppercase tracking-wider text-sm bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 shadow-lg glow-lime text-black"
              disabled={loading}
            >
              {loading ? "CREANDO..." : "REGISTRAR OPERARIO"}
            </Button>
            <div className="text-center pt-4 border-t border-gray-700 text-xs text-gray-400">
              <a href="/" className="hover:text-glow-lime transition-colors">← Ya tengo cuenta</a>
              <span> | Rol Admin contacta al SuperAdmin</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

