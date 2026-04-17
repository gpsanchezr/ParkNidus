"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function EntradaPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")
  const [tiposVehiculo, setTiposVehiculo] = useState<any[]>([])
  const [cupos, setCupos] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    console.log("🔄 Iniciando carga de datos...")
    
    try {
      setIsLoading(true)
      setError("")

      // 1. SELECT id, nombre FROM tipos_vehiculo
      console.log("📋 Cargando tipos de vehículo...")
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_vehiculo')
        .select('id, nombre')
        .order('nombre')

      console.log("Tipos cargados:", tiposData)
      
      if (tiposError) {
        console.error("❌ Error tipos:", tiposError)
        throw tiposError
      }
      setTiposVehiculo(tiposData || [])

      // 2. SELECT count FROM espacios WHERE disponible = true
      console.log("🅿️ Cargando cupos disponibles...")
      const { count: cuposCount, error: cuposError } = await supabase
        .from('espacios')
        .select('*', { count: 'exact', head: true })
        .eq('disponible', true)

      console.log("Cupos cargados:", cuposCount)

      if (cuposError) {
        console.error("❌ Error cupos:", cuposError)
        throw cuposError
      }
      setCupos(cuposCount || 0)

    } catch (err: any) {
      console.error("💥 Error total:", err)
      setError('Error cargando datos: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTipoChange = (value: string) => {
    console.log("Tipo seleccionado:", value)
    setTipoSeleccionado(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const placaInput = (e.target as any).querySelector('input[placeholder*="ABC123"]')
    const placa = placaInput?.value?.toUpperCase().trim()
    
    if (!placa) {
      alert('❌ Ingresa la placa del vehículo')
      return
    }
    
    if (!tipoSeleccionado) {
      alert('❌ Selecciona el tipo de vehículo')
      return
    }
    
    if (cupos === 0) {
      alert('❌ No hay cupos disponibles')
      return
    }
    
    console.log('🚀 Submit - Placa:', placa, 'Tipo:', tipoSeleccionado, 'Cupos:', cupos)
    
    setSubmitLoading(true)
    
    try {
      const tipoId = parseInt(tipoSeleccionado)
      
      // Obtener primer espacio disponible para el tipo
      const { data: espacioDisponible } = await supabase
        .from('espacios')
        .select('id, codigo')
        .eq('disponible', true)
        .gte('tipo_vehiculo_id', 1)
        .lte('tipo_vehiculo_id', 3)
        .limit(1)
        .single()
      
      if (!espacioDisponible) {
        alert('❌ No hay espacios disponibles para este tipo de vehículo')
        return
      }
      
      // Obtener tarifa activa
      const { data: tarifa } = await supabase
        .from('tarifas')
        .select('id')
        .eq('tipo_vehiculo_id', tipoId)
        .eq('activo', true)
        .single()
      
      if (!tarifa) {
        alert('❌ No hay tarifa activa para este tipo de vehículo')
        return
      }
      
      // Obtener usuario actual (operario)
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        alert('❌ No autenticado')
        return
      }
      
      // Insert registro
      const { error } = await supabase
        .from('registros')
        .insert({
          placa,
          tipo_vehiculo_id: tipoId,
          espacio_id: espacioDisponible.id,
          tarifa_id: tarifa.id,
          usuario_entrada_id: user.user.id,
          estado: 'EN_CURSO'
        })
      
      if (error) {
        console.error('❌ Error insert registro:', error)
        alert('❌ Error al registrar entrada: ' + error.message)
        return
      }
      
      // Ocupar espacio
      await supabase
        .from('espacios')
        .update({ disponible: false })
        .eq('id', espacioDisponible.id)
      
      alert('✅ ¡Vehículo registrado con éxito!')
      console.log('✅ Registro creado:', { placa, tipoId, espacio: espacioDisponible.codigo })
      
      // Reset form
      placaInput.value = ''
      setTipoSeleccionado('')
      loadData() // Recargar cupos
      
    } catch (err: any) {
      console.error('💥 Error total:', err)
      alert('❌ Error: ' + err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const placeholderText = isLoading ? "Cargando opciones..." : "Selecciona tipo de vehículo"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl mb-4">
            🚗 Registrar Entrada
          </h1>
          <p className="text-xl text-gray-400">Sistema de control de parqueadero inteligente</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cupos */}
          <Card className="group bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black text-cyan-400 flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-xl">📊</div>
                Cupos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12">
              <div className={`text-8xl font-black mb-6 transition-all duration-500 ${
                cupos > 10 ? 'text-green-400' : cupos > 0 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {cupos}
              </div>
              <div className="text-2xl font-mono text-gray-300">de 45 espacios totales</div>
            </CardContent>
          </Card>

          {/* Formulario */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white">Datos del Vehículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Placa */}
                <div>
                  <Label className="text-xl font-bold text-gray-200 mb-4 block uppercase tracking-wider">
                    Placa
                  </Label>
                  <Input 
                    placeholder="Ej: ABC123" 
                    className="h-20 text-4xl font-mono uppercase tracking-widest bg-white/10 border-2 border-cyan-500/50 backdrop-blur-xl hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30 rounded-2xl shadow-xl transition-all duration-300" 
                  />
                </div>

                {/* Tipo */}
                <div>
                  <Label className="text-xl font-bold text-gray-200 mb-4 block uppercase tracking-wider">
                    Tipo de Vehículo
                  </Label>
                  <Select value={tipoSeleccionado} onValueChange={handleTipoChange}>
                    <SelectTrigger className="h-20 text-3xl font-mono bg-white/10 border-2 border-cyan-500/50 backdrop-blur-xl hover:border-cyan-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30 rounded-2xl shadow-xl transition-all duration-300">
                      <SelectValue placeholder={placeholderText} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-2 border-cyan-500/30 backdrop-blur-xl min-w-[400px] p-2">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-cyan-400">
                          <Loader2 className="h-8 w-8 animate-spin mr-3" />
                          <span className="text-xl">Cargando tipos...</span>
                        </div>
                      ) : tiposVehiculo.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                          No hay tipos disponibles
                        </div>
                      ) : (
                        tiposVehiculo.map((tipo: any) => (
                          <SelectItem 
                            key={tipo.id} 
                            value={tipo.id.toString()} 
                            className="text-2xl font-mono h-20 hover:bg-cyan-500/20 border-b border-white/10 py-4 rounded-xl cursor-pointer transition-all hover:scale-105"
                          >
                            {tipo.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-8 bg-red-500/20 border-2 border-red-500/50 rounded-3xl backdrop-blur-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="h-12 w-12 text-red-400 flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-red-300 mb-2">Error de carga</h3>
                        <p className="text-lg text-red-200 leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button 
                  type="submit" 
                  disabled={submitLoading || isLoading || tiposVehiculo.length === 0}
                  className="h-auto py-8 w-full text-xl font-black uppercase tracking-wide shadow-3xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-800 border-2 border-emerald-500/50 hover:border-emerald-400 whitespace-normal leading-tight flex flex-col items-center justify-center gap-1 text-white rounded-3xl backdrop-blur-xl transform hover:scale-[1.02] transition-all duration-500 hover:shadow-emerald-500/50 group"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mr-3 group-hover:animate-spin-reverse flex-shrink-0" />
                      Registrando...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mr-3 flex-shrink-0" />
                      Cargando datos...
                    </>
                  ) : (
                    `🚀 Registrar Entrada
(${cupos} cupos libres)`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Debug */}
        <Card className="bg-slate-900/80 border border-cyan-500/50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/20 pb-3">
            🐛 DEBUG INFO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-1 tracking-wide uppercase">Tipos Vehículo</div>
              <div className="text-cyan-400 font-mono text-2xl font-bold">{tiposVehiculo.length}</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-1 tracking-wide uppercase">Cupos Libres</div>
              <div className="text-cyan-400 font-mono text-2xl font-bold">{cupos}</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-1 tracking-wide uppercase">Tipo Seleccionado</div>
              <div className="text-cyan-400 font-mono text-xl font-bold">{tipoSeleccionado || 'Ninguno'}</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20">
            <Button 
              onClick={loadData} 
              className="w-full border-cyan-500 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400 hover:text-white font-mono font-semibold tracking-wide"
              size="lg"
            >
              🔄 Recargar Datos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
