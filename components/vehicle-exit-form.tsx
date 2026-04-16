"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle2, Search, Receipt } from "lucide-react"
import { TicketDisplay } from "./ticket-display"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface PreviewData {
  registro: {
    id: number
    placa: string
    tipo_vehiculo_id: number
    espacio_id: number
    fecha_hora_entrada: string
    tarifa_id: number
  }
  minutos: number
  valor: number
  horas: number
}

interface TicketData {
  id: number
  registro_id: number
  codigo_ticket: string
  fecha_emision: string
}

interface RegistroData {
  id: number
  placa: string
  tipo_vehiculo_id: number
  espacio_id: number
  fecha_hora_entrada: string
  fecha_hora_salida: string | null
  minutos_totales: number | null
  valor_calculado: number | null
  estado: string
  descuento: number | null
}

export function VehicleExitForm() {
  const { data: vehiclesData } = useSWR("/api/vehicles", fetcher, { refreshInterval: 5000 })
  const [placa, setPlaca] = useState("")
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [descuento, setDescuento] = useState("")
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [ticketData, setTicketData] = useState<{
    ticket: TicketData
    registro: RegistroData
  } | null>(null)

  const enCurso = vehiclesData?.enCurso || []

  async function handleSearch(searchPlaca?: string) {
    const searchValue = searchPlaca || placa
    if (!searchValue) return

    setSearching(true)
    setMessage(null)
    setPreview(null)
    setTicketData(null)

    try {
      const res = await fetch(`/api/vehicles/exit?placa=${encodeURIComponent(searchValue)}`)
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error })
        return
      }

      setPreview(data)
      setPlaca(searchValue)
    } catch {
      setMessage({ type: "error", text: "Error de conexion" })
    } finally {
      setSearching(false)
    }
  }

  async function handleConfirmExit() {
    if (!preview) return
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/vehicles/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registro_id: preview.registro.id,
          descuento: Number(descuento) || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error })
        return
      }

      setMessage({ type: "success", text: data.message })
      setTicketData({ ticket: data.ticket, registro: data.registro })
      setPreview(null)
      setPlaca("")
      setDescuento("")
      mutate("/api/spaces")
      mutate("/api/vehicles")
    } catch {
      setMessage({ type: "error", text: "Error de conexion" })
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val)
  }

  function calcDescuentoValue() {
    if (!preview) return 0
    const d = Number(descuento) || 0
    return Math.round(preview.valor * d / 100)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Registrar Salida de Vehiculo</CardTitle>
          <CardDescription>Busque por placa o seleccione de la lista de vehiculos en el parqueadero</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
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

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por placa..."
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                className="h-12 text-base uppercase"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch() }}}
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              className="h-12 px-6"
              disabled={searching || !placa}
            >
              <Search className="mr-2 h-4 w-4" />
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cost preview */}
      {preview && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Receipt className="h-5 w-5 text-primary" />
              Resumen de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Placa</span>
                  <span className="font-semibold text-foreground">{preview.registro.placa}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Entrada</span>
                  <span className="font-medium text-foreground">
                    {new Date(preview.registro.fecha_hora_entrada).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Tiempo</span>
                  <span className="font-medium text-foreground">
                    {preview.horas > 0 ? `${preview.horas}h ` : ""}{preview.minutos % 60}min ({preview.minutos} min total)
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{formatCurrency(preview.valor)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="descuento" className="text-foreground">Descuento (%)</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="h-12 text-base"
                  />
                  {Number(descuento) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Descuento: -{formatCurrency(calcDescuentoValue())}
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(Math.max(0, preview.valor - calcDescuentoValue()))}
                  </p>
                </div>
                <Button
                  onClick={handleConfirmExit}
                  className="h-12 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Confirmar Salida y Cobro"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket */}
      {ticketData && (
        <TicketDisplay ticket={ticketData.ticket} registro={ticketData.registro} />
      )}

      {/* Vehicles inside */}
      {enCurso.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Vehiculos en el Parqueadero ({enCurso.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Placa</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Espacio</TableHead>
                    <TableHead className="text-muted-foreground">Entrada</TableHead>
                    <TableHead className="text-muted-foreground">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enCurso.map((r: { id: number; placa: string; tipo_vehiculo_nombre: string; espacio_codigo: string; fecha_hora_entrada: string }) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-foreground">{r.placa}</TableCell>
                      <TableCell className="text-foreground">{r.tipo_vehiculo_nombre}</TableCell>
                      <TableCell className="text-foreground">{r.espacio_codigo}</TableCell>
                      <TableCell className="text-foreground">{new Date(r.fecha_hora_entrada).toLocaleString("es-CO")}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPlaca(r.placa)
                            handleSearch(r.placa)
                          }}
                        >
                          Registrar Salida
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
