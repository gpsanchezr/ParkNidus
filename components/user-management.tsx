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
import { AlertCircle, CheckCircle2, Plus, Pencil, Shield, UserCog } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Usuario {
  id: number
  nombre: string
  email: string
  rol_id: number
  rol_nombre: string
  activo: boolean
  fecha_creacion: string
}

export function UserManagement() {
  const { data, isLoading } = useSWR("/api/users", fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: "",
    activo: true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const usuarios: Usuario[] = data?.usuarios || []

  function resetForm() {
    setForm({ nombre: "", email: "", password: "", rol_id: "", activo: true })
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(user: Usuario) {
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol_id: String(user.rol_id),
      activo: user.activo,
    })
    setEditing(user)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const method = editing ? "PUT" : "POST"
      const payload = editing
        ? {
            id: editing.id,
            nombre: form.nombre,
            email: form.email,
            rol_id: Number(form.rol_id),
            activo: form.activo,
            ...(form.password ? { password: form.password } : {}),
          }
        : {
            nombre: form.nombre,
            email: form.email,
            password: form.password,
            rol_id: Number(form.rol_id),
            activo: form.activo,
          }

      const res = await fetch("/api/users", {
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
      mutate("/api/users")
    } catch {
      setMessage({ type: "error", text: "Error de conexion" })
    } finally {
      setLoading(false)
    }
  }

  async function toggleUsuario(user: Usuario) {
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, activo: !user.activo }),
      })
      mutate("/api/users")
    } catch {
      // silently fail
    }
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
              {editing ? "Editar Usuario" : "Nuevo Usuario"}
            </CardTitle>
            <CardDescription>
              {editing
                ? "Modifique los datos del usuario. Deje la contrasena vacia para mantener la actual."
                : "Cree un nuevo usuario para el sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Nombre Completo</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del usuario"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Correo Electronico</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">
                  Contrasena {editing && "(dejar vacia para no cambiar)"}
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "Sin cambios" : "Contrasena"}
                  required={!editing}
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Rol</Label>
                <Select value={form.rol_id} onValueChange={(v) => setForm({ ...form, rol_id: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccione rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Operario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Switch
                  checked={form.activo}
                  onCheckedChange={(v) => setForm({ ...form, activo: v })}
                />
                <Label className="text-foreground">Usuario Activo</Label>
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="h-11" disabled={loading}>
                  {loading ? "Guardando..." : editing ? "Actualizar" : "Crear Usuario"}
                </Button>
                <Button type="button" variant="outline" className="h-11 bg-transparent" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Usuarios del Sistema</CardTitle>
            <CardDescription>{usuarios.length} usuarios registrados</CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Nombre</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Rol</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Creado</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground">{u.nombre}</TableCell>
                    <TableCell className="text-foreground">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {u.rol_id === 1 ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-foreground">{u.rol_nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? "default" : "secondary"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {new Date(u.fecha_creacion).toLocaleDateString("es-CO")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={u.activo}
                          onCheckedChange={() => toggleUsuario(u)}
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
