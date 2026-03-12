

# Plan: Panel de Estadísticas de Leads (WhatsApp Clicks)

## Enfoque

En lugar de crear una ruta separada `/admin/estadisticas`, agrego una nueva pestaña "Leads" al AdminDashboard existente. Ya está protegido por rol admin, ya tiene el sistema de tabs, y crear una ruta nueva solo para esto es innecesario y fragmenta la experiencia admin.

## Hallazgos del Hacker Ético

**No hay macanas nuevas.** La tabla `lead_clicks` ya tiene RLS correcto (solo admins leen). El JOIN con `professionals` funciona porque admins tienen SELECT en ambas tablas. Sin riesgo para Pioneros.

**Un detalle**: la query no necesita migración SQL — todo se resuelve con un SELECT + JOIN desde el frontend.

## Archivos a crear/modificar

### 1. Crear `src/components/admin/LeadClicksPanel.tsx`

Componente independiente con:
- Query via React Query (`useQuery`) que hace SELECT en `lead_clicks` con JOIN a `professionals` (nombre, profesión)
- Agrupación client-side por `professional_id` para calcular total de clics por profesional
- Tabla con columnas: Nombre, Categoría/Profesión, Total de Contactos
- Input de búsqueda para filtrar por nombre
- Ordenamiento por total de clics (descendente)
- Indicador de carga y estado vacío
- `staleTime: 5min` para no bombardear la DB

### 2. Editar `src/pages/AdminDashboard.tsx`

- Agregar TabsTrigger "Leads" después de "Campañas" (posición lógica: datos de conversión)
- Agregar TabsContent que renderiza `<LeadClicksPanel />`
- Import del componente

## Detalle técnico de la query

```typescript
const { data } = await supabase
  .from('lead_clicks')
  .select('professional_id, created_at, professionals(full_name, profession)')
```

Luego agrupo en el frontend con un `reduce()` por `professional_id` para contar totales. No necesito una vista SQL ni función RPC — la data es poca (cientos/miles de filas) y el admin ya tiene permiso de SELECT.

## Interfaz

Uso los componentes shadcn/ui existentes: `Table`, `TableHeader`, `TableRow`, `TableCell`, `Input`, `Card`, `Badge`. Estilo consistente con el resto del admin dashboard.

