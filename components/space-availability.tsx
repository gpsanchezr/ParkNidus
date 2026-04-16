"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Bike, ParkingSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SpaceAvailability() {
  const { data, isLoading } = useSWR("/api/spaces", fetcher, { refreshInterval: 5000 })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cupos = data?.cupos || { autosTotal: 30, autosDisponibles: 30, motosTotal: 15, motosDisponibles: 15 }
  const autosOcupados = cupos.autosTotal - cupos.autosDisponibles
  const motosOcupados = cupos.motosTotal - cupos.motosDisponibles
  const autosPercent = cupos.autosTotal > 0 ? (autosOcupados / cupos.autosTotal) * 100 : 0
  const motosPercent = cupos.motosTotal > 0 ? (motosOcupados / cupos.motosTotal) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Autos</CardTitle>
            <Car className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.autosDisponibles}
              <span className="text-lg font-normal text-muted-foreground"> / {cupos.autosTotal}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Espacios disponibles</p>
            <Progress value={autosPercent} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{autosOcupados} ocupados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Motos</CardTitle>
            <Bike className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.motosDisponibles}
              <span className="text-lg font-normal text-muted-foreground"> / {cupos.motosTotal}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Espacios disponibles</p>
            <Progress value={motosPercent} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{motosOcupados} ocupados</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <ParkingSquare className="h-5 w-5 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.autosDisponibles + cupos.motosDisponibles}
              <span className="text-lg font-normal text-muted-foreground"> / {cupos.autosTotal + cupos.motosTotal}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Espacios totales disponibles</p>
            <Progress
              value={((autosOcupados + motosOcupados) / (cupos.autosTotal + cupos.motosTotal)) * 100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Parking map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Mapa de Espacios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-foreground">Autos (A-01 a A-30)</h4>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
              {(data?.espacios || [])
                .filter((e: { tipo_vehiculo_id: number }) => e.tipo_vehiculo_id === 1 || e.tipo_vehiculo_id === 2)
                .map((e: { id: number; codigo: string; disponible: boolean }) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-center rounded-md border p-2 text-xs font-medium transition-colors ${
                      e.disponible
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {e.codigo}
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Motos (M-01 a M-15)</h4>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {(data?.espacios || [])
                .filter((e: { tipo_vehiculo_id: number }) => e.tipo_vehiculo_id === 3)
                .map((e: { id: number; codigo: string; disponible: boolean }) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-center rounded-md border p-2 text-xs font-medium transition-colors ${
                      e.disponible
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {e.codigo}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-accent/40 bg-accent/10" />
              Disponible
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-destructive/40 bg-destructive/10" />
              Ocupado
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
