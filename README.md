# ParkNidus - Sistema de Control de Parqueadero

**Desarrollado por Giseella Sanchez Rico**

[![Neon Pulse](https://img.shields.io/badge/Theme-Neon%20Pulse-brightgreen)](https://github.com/gpsanchezr/ParkNidus)
[![Supabase](https://img.shields.io/badge/DB-Supabase-blueviolet)](https://supabase.com)

Sistema web **Cyberpunk** para control de parqueadero que cumple 100% con los requerimientos del proyecto:

- 30 espacios autos (15 sedan + 15 camioneta)
- 15 espacios motos  
- Cálculo automático tarifas (hora/minuto)
- Botón WhatsApp integrado
- Dashboard impactante Neon Pulse

## 🎮 Demo

```
npm install
npm run dev
```

**Credenciales**:
- Admin: `admin@parking.com` / `admin123`
- Operario: `operario@parking.com` / `oper123`

## 🏗️ Arquitectura

```mermaid
graph TB
  User[Usuario Web]
  Next[Next.js 16 App Router]
  API[API Routes]
  Supabase[(Supabase PG)]
  WhatsApp[(WhatsApp API)]
  
  User -->|HTTPS| Next
  Next --> API
  API --> Supabase
  Next --> WhatsApp
  
  Supabase -->|Tables| DB[(roles<br/>usuarios<br/>espacios<br/>registros<br/>tarifas<br/>tickets)]
```

## 📋 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/spaces` | Espacios disponibles + cupos |
| POST | `/api/vehicles` | Entrada vehículo |
| POST | `/api/vehicles/exit` | Salida vehículo + cobro |
| GET | `/api/reports` | Reportes ingresos |
| GET | `/api/tariffs` | Tarifas activas |
| GET | `/api/users` | Usuarios |

## 🚀 Supabase Setup

1. Ejecuta `scripts/supabase-schema.sql`
2. `.env.local` ya configurado
3. `npm i @supabase/supabase-js`

## 🎨 Neon Pulse Theme

```css
Primary: hsl(189 99% 55%) - Cyan Eléctrico
Secondary: hsl(271 74% 50%) - Violeta Profundo  
Accent: hsl(162 85% 45%) - Lima Neón
```

Modo oscuro por defecto, alto contraste cyberpunk.

## 📱 Features

✅ 45 espacios total (30 auto + 15 moto)  
✅ Cálculo tarifas reales  
✅ Autenticación rol-based  
✅ Reportes diarios  
✅ Tickets WhatsApp  
✅ Responsive shadcn/ui  
✅ TypeScript completo  

**Desarrollado por Giseella Sanchez Rico** 👩‍💻
