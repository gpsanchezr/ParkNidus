"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Bike, DollarSign, Clock, ParkingSquare, TrendingUp } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DashboardOverviewProps {
  isAdmin: boolean
}

export function DashboardOverview({ isAdmin }: DashboardOverviewProps) {
  const { data: spacesData } = useSWR("/api/spaces", fetcher, { refreshInterval: 5000 })
  const { data: vehiclesData } = useSWR("/api/vehicles", fetcher, { refreshInterval: 5000 })
  const { data: reportsData } = useSWR(isAdmin ? "/api/reports" : null, fetcher)

  const cupos = spacesData?.cupos || {
    autosTotal: 30,
    autosDisponibles: 30,
    motosTotal: 15,
    motosDisponibles: 15,
  }
  const enCurso = vehiclesData?.enCurso?.length || 0
  const totalIngresos = reportsData?.reporte?.totalIngresos || 0
  const totalVehiculos = reportsData?.reporte?.totalVehiculos || 0

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cupos Autos
            </CardTitle>
            <Car className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.autosDisponibles}
              <span className="text-base font-normal text-muted-foreground">
                {" "}/ {cupos.autosTotal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cupos Motos
            </CardTitle>
            <Bike className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.motosDisponibles}
              <span className="text-base font-normal text-muted-foreground">
                {" "}/ {cupos.motosTotal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vehiculos Dentro
            </CardTitle>
            <Clock className="h-5 w-5 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{enCurso}</div>
            <p className="text-xs text-muted-foreground mt-1">Actualmente en el parqueadero</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Capacidad Total
            </CardTitle>
            <ParkingSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cupos.autosDisponibles + cupos.motosDisponibles}
              <span className="text-base font-normal text-muted-foreground">
                {" "}/ {cupos.autosTotal + cupos.motosTotal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Espacios libres</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin-only section */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos del Dia
              </CardTitle>
              <DollarSign className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalIngresos)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total recaudado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vehiculos Procesados
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalVehiculos}</div>
              <p className="text-xs text-muted-foreground mt-1">Entradas y salidas completadas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent vehicles */}
      {vehiclesData?.enCurso && vehiclesData.enCurso.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Vehiculos en el Parqueadero ({vehiclesData.enCurso.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vehiclesData.enCurso.slice(0, 6).map(
                (v: {
                  id: number
                  placa: string
                  tipo_vehiculo_nombre: string
                  espacio_codigo: string
                  fecha_hora_entrada: string
                }) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">{v.placa}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.tipo_vehiculo_nombre} - {v.espacio_codigo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(v.fecha_hora_entrada).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
            {vehiclesData.enCurso.length > 6 && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                y {vehiclesData.enCurso.length - 6} vehiculos mas...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
