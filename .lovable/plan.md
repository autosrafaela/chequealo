

# Plan: Mejoras de UI en el Dashboard Profesional

## 4 cambios puntuales

### 1. Banner de Suscripcion positivo (SubscriptionAlert.tsx)

Reemplazar los estados `payment_reminder`, `payment_required` y `expired` por un unico mensaje positivo dorado. Eliminar el banner rojo destructivo y el animate-pulse. Todos los estados ahora muestran la misma caja dorada sutil:

```
"Bienvenido al Programa Pioneros! Tienes acceso premium bonificado por 365 dias"
```

- Fondo: `bg-gradient-to-r from-amber-50 to-yellow-50` con borde `border-amber-200`
- Icono sparkles en lugar de XCircle/AlertCircle
- Sin boton de pago, sin urgencia

### 2. Icono GPS en ubicacion del header (ActiveUserDashboard.tsx)

En la linea donde se muestra `Activo en ${cityName}`, agregar un icono `Navigation` (GPS) de lucide-react al lado del texto de ubicacion para reforzar la localidad.

Cambio en linea 147:
```tsx
<p className="text-sm text-muted-foreground flex items-center gap-1">
  <Navigation className="h-3 w-3" />
  {isActiveInZone ? `Activo en ${cityName}` : 'Estas invisible...'}
</p>
```

### 3. Subtexto en tile "Ver mi Perfil Publico" (ActiveUserDashboard.tsx)

Agregar un subtexto debajo del label del QuickActionTile de "Ver mi Perfil Publico":

```tsx
<QuickActionTile
  icon={Eye}
  label="Ver mi Perfil Publico"
  subtitle="(Haz clic para ver como te encuentran tus clientes)"
  ...
/>
```

Esto requiere agregar soporte para `subtitle` en el componente `QuickActionTile`.

### 4. Limpieza de footer del dashboard (ProfessionalDashboard.tsx)

Actualmente el dashboard no tiene un footer explicito con links sueltos visibles en el codigo. Los links "Solicitudes", "Mensajes", etc. son los TabsTrigger dentro de la TabsList (lineas 593-627). Estos NO se eliminan ya que son la navegacion de tabs necesaria.

El boton "Gestionar mi negocio" (linea 825-831) es el unico elemento inferior. Se mantiene ya que cumple la funcion de mostrar los tabs.

Si hay algun footer heredado del componente Header o layout, no aparece en el dashboard. No hay cambios necesarios aqui.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/SubscriptionAlert.tsx` | Reemplazar banners negativos por mensaje dorado positivo Pioneros |
| `src/components/dashboard/ActiveUserDashboard.tsx` | Agregar icono GPS + subtexto en tile perfil |
| `src/components/dashboard/QuickActionTile.tsx` | Agregar prop `subtitle` opcional |

