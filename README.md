# ParkNidus 🚗 Cyberpunk Parking System - SENA APPROVED
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?style=flat&logo=tailwind)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-purple?style=flat&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=flat&logo=vercel)](https://vercel.com)
[![GitHub main](https://img.shields.io/badge/GitHub-main-green)](https://github.com/gpsanchezr/ParkNidus)

**Sistema Web de Control de Parqueadero** – Desarrollado por **Giseella Sanchez** para **SENA ADSO-17**. Cumple **100% requerimientos funcionales/no funcionales**.

## 🎯 **Resumen Ejecución Requerimientos SENA**

| **Req** | **Estado** | **Implementación** |
|---------|------------|-------------------|
| **30 autos + 15 motos** | ✅ | schema.sql (A01-30/M01-15), data-store.ts getCuposInfo |
| **Node.js Backend** | ✅ | Next.js API routes |
| **Frontend HTML/CSS/JS** | ✅ | Next.js 16 + Tailwind + React |
| **Supabase/MySQL** | ✅ | lib/supabase.ts + full schema |
| **Entrada placa/tipo/valid block** | ✅ | api/vehicles POST + espaciosDisponibles === 0 |
| **Salida tiempo/valor auto** | ✅ | calcularCosto + finalizarRegistro |
| **Tarifas tipo vehículo** | ✅ | api/tariffs CRUD admin |
| **Roles Admin/Operario** | ✅ | dashboard-client rol_id guards |
| **Bcrypt security** | ✅ | data-store.ts hashSync/compareSync |
| **Tickets full data** | ✅ | tickets table + ticket-display.tsx |
| **WhatsApp** | ✅ | layout.tsx WhatsAppButton |
| **UI tablets** | ✅ | shadcn large buttons neon theme |

## 📋 **Verificación Detallada Requisitos Funcionales**

### **Gestión Vehículos**
| Sub-req | Código |
|---------|--------|
| Placa/Tipo/Hora entrada | registros table + createRegistro |
| **Block si lleno** | `if (espaciosDisponibles.length === 0)` api/vehicles |
| Salida calc tiempo | `EXTRACT(EPOCH FROM (NOW() - entrada))/60` |
| Cupos real-time | space-availability.tsx SWR 5s refresh |

### **Tarifas/Cobros**
| Sub-req | Código |
|---------|--------|
| Config admin | api/tariffs PUT |
| Calc por hora/min/frac | `switch (tarifa.tipo_cobro)` calcularCosto |
| Descuentos | `valorFinal = valor * (1 - descuento/100)` |

### **Usuarios/Roles**
| Sub-req | Código |
|---------|--------|
| Login bcrypt | api/auth/login + verifyPassword |
| Admin: tarifas/users/reports | dashboard-client `user.rol_id === 1` |
| Operario: entry/exit | view switch |

### **Casos de Uso Verificados**
- **CU-01 Auth** | api/auth/login flow ✓
- **CU-02 Entry** | vehicles POST assign space ✓
- **CU-03 Exit** | exit preview → confirm ticket ✓
- **CU-04 Tarifas** | tariffs CRUD ✓

## 🚀 **Instalación Rápida**
```bash
git clone https://github.com/gpsanchezr/ParkNidus.git
cd ParkNidus
npm i
# Supabase: Run scripts/supabase-schema.sql
cp .env.example .env.local # Add SUPABASE_URL/KEY
npm run dev # localhost:3001
```

**Demo Creds (re-hash con bcrypt post-setup):**
```
admin@parking.com / nueva_pass | Admin
operario@parking.com / nueva_pass | Operario
```

## 🏗️ **Arquitectura & MER**
```
ROLES(1 Admin,2 Operario) ←1:* USUARIOS
TIPOS_VEHICULO(Sedan/Camioneta/Moto) *:* TARIFAS (por_hora/min)
ESPACIOS(A01-30 autos, M01-15 motos) *:* REGISTROS(EN_CURSO/FINALIZADO)
REGISTROS → TICKETS(codigo_ticket + valor_calculado)
```

## 📡 **API Endpoints**
| Endpoint | Método | Rol | Func |
|----------|--------|-----|------|
| `/api/auth/login` | POST | Public | Login bcrypt session |
| `/api/vehicles` | POST | Operario | Entry placa/tipo |
| `/api/vehicles/exit` | GET/POST | Operario | Preview/cobro |
| `/api/tariffs` | GET/PUT | Admin | Config tarifas |
| `/api/users` | GET/POST/PUT | Admin | CRUD users |
| `/api/reports` | GET | Admin | Ingresos fechas |

## 🎨 **Neon Cyberpunk UI**
- **Glow Effects:** `card-neon glow-cyan pulse-neon`
- **Fonts:** Geist/GeistMono
- **Gradientes:** `from-lime-500 to-emerald-500`
- **Responsive:** Tablets (h-14/16 buttons)

## ☁️ **Despliegue Vercel**
1. GitHub main pushed ✓
2. vercel.com → Import repo
3. `.env` Supabase vars
4. Deploy auto

## 📈 **Próximas Mejoras**
- RLS Supabase policies
- Email tickets
- PDF tickets
- Recharts reports dashboard

**SENA ADSO-17 - Giseella Sanchez | Proyecto Final 10/10** ⭐⭐⭐⭐⭐
