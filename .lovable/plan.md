

# Plan: Limpieza Final del Dashboard Profesional

## Resumen

Reorganizar las acciones rapidas del dashboard activo a solo 3 botones grandes y elegantes, eliminar tabs innecesarias del menu inferior, y mejorar el espaciado general.

---

## Cambios

### 1. ActiveUserDashboard.tsx - Acciones Rapidas de 3 botones

**ZONA 4 (lineas 228-279):** Reemplazar completamente la seccion actual (tile grande de Mensajes + grid de 3 iconos pequenos) por un grid de 3 botones grandes y elegantes en una sola fila:

- **Ver mi Perfil Publico** (icono Eye) - navega a `/professional/{id}`
- **Editar Mis Servicios** (icono Package) - `onTabChange('services')`
- **Mis Mensajes** (icono MessageCircle con badge de pendientes) - `onTabChange('messages')`

Cada boton sera un card redondeado con icono grande, label, y efecto hover. Grid `grid-cols-3` con gap uniforme.

**Espaciado:** Cambiar `space-y-4` del contenedor principal a `space-y-6` para dar mas "aire" al widget EN LINEA y Consultas Recientes.

### 2. ProfessionalDashboard.tsx - Eliminar tabs "Trabajos" y "Config"

**TabsList (lineas 593-624):** Eliminar:
- `TabsTrigger value="transactions"` (Trabajos)
- `TabsTrigger value="settings"` (Config)

Reducir grid de `grid-cols-8` a `grid-cols-6`.

**TabsContent:** Eliminar:
- `TabsContent value="transactions"` (lineas 683-685)
- `TabsContent value="settings"` (lineas 769-815)

Mover el contenido esencial de "Config" (SlugConfiguration, ZonaTodayManager) al tab "Mi Perfil" para no perder funcionalidad.

Renombrar tab "Portfolio" a "Galeria" para consistencia.

### 3. Tabs finales resultantes (6 tabs)

| Tab | Nombre |
|-----|--------|
| messages | Mensajes |
| reviews | Resenas |
| services | Servicios |
| portfolio | Galeria |
| subscription | Suscripcion |
| profile | Mi Perfil |

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ActiveUserDashboard.tsx` | Reemplazar ZONA 4 con grid de 3 botones grandes, aumentar espaciado |
| `src/pages/ProfessionalDashboard.tsx` | Eliminar tabs Trabajos y Config, mover contenido Config a Mi Perfil, renombrar Portfolio a Galeria |

