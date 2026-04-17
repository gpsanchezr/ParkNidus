"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle } from "lucide-react"
import { getRegistrosEnCurso, finalizarRegistro, calcularCosto } from "@/lib/data-store"

export default function SalidaPage() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistro, setSelectedRegistro] = useState(null)
  const [finalizando, setFinalizando] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadRegistros()
  }, [])

  async function loadRegistros() {
    try {
      const data = await getRegistrosEnCurso()
      setRegistros(data)
    } catch (err) {
      console.error('Error loading registros:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFinalizar(registro) {
    setFinalizando(true)
    try {
      const resultado = await finalizarRegistro(registro.id, "1", 0) // usuario_salida_id, descuento
      if (resultado) {
        setSuccess(`Vehículo ${registro.placa} finalizado. Valor: $${resultado.registro.valor_calculado} | Ticket: ${resultado.ticket.codigo_ticket}`)
        loadRegistros()
      }
    } catch (err) {
      console.error('Error finalizando:', err)
    } finally {
      setFinalizando(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando vehículos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-glow-lime tracking-tight">
          Registrar Salida
        </h1>
        <Badge variant="secondary" className="text-lg">
          {registros.length} vehículos activos
        </Badge>
      </div>

      {registros.length === 0 ? (
        <Card className="card-neon text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-glow-orange mb-4" />
          <h3 className="text-xl font-bold text-glow-lime mb-2">No hay vehículos activos</h3>
          <p className="text-glow-violet">Todos los vehículos han sido retirados del parqueadero.</p>
        </Card>
      ) : (
        <Card className="card-neon overflow-hidden">
          <CardHeader>
            <CardTitle>Vehículos en Parqueadero (Estado: EN_CURSO)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Espacio</TableHead>
                  <TableHead>Hora Entrada</TableHead>
                  <TableHead>Tiempo Transcurrido</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro: any) => {
                  const minutos = Math.round((Date.now() - new Date(registro.fecha_hora_entrada).getTime()) / 60000)
                  return (
                    <TableRow key={registro.id} className="hover:bg-accent/50">
                      <TableCell className="font-mono font-bold text-glow-cyan">{registro.placa}</TableCell>
                      <TableCell>
                        <Badge variant={registro.tipos_vehiculo_id === 3 ? "secondary" : "default"}>
                          {registro.tipos_vehiculo?.nombre || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{registro.espacios?.codigo || 'N/A'}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(registro.fecha_hora_entrada).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-lg text-glow-lime">
                        {Math.floor(minutos / 60)}h {minutos % 60}m
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => handleFinalizar(registro)}
                          disabled={finalizando}
                          size="sm"
                          className="glow-orange hover:glow-orange font-bold"
                        >
                          {finalizando ? "Procesando..." : `SALIDA - $${0}`}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="card-neon border-green-500/50">
          <CardContent className="flex items-center gap-3 p-6 text-green-400">
            <CheckCircle className="h-8 w-8 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold">Salida Registrada</h3>
              <p>{success}</p>
              <Button onClick={() => setSuccess("")} className="mt-3 glow-green">
                Registrar otra salida
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
