"use client"

import React from "react"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Plus, Pencil } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Tarifa {
  id: number
  tipo_vehiculo_id: number
  tipo_vehiculo_nombre: string
  nombre: string
  tipo_cobro: string
  valor: number
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
}

const TIPOS_COBRO = [
  { value: "POR_MINUTO", label: "Por Minuto" },
  { value: "POR_HORA", label: "Por Hora" },
  { value: "POR_DIA", label: "Por Dia" },
  { value: "FRACCION", label: "Por Fraccion (30 min)" },
]

export function TariffManagement() {
  const { data, isLoading } = useSWR("/api/tariffs", fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tarifa | null>(null)
  const [form, setForm] = useState({
    tipo_vehiculo_id: "",
    nombre: "",
    tipo_cobro: "",
    valor: "",
    activo: true,
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const tarifas: Tarifa[] = data?.tarifas || []

  function resetForm() {
    setForm({
      tipo_vehiculo_id: "",
      nombre: "",
      tipo_cobro: "",
      valor: "",
      activo: true,
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: "",
    })
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(tarifa: Tarifa) {
    setForm({
      tipo_vehiculo_id: String(tarifa.tipo_vehiculo_id),
      nombre: tarifa.nombre,
      tipo_cobro: tarifa.tipo_cobro,
      valor: String(tarifa.valor),
      activo: tarifa.activo,
      fecha_inicio: tarifa.fecha_inicio,
      fecha_fin: tarifa.fecha_fin || "",
    })
    setEditing(tarifa)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const url = "/api/tariffs"
      const method = editing ? "PUT" : "POST"
      const payload = editing
        ? { id: editing.id, ...form, tipo_vehiculo_id: Number(form.tipo_vehiculo_id), valor: Number(form.valor) }
        : { ...form, tipo_vehiculo_id: Number(form.tipo_vehiculo_id), valor: Number(form.valor) }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: resData.error })
        return
      }

      setMessage({ type: "success", text: resData.message })
      resetForm()
      mutate("/api/tariffs")
    } catch {
      setMessage({ type: "error", text: "Error de conexion" })
    } finally {
      setLoading(false)
    }
  }

  async function toggleTarifa(tarifa: Tarifa) {
    try {
      await fetch("/api/tariffs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tarifa.id, activo: !tarifa.activo }),
      })
      mutate("/api/tariffs")
    } catch {
      // silently fail
    }
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val)
  }

  function getTipoCobroLabel(tipo: string) {
    return TIPOS_COBRO.find((t) => t.value === tipo)?.label || tipo
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-48 rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
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

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editing ? "Editar Tarifa" : "Nueva Tarifa"}
            </CardTitle>
            <CardDescription>
              {editing ? "Modifique los datos de la tarifa" : "Configure una nueva tarifa para el parqueadero"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Tipo de Vehiculo</Label>
                <Select value={form.tipo_vehiculo_id} onValueChange={(v) => setForm({ ...form, tipo_vehiculo_id: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sedan</SelectItem>
                    <SelectItem value="2">Camioneta</SelectItem>
                    <SelectItem value="3">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Nombre de la Tarifa</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Tarifa Sedan por Hora"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Tipo de Cobro</Label>
                <Select value={form.tipo_cobro} onValueChange={(v) => setForm({ ...form, tipo_cobro: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_COBRO.map((tc) => (
                      <SelectItem key={tc.value} value={tc.value}>
                        {tc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Valor (COP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="5000"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Fecha Fin (Opcional)</Label>
                <Input
                  type="date"
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Switch
                  checked={form.activo}
                  onCheckedChange={(v) => setForm({ ...form, activo: v })}
                />
                <Label className="text-foreground">Tarifa Activa</Label>
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="h-11" disabled={loading}>
                  {loading ? "Guardando..." : editing ? "Actualizar" : "Crear Tarifa"}
                </Button>
                <Button type="button" variant="outline" className="h-11 bg-transparent" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tariffs table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Tarifas Configuradas</CardTitle>
            <CardDescription>{tarifas.length} tarifas registradas</CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarifa
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Nombre</TableHead>
                  <TableHead className="text-muted-foreground">Tipo Vehiculo</TableHead>
                  <TableHead className="text-muted-foreground">Cobro</TableHead>
                  <TableHead className="text-muted-foreground">Valor</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarifas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-foreground">{t.nombre}</TableCell>
                    <TableCell className="text-foreground">{t.tipo_vehiculo_nombre}</TableCell>
                    <TableCell className="text-foreground">{getTipoCobroLabel(t.tipo_cobro)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatCurrency(t.valor)}</TableCell>
                    <TableCell>
                      <Badge variant={t.activo ? "default" : "secondary"}>
                        {t.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={t.activo}
                          onCheckedChange={() => toggleTarifa(t)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
