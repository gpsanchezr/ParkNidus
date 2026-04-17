"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SalidaPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistro, setSelectedRegistro] = useState<any>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadRegistros()
  }, [])

  async function loadRegistros() {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select(`
          *,
          tipos_vehiculo(nombre),
          espacios(codigo)
        `)
        .eq('estado', 'EN_CURSO')

      if (error) throw error
      console.log("Registros en curso:", data)
      setRegistros(data || [])
    } catch (err: any) {
      console.error('Error loading registros:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleFinalizar(registro: any) {
    setFinalizando(true)
    try {
      // Simular finalización (implementar tu lógica)
      console.log("Finalizando registro:", registro.id)
      setSuccess(`Vehículo ${registro.placa} finalizado exitosamente`)
      loadRegistros()
    } catch (err: any) {
      console.error('Error finalizando:', err)
    } finally {
      setFinalizando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
          🚪 Registrar Salida
        </h1>
        <Badge variant="secondary" className="text-xl px-4 py-2">
          {registros.length} vehículos activos
        </Badge>
      </div>

      {registros.length === 0 ? (
        <Card className="card-neon text-center py-16 border-orange-500/30">
          <AlertCircle className="mx-auto h-16 w-16 text-orange-400 mb-6 opacity-75" />
          <h3 className="text-2xl font-bold text-gray-200 mb-3">¡Parqueadero vacío!</h3>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            No hay vehículos activos en el parqueadero. Todos han sido retirados correctamente.
          </p>
        </Card>
      ) : (
        <Card className="card-neon overflow-hidden shadow-2xl border-orange-500/20">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-black text-orange-400">
              Vehículos Pendientes de Salida (Estado: EN_CURSO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-500/30">
                    <TableHead className="text-orange-400 font-bold text-lg">Placa</TableHead>
                    <TableHead className="text-orange-400 font-bold text-lg">Tipo</TableHead>
                    <TableHead className="text-orange-400 font-bold text-lg">Espacio</TableHead>
                    <TableHead className="text-orange-400 font-bold text-lg">Entrada</TableHead>
                    <TableHead className="text-orange-400 font-bold text-lg">Tiempo</TableHead>
                    <TableHead className="text-orange-400 font-bold text-lg">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((registro: any) => {
                    const entradaTime = new Date(registro.fecha_hora_entrada)
                    const minutos = Math.round((Date.now() - entradaTime.getTime()) / 60000)
                    const horas = Math.floor(minutos / 60)
                    
                    return (
                      <TableRow key={registro.id} className="hover:bg-orange-500/10 border-b border-orange-500/20 transition-colors">
                        <TableCell className="font-mono font-bold text-2xl text-orange-300">
                          {registro.placa}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-lg px-4 py-2 font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                            {registro.tipos_vehiculo?.nombre || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xl text-gray-300">
                          {registro.espacios?.codigo || 'N/A'}
                        </TableCell>
                        <TableCell className="text-lg text-gray-400">
                          {entradaTime.toLocaleString('es-CO')}
                        </TableCell>
                        <TableCell className="font-mono text-xl font-bold text-lime-400">
                          {horas > 0 && `${horas}h `}{minutos % 60}m
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            onClick={() => handleFinalizar(registro)}
                            disabled={finalizando}
                            size="lg"
                            className="glow-orange hover:glow-orange font-black text-lg px-8 py-3 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all min-w-[180px]"
                          >
                            {finalizando ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              "💰 FINALIZAR"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="card-neon border-green-500/50 bg-green-500/5 backdrop-blur-xl border-2 shadow-2xl animate-in fade-in zoom-in duration-500">
          <CardContent className="p-8 flex items-start gap-4">
            <CheckCircle className="h-12 w-12 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-2xl font-black text-green-400 mb-3">¡Salida Registrada!</h3>
              <p className="text-xl text-green-300 leading-relaxed">{success}</p>
              <Button 
                onClick={() => setSuccess("")} 
                className="mt-6 glow-green hover:glow-green font-bold bg-green-600 hover:bg-green-700"
              >
                📋 Registrar Otra Salida
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
