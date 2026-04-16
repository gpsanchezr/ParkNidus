"use client"

import React from "react"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, LogIn } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function VehicleEntryForm() {
  const { data: spacesData } = useSWR("/api/spaces", fetcher, { refreshInterval: 5000 })
  const [placa, setPlaca] = useState("")
  const [tipoVehiculo, setTipoVehiculo] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastEntry, setLastEntry] = useState<{ placa: string; espacio: string; hora: string } | null>(null)

  const cupos = spacesData?.cupos

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLastEntry(null)
    setLoading(true)

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: placa.toUpperCase(),
          tipo_vehiculo_id: Number(tipoVehiculo),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error })
        return
      }

      setMessage({ type: "success", text: data.message })
      setLastEntry({
        placa: data.registro.placa,
        espacio: data.espacio_codigo,
        hora: new Date(data.registro.fecha_hora_entrada).toLocaleString("es-CO"),
      })
      setPlaca("")
      setTipoVehiculo("")
      mutate("/api/spaces")
      mutate("/api/vehicles")
    } catch {
      setMessage({ type: "error", text: "Error de conexion" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Available spaces summary */}
      {cupos && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={cupos.autosDisponibles === 0 ? "border-destructive/50" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Cupos Autos</p>
                <p className="text-2xl font-bold text-foreground">{cupos.autosDisponibles} / {cupos.autosTotal}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                cupos.autosDisponibles > 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              }`}>
                <LogIn className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className={cupos.motosDisponibles === 0 ? "border-destructive/50" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Cupos Motos</p>
                <p className="text-2xl font-bold text-foreground">{cupos.motosDisponibles} / {cupos.motosTotal}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                cupos.motosDisponibles > 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              }`}>
                <LogIn className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Registrar Entrada de Vehiculo</CardTitle>
          <CardDescription>Complete los datos del vehiculo que ingresa al parqueadero</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {message && (
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                  message.type === "success"
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="placa" className="text-foreground">Placa del Vehiculo</Label>
              <Input
                id="placa"
                placeholder="Ej: ABC123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                required
                className="h-12 text-base uppercase"
                maxLength={7}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo" className="text-foreground">Tipo de Vehiculo</Label>
              <Select value={tipoVehiculo} onValueChange={setTipoVehiculo} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Seleccione tipo de vehiculo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sedan</SelectItem>
                  <SelectItem value="2">Camioneta</SelectItem>
                  <SelectItem value="3">Moto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="h-12 text-base font-semibold" disabled={loading || !tipoVehiculo}>
              {loading ? "Registrando..." : "Registrar Entrada"}
            </Button>
          </form>

          {lastEntry && (
            <div className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <h4 className="font-semibold text-accent mb-2">Entrada Registrada</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Placa</p>
                  <p className="font-semibold text-foreground">{lastEntry.placa}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Espacio</p>
                  <p className="font-semibold text-foreground">{lastEntry.espacio}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hora</p>
                  <p className="font-semibold text-foreground">{lastEntry.hora}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
