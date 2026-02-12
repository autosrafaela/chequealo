
# Plan: Mejora del Dashboard Profesional

## Resumen

Cinco mejoras clave: (1) permitir activar perfil profesional desde el dashboard de usuario sin re-registro, (2) reemplazar alerta de suscripcion expirada por banner dorado "Programa Pioneros", (3) redisenar el switch de visibilidad con borde verde, (4) mejorar agrupacion y estilo de acciones rapidas, (5) empty states con grafico ilustrativo.

---

## 1. Activar Perfil Profesional desde UserDashboard

**Archivo:** `src/pages/UserDashboard.tsx`

- Agregar un boton/card en el dashboard del usuario: "Activar Perfil Profesional"
- Solo visible si el usuario NO tiene registro en la tabla `professionals`
- Al hacer clic, abrir un Dialog/Modal que pida solo los datos faltantes:
  - Profesion (selector de tags como en Register)
  - Descripcion breve
  - DNI/CUIT
  - Telefono (si no lo tiene en su perfil)
- Al confirmar, insertar en la tabla `professionals` usando los datos existentes del perfil (`full_name`, `email`, `location` desde `profiles`)
- Redirigir a `/dashboard` tras la creacion exitosa
- No requiere volver a loguearse

**Archivo:** `src/pages/ProfessionalDashboard.tsx`
- Actualizar el bloque "No tienes perfil profesional" (lineas 475-498) para redirigir a `/user-dashboard` con un query param `?activate=professional` en lugar de `/register`

## 2. Banner "Programa Pioneros Activo" (reemplaza SubscriptionAlert)

**Archivo:** `src/components/SubscriptionAlert.tsx`

- Cuando el status sea `trial`, en vez de ocultarlo (`return null`), mostrar un banner dorado elegante:
  - Fondo: `bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300`
  - Icono de estrella/corona dorada
  - Texto: "Programa Pioneros Activo: Tenes X dias de acceso gratuito"
  - Badge dorado con "PIONERO" 
  - Sin boton de accion agresivo, solo informativo
- Mantener los estados `payment_reminder`, `payment_required`, `expired` como estan

## 3. Rediseno del Switch de Visibilidad

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`

- Redisenar la card de "Estas trabajando hoy?" en la DashboardHero:
  - Switch mas grande: `scale-150` con contenedor visual prominente
  - Cuando `isActiveInZone === true`: toda la card tiene `border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]` (borde verde brillante con glow)
  - Cuando `isActiveInZone === false`: borde normal gris
  - Agregar un indicador circular animado (pulso verde) cuando esta activo
  - Texto mas grande y claro: "EN LINEA" vs "FUERA DE LINEA"

## 4. Acciones Rapidas Mejoradas

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`
**Archivo:** `src/components/dashboard/QuickActionTile.tsx`

En `QuickActionTile.tsx`:
- Agregar prop `iconColor` para colores individuales por tile
- Aplicar color al icono y al fondo del contenedor del icono
- Reducir padding para que esten mas compactos: `p-4` en vez de `p-5`
- Bordes mas sutiles: `border` en vez de `border-2`

En `ActiveUserDashboard.tsx`:
- Pasar colores especificos a cada tile:
  - Ver Perfil: azul (`text-blue-500`)
  - Servicios: verde (`text-green-500`)
  - Portfolio: violeta (`text-purple-500`)
  - Mensajes: naranja (`text-orange-500`)
  - Configuracion: gris (`text-gray-500`)
  - Mi Profesion: amber (`text-amber-500`)
- Grid mas compacto: `gap-3` en vez de `gap-4`

## 5. Empty States con Grafico Ilustrativo

**Archivo:** `src/components/dashboard/MetricCard.tsx`

- Agregar logica: cuando `value === 0` o `value === "0.0"`, mostrar un "empty state" especial:
  - En lugar del numero "0" grande, mostrar un mini grafico de barras SVG con opacidad baja (3-4 barras grises escalonadas, estilo placeholder)
  - Debajo del grafico: texto "Proximamente veras aqui tus estadisticas" en `text-xs text-muted-foreground italic`
  - Mantener el label y el icono normales

**Archivo:** `src/components/dashboard/NewUserDashboard.tsx`
- Aplicar el mismo patron a las MetricCards que ya muestran 0

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | Boton + Modal "Activar Perfil Profesional" |
| `src/pages/ProfessionalDashboard.tsx` | Redirigir a UserDashboard en vez de Register |
| `src/components/SubscriptionAlert.tsx` | Banner dorado "Programa Pioneros" para trial |
| `src/components/dashboard/ActiveUserDashboard.tsx` | Switch grande con borde verde, tiles coloridos |
| `src/components/dashboard/QuickActionTile.tsx` | Prop iconColor, padding compacto |
| `src/components/dashboard/MetricCard.tsx` | Empty state con grafico SVG placeholder |

---

## Detalles tecnicos

### Modal de activacion profesional
- Consulta inicial: `supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()` para verificar si ya existe
- Insert: reutiliza `full_name` y `email` del perfil existente
- No necesita migracion de BD, la tabla `professionals` ya tiene todos los campos necesarios

### SVG placeholder para empty states
```text
Un mini grafico de barras con 4 rectangulos de alturas 40%, 65%, 50%, 80%, color gris con opacity 0.15, sobre fondo transparente. Aproximadamente 60x40px.
```

### Switch de visibilidad
- Usar `transition-all duration-500` para que el cambio de borde sea suave
- El glow verde usa `shadow-[0_0_15px_rgba(74,222,128,0.3)]`
