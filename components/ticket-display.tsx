"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Car } from "lucide-react"
import { useRef } from "react"

interface TicketDisplayProps {
  ticket: {
    id: number
    registro_id: number
    codigo_ticket: string
    fecha_emision: string
  }
  registro: {
    placa: string
    fecha_hora_entrada: string
    fecha_hora_salida: string | null
    minutos_totales: number | null
    valor_calculado: number | null
    descuento: number | null
  }
}

export function TicketDisplay({ ticket, registro }: TicketDisplayProps) {
  const ticketRef = useRef<HTMLDivElement>(null)

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val)
  }

  function formatTime(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}min`
    return `${m}min`
  }

  function handlePrint() {
    if (!ticketRef.current) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${ticket.codigo_ticket}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .big { font-size: 24px; }
            h2 { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>ParkControl</h2>
            <p>Sistema de Parqueadero</p>
          </div>
          <div class="line"></div>
          <div class="center bold">TICKET DE SALIDA</div>
          <div class="center">${ticket.codigo_ticket}</div>
          <div class="line"></div>
          <div class="row"><span>Placa:</span><span class="bold">${registro.placa}</span></div>
          <div class="row"><span>Entrada:</span><span>${new Date(registro.fecha_hora_entrada).toLocaleString("es-CO")}</span></div>
          <div class="row"><span>Salida:</span><span>${registro.fecha_hora_salida ? new Date(registro.fecha_hora_salida).toLocaleString("es-CO") : "-"}</span></div>
          <div class="row"><span>Tiempo:</span><span>${registro.minutos_totales ? formatTime(registro.minutos_totales) : "-"}</span></div>
          ${registro.descuento ? `<div class="row"><span>Descuento:</span><span>${registro.descuento}%</span></div>` : ""}
          <div class="line"></div>
          <div class="center big bold">${registro.valor_calculado !== null ? formatCurrency(registro.valor_calculado) : "$0"}</div>
          <div class="line"></div>
          <div class="center"><small>Emitido: ${new Date(ticket.fecha_emision).toLocaleString("es-CO")}</small></div>
          <div class="center"><small>Gracias por su visita</small></div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Card className="border-accent/30" ref={ticketRef}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Car className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="text-foreground">Ticket de Salida</CardTitle>
        <p className="text-sm font-mono text-muted-foreground">{ticket.codigo_ticket}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Placa</span>
            <span className="font-bold text-foreground">{registro.placa}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Entrada</span>
            <span className="text-foreground">{new Date(registro.fecha_hora_entrada).toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Salida</span>
            <span className="text-foreground">
              {registro.fecha_hora_salida ? new Date(registro.fecha_hora_salida).toLocaleString("es-CO") : "-"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Tiempo Total</span>
            <span className="font-semibold text-foreground">
              {registro.minutos_totales ? formatTime(registro.minutos_totales) : "-"}
            </span>
          </div>
          {registro.descuento !== null && registro.descuento > 0 && (
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Descuento</span>
              <span className="text-accent font-semibold">{registro.descuento}%</span>
            </div>
          )}
          <div className="mt-2 rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Pagado</p>
            <p className="text-3xl font-bold text-primary">
              {registro.valor_calculado !== null ? formatCurrency(registro.valor_calculado) : "$0"}
            </p>
          </div>
          <Button variant="outline" className="mt-2 bg-transparent" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
