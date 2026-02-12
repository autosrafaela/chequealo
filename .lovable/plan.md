
# Plan: Finalizacion del Rediseno del Dashboard Profesional

## Resumen

Transformar el dashboard profesional con un widget de visibilidad mas impactante, acciones rapidas con iconos circulares en colores pastel, un feed de "Consultas Recientes", y una estetica general mas limpia con sombras suaves y sin bordes innecesarios.

---

## 1. Saludo con emoji y tipografia amigable

**Archivo:** `src/pages/ProfessionalDashboard.tsx` (linea ~516)

- Cambiar `Hola, {nombre} 👋` a usar tipografia mas amigable: `text-2xl md:text-3xl font-extrabold tracking-tight`
- Mantener el emoji de saludo (ya existe el 👋)

## 2. Widget de Visibilidad rediseñado

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`

- Reemplazar el `DashboardHero` de visibilidad por un bloque custom sin usar Card con bordes:
  - Fondo: `bg-white rounded-2xl shadow-sm p-6` (shadow suave, sin borde visible)
  - Switch mas grande y prominente con label claro
  - **ON**: badge verde pulsante "Activo en [ciudad]" (usa `professional.city` o fallback "tu zona"), borde verde sutil `border border-green-200`, glow `shadow-[0_0_20px_rgba(74,222,128,0.15)]`
  - **OFF**: aplica `grayscale-[30%] opacity-90` al wrapper del dashboard completo (div padre), con un mensaje centrado: "Estas invisible para los clientes" en `text-muted-foreground italic`
- El switch ocupa un area visual grande: contenedor flex con icono de MapPin a la izquierda, texto al centro, switch a la derecha

## 3. Grid de Acciones Rapidas 3x2 con iconos circulares pastel

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`
**Archivo:** `src/components/dashboard/QuickActionTile.tsx`

En `QuickActionTile.tsx`:
- Cambiar el fondo del icono de `rounded-xl` a `rounded-full` (circular)
- Usar colores pastel suaves para el fondo: `bg-blue-50`, `bg-green-50`, `bg-purple-50`, etc.
- Eliminar borde del Card: `border-0 shadow-sm hover:shadow-md`
- Iconos ligeramente mas grandes: `h-6 w-6`

En `ActiveUserDashboard.tsx`:
- Cambiar grid de `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` a `grid-cols-3 gap-4` (3x2 fijo)
- Renombrar las 6 acciones:
  1. "Mi Perfil Publico" (Eye, azul)
  2. "Mis Servicios" (Package, verde)
  3. "Galeria de Trabajos" (Camera, purpura)
  4. "Mensajes" (MessageCircle, naranja)
  5. "Configuracion" (Settings, gris)
  6. "Mi Plan Pioneros" (Crown/Award, amber) - reemplaza "Mi Profesion"
- Eliminar el acordeon de "Mas opciones" (Collapsible) y el ProfessionModal ya que "Mi Plan Pioneros" lleva al tab de suscripcion

## 4. Feed de Consultas Recientes

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`

- Agregar debajo del widget de visibilidad una seccion "Consultas Recientes"
- Query a `contact_requests` filtrando por `professional_id`, ordenado por `created_at DESC`, limit 3
- Si hay consultas: mostrar cada una como un item con avatar placeholder, nombre del cliente, mensaje truncado y fecha relativa
- Si NO hay consultas (empty state):
  - Icono grande de `MessageCircle` con opacity baja
  - Texto: "Aun no tenes mensajes. Asegurate de tener tu perfil completo para atraer clientes!"
  - Boton sutil: "Completar mi perfil" que lleva a `onTabChange('settings')`
- Contenedor: `bg-white rounded-2xl shadow-sm p-6` (sin bordes)

## 5. Estetica General - Sombras suaves y sin bordes

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`

- Wrapper principal: si `isActiveInZone === false`, aplicar `className="grayscale-[30%] opacity-90 transition-all duration-500"` al div padre, con un banner sutil arriba
- Reemplazar la Card de DashboardHero de "contactos pendientes" (variant danger) por un div con `bg-white rounded-2xl shadow-sm`
- Eliminar `border-2` de las cards de metricas; usar solo `shadow-sm` y `rounded-2xl`

**Archivo:** `src/components/dashboard/MetricCard.tsx`
- Cambiar Card a: `border-0 shadow-sm rounded-2xl hover:shadow-md`

**Archivo:** `src/components/dashboard/DashboardHero.tsx`
- Cambiar Card a: `border-0 shadow-sm rounded-2xl` (eliminar `border-2`)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ActiveUserDashboard.tsx` | Widget visibilidad, grid 3x2, feed consultas, estetica sin bordes, efecto grayscale OFF |
| `src/components/dashboard/QuickActionTile.tsx` | Iconos circulares pastel, sin borde, shadow suave |
| `src/components/dashboard/MetricCard.tsx` | Sin borde, shadow suave, rounded-2xl |
| `src/components/dashboard/DashboardHero.tsx` | Sin borde, shadow suave, rounded-2xl |
| `src/pages/ProfessionalDashboard.tsx` | Tipografia del saludo mas amigable |

## Detalles tecnicos

### Query de Consultas Recientes
```
supabase.from('contact_requests')
  .select('id, client_name, message, created_at, status')
  .eq('professional_id', professional.id)
  .order('created_at', { ascending: false })
  .limit(3)
```

### Efecto grayscale cuando OFF
- Envolver todo el contenido del dashboard en un div con clase condicional:
  `className={cn('space-y-6 transition-all duration-500', !isActiveInZone && 'grayscale-[30%] opacity-90')}`
- El widget de visibilidad queda FUERA del wrapper grayscale para que siempre se vea a color

### Colores pastel para iconos circulares
- Mi Perfil Publico: `bg-blue-50 text-blue-500`
- Mis Servicios: `bg-green-50 text-green-500`
- Galeria de Trabajos: `bg-purple-50 text-purple-500`
- Mensajes: `bg-orange-50 text-orange-500`
- Configuracion: `bg-gray-100 text-gray-500`
- Mi Plan Pioneros: `bg-amber-50 text-amber-500`
