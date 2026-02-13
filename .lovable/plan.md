

# Plan: Arreglar Pestanas Amontonadas en User Dashboard y Admin Dashboard

## Problema

Las pestanas (tabs) se ven amontonadas e ilegibles en mobile porque:
1. El `TabsList` base tiene altura fija `h-10` y fondo gris `bg-muted` que encierra todo
2. En el Admin Dashboard hay 16 tabs comprimidos en ese espacio
3. En el User Dashboard hay 5 tabs que tambien se aprietan

## Solucion

Cambiar el estilo de los tabs a "pill chips" sin fondo contenedor, con scroll horizontal libre y mejor separacion visual.

---

## Cambios

### 1. `src/pages/UserDashboard.tsx` - Tabs como pills sueltas

**Linea 648** - TabsList sin fondo ni altura fija:

```tsx
// Antes:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1">

// Despues:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-0 bg-transparent h-auto">
```

**Lineas 649-668** - Cada TabsTrigger como pill con borde:

```tsx
<TabsTrigger value="home" className="shrink-0 text-xs px-3 py-2 rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary">
```

Esto aplica a los 5 triggers (home, messages, reviews, mobile, settings).

### 2. `src/pages/AdminDashboard.tsx` - Mismo patron para 16 tabs

**Linea 583** - TabsList:

```tsx
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-0 bg-transparent h-auto">
```

**Lineas 584-599** - Cada TabsTrigger:

```tsx
<TabsTrigger value="professionals" className="shrink-0 text-xs px-3 py-2 rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary">
```

Esto aplica a los 16 triggers.

### 3. Sin cambios al componente base `tabs.tsx`

No tocamos el componente base para no afectar otros usos en la app. Los overrides se aplican solo en estos dos dashboards via className.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | TabsList y 5 TabsTriggers con estilo pill |
| `src/pages/AdminDashboard.tsx` | TabsList y 16 TabsTriggers con estilo pill |

## Resultado visual

- Tabs como "chips" redondeados con borde gris claro
- Tab activo en violeta (color primario) con texto blanco
- Scroll horizontal libre sin fondo gris que encierre
- Separacion clara entre cada tab con gap-2
- Funciona perfecto en mobile: se desliza con el dedo

