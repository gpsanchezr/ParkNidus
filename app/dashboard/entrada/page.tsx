"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getEspaciosDisponibles, getTiposVehiculo, getTarifaActiva, createRegistro } from "@/lib/data-store"

export default function EntradaPage() {
  const [placa, setPlaca] = useState("")
  const [tipoVehiculoId, setTipoVehiculoId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tiposVehiculo, setTiposVehiculo] = useState([])
  const [espaciosDisponibles, setEspaciosDisponibles] = useState(0)
  const router = useRouter()

  // Load data on mount
  async function loadData() {
    try {
      const tipos = await getTiposVehiculo()
      setTiposVehiculo(tipos)
      
      if (tipoVehiculoId) {
        const espacios = await getEspaciosDisponibles(parseInt(tipoVehiculoId))
        setEspaciosDisponibles(espacios.length)
      }
    } catch (err) {
      setError("Error cargando datos")
    }
  }

  async function handleTipoChange(id: string) {
    setTipoVehiculoId(id)
    const espacios = await getEspaciosDisponibles(parseInt(id))
    setEspaciosDisponibles(espacios.length)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate cupos
      if (espaciosDisponibles === 0) {
        setError("No hay cupos disponibles para este tipo de vehículo")
        return
      }

      // Get available space
      const espacios = await getEspaciosDisponibles(parseInt(tipoVehiculoId))
      const espacioId = espacios[0].id

      // Get active tariff
      const tarifa = await getTarifaActiva(parseInt(tipoVehiculoId))
      if (!tarifa) {
        setError("No hay tarifa activa para este tipo de vehículo")
        return
      }

      // Create registro
      const registro = await createRegistro({
        placa: placa.toUpperCase(),
        tipo_vehiculo_id: parseInt(tipoVehiculoId),
        espacio_id: espacioId,
        tarifa_id: tarifa.id,
        usuario_entrada_id: "1" // TODO: Get from session
      })

      setSuccess(`Vehículo ${placa} registrado en espacio ${espacios[0].codigo}. Ticket: ${registro.id}`)
      setPlaca("")
      setTipoVehiculoId("")
      setEspaciosDisponibles(0)
    } catch (err) {
      setError(err.message || "Error al registrar vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-glow-cyan tracking-tight">
        Registrar Entrada de Vehículo
      </h1>
      
      <Card className="card-neon max-w-2xl">
        <CardHeader>
          <CardTitle>Cupos Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          {tiposVehiculo.map((tipo: any) => (
            <div key={tipo.id} className="p-4 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 backdrop-blur">
              <div className="text-2xl font-bold text-glow-cyan">{tipo.nombre}</div>
              <div className="text-sm text-glow-lime">
                Espacios disponibles: {tipo.id === 3 ? espaciosDisponibles || 0 : 'N/A'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label>Placa del Vehículo</Label>
          <Input
            placeholder="ABC123"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            required
            className="h-12 card-neon"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Vehículo</Label>
          <Select value={tipoVehiculoId} onValueChange={handleTipoChange}>
            <SelectTrigger className="h-12 card-neon">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposVehiculo.map((tipo: any) => (
                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tipoVehiculoId && (
            <p className="text-sm text-glow-lime">
              Espacios disponibles: {espaciosDisponibles || 0}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border-red-500/40 bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl border-green-500/40 bg-green-500/10">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" className="h-14 w-full text-xl font-black glow-green" disabled={loading || !tipoVehiculoId || !placa || espaciosDisponibles === 0}>
          {loading ? "Registrando..." : "REGISTRAR ENTRADA"}
        </Button>
      </form>
    </div>
  )
}
