"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Car, TrendingUp, Filter } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ReportsView() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [queryParams, setQueryParams] = useState("")

  const { data, isLoading } = useSWR(
    `/api/reports${queryParams}`,
    fetcher
  )

  function handleFilter() {
    const params = new URLSearchParams()
    if (fechaInicio) params.set("fechaInicio", fechaInicio)
    if (fechaFin) params.set("fechaFin", fechaFin)
    const qs = params.toString()
    setQueryParams(qs ? `?${qs}` : "")
  }

  function clearFilter() {
    setFechaInicio("")
    setFechaFin("")
    setQueryParams("")
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val)
  }

  const reporte = data?.reporte || { totalIngresos: 0, totalVehiculos: 0, porTipo: [] }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>Filtre los reportes por rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-11 w-48"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-11 w-48"
              />
            </div>
            <Button onClick={handleFilter} className="h-11">
              Aplicar Filtro
            </Button>
            <Button onClick={clearFilter} variant="outline" className="h-11 bg-transparent">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ingresos
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : formatCurrency(reporte.totalIngresos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos por parqueadero</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vehiculos Atendidos
            </CardTitle>
            <Car className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : reporte.totalVehiculos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de vehiculos procesados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio por Vehiculo
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading || reporte.totalVehiculos === 0
                ? "$0"
                : formatCurrency(Math.round(reporte.totalIngresos / reporte.totalVehiculos))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingreso promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* By vehicle type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Desglose por Tipo de Vehiculo</CardTitle>
          <CardDescription>Detalle de ingresos y cantidad de vehiculos por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-24 animate-pulse rounded bg-muted" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Tipo Vehiculo</TableHead>
                    <TableHead className="text-muted-foreground">Cantidad</TableHead>
                    <TableHead className="text-muted-foreground">Ingresos</TableHead>
                    <TableHead className="text-muted-foreground">Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporte.porTipo.map(
                    (item: { tipo: string; cantidad: number; ingresos: number }) => (
                      <TableRow key={item.tipo}>
                        <TableCell className="font-medium text-foreground">{item.tipo}</TableCell>
                        <TableCell className="text-foreground">{item.cantidad}</TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatCurrency(item.ingresos)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {reporte.totalIngresos > 0
                            ? `${Math.round((item.ingresos / reporte.totalIngresos) * 100)}%`
                            : "0%"}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  {reporte.porTipo.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay datos para mostrar. Registre entradas y salidas para generar reportes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
