
# Plan: Simplificacion Radical del Dashboard Profesional

## Resumen

Reducir el dashboard a una herramienta de consulta rapida que quepa en una sola pantalla: eliminar tabs innecesarios (Analytics, Combos, Calendario, Finanzas), reducir acciones rapidas a 4, mover estado de suscripcion al header, y reemplazar metricas complejas por actividad reciente.

---

## Cambios

### 1. Simplificar ActiveUserDashboard (`src/components/dashboard/ActiveUserDashboard.tsx`)

**Acciones rapidas**: Reducir de 6 tiles a 4:
- "Ver mi Perfil Publico" (Eye, azul)
- "Editar Mis Servicios" (Package, verde)
- "Mis Mensajes" (MessageCircle, naranja)
- "Galeria de Trabajos" (Camera, purpura)

Eliminar: "Configuracion" y "Mi Plan Pioneros"

**Grid**: Cambiar de `grid-cols-3` a `grid-cols-2 sm:grid-cols-4` para que las 4 acciones quepan en una fila en desktop.

**Metricas**: Eliminar la seccion completa de MetricCards (visitas, solicitudes, calificacion) y el link "Ver estadisticas completas". Reemplazar por la seccion de "Consultas Recientes" que ya existe (moverla arriba, justo despues del widget de visibilidad).

**Suscripcion en header**: Agregar una pequena tarjeta/badge dorado arriba del saludo o junto al nombre que diga "Plan Pioneros: Activo - X dias restantes". Usar el hook `useSubscription` para obtener los dias.

### 2. Eliminar tabs innecesarios (`src/pages/ProfessionalDashboard.tsx`)

**Tabs a eliminar de la TabsList y sus TabsContent**:
- `analytics` (Analytics)
- `combos` (Combos)
- `calendar` (Calendario)
- `financial` (Finanzas)

**Tabs que permanecen** (8 tabs):
- `requests` (Solicitudes)
- `messages` (Mensajes)
- `reviews` (Resenas)
- `services` (Servicios)
- `portfolio` (Portfolio)
- `transactions` (Trabajos)
- `subscription` (Suscripcion)
- `profile` (Mi Perfil)
- `settings` (Config)

**Imports a eliminar**:
- `ProfessionalAnalytics`
- `CombosManager`
- `AvailabilityCalendar`
- `AgendaManager`
- `FinancialDashboard`
- `BarChart3` icon

**TabsList grid**: Cambiar de `grid-cols-6 md:grid-cols-12` a `grid-cols-5 md:grid-cols-9` para ajustar al nuevo numero de tabs.

**Boton "Ver todas las opciones"**: Cambiar texto a "Gestionar mi negocio" para ser mas directo.

### 3. Layout compacto para above-the-fold

En `ActiveUserDashboard.tsx`:
- Reducir padding de secciones de `p-6` a `p-4` 
- Reducir `space-y-6` del wrapper a `space-y-4`
- Las consultas recientes mantienen limit 3 pero con items mas compactos (menos padding)
- Eliminar el `py-8` del empty state, usar `py-4`

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ActiveUserDashboard.tsx` | 4 acciones rapidas, eliminar metricas, agregar badge suscripcion, layout compacto |
| `src/pages/ProfessionalDashboard.tsx` | Eliminar 4 tabs (analytics, combos, calendar, financial), limpiar imports |

## Estructura visual resultante (above the fold)

```text
+------------------------------------------+
| Header                                   |
+------------------------------------------+
| Hola, MAXIMILIANO 👋                     |
| Plomero           [Plan Pioneros: 365d]  |
+------------------------------------------+
| [EN LINEA] Activo en Rafaela    [switch] |
+------------------------------------------+
| Consultas Recientes                      |
| > Juan - "Necesito arreglar..."  hace 2h |
| > Maria - "Presupuesto para..." hace 1d |
| > Pedro - "Consulta sobre..."   hace 3d |
| [Ver todas las consultas]                |
+------------------------------------------+
| [Perfil] [Servicios] [Mensajes] [Galeria]|
+------------------------------------------+
| [Gestionar mi negocio]                   |
+------------------------------------------+
```
