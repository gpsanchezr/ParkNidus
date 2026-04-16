// Generated Supabase types - run npx supabase gen if schema changes
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles.id"
            columns: ["id"]
            referencedRelation: "usuarios"
            referencedColumns: ["rol_id"]
          }
        ]
      }
      usuarios: {
        Row: {
          id: number
          nombre: string
          email: string
          password_hash: string
          rol_id: number
          activo: boolean
          fecha_creacion: string
        }
        // ... more tables: tipos_vehiculo, espacios, tarifas, registros, tickets, sesiones
      }
      // Add all tables from schema.sql: tipos_vehiculo, espacios, tarifas, registros, tickets, sesiones
    }
    Functions: {
      v_vehiculos_en_curso: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          placa: string
          tipo_vehiculo: string
          espacio: string
          fecha_hora_entrada: string
          minutos_transcurridos: number
          tarifa_aplicada: string
          operario_entrada: string
        }[]
      }
      v_disponibilidad: {
        Args: Record<PropertyKey, never>
        Returns: {
          tipo_vehiculo: string
          total_espacios: number
          disponibles: number
          ocupados: number
        }[]
      }
    }
    Views: {
      v_vehiculos_en_curso: {
        Row: any
      }
      v_disponibilidad: {
        Row: any
      }
    }
    Enums: {
      
    }
    CompositeTypes: {
      
    }
  }
}

