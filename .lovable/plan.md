
# Plan: Optimizacion del Dashboard de Administrador

## Resumen

El panel de admin tiene 16 tabs en un grid fijo que se amontona en mobile, cards de stats sin jerarquia visual, y profesionales con poco espacio interno. Vamos a implementar scroll horizontal para tabs, mejorar el diseno de las cards y darle mas aire a las tarjetas de gestion.

---

## Cambios a Realizar

### 1. Navegacion con Scroll Horizontal (tabs)

**Archivo**: `src/pages/AdminDashboard.tsx` (linea 583)

Reemplazar el grid fijo de 16 columnas por un contenedor con scroll horizontal:

```tsx
// Antes:
<TabsList className="grid w-full grid-cols-[repeat(16,minmax(0,1fr))]">

// Despues:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1">
```

Cada `TabsTrigger` recibe `className="shrink-0 text-xs px-3"` para que no se comprima y permita scroll lateral.

Agregar en `src/index.css` la clase utilitaria:
```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

### 2. Modernizacion de Stats Cards (indicadores superiores)

**Archivo**: `src/pages/AdminDashboard.tsx` (lineas 432-579)

Cambios en las 9 cards de estadisticas:
- Reducir de `grid-cols-4` a `grid-cols-2 lg:grid-cols-4` para mejor layout mobile
- Agregar gradientes sutiles a las cards de "Periodo de Prueba" y "Suscripciones Expiradas" para darles jerarquia:
  - Trial: borde izquierdo azul (`border-l-4 border-l-blue-500`)
  - Expired: borde izquierdo rojo (`border-l-4 border-l-red-500`)
  - Active: borde izquierdo verde (`border-l-4 border-l-green-500`)
- Tipografia mas ligera en los labels: `text-xs` en lugar de `text-sm`

### 3. Cards de Profesionales con mas Aire

**Archivo**: `src/pages/AdminDashboard.tsx` (linea 632)

Cambiar el contenedor de cada profesional:

```tsx
// Antes:
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-lg">

// Despues:
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border rounded-xl bg-white shadow-sm">
```

- Padding de `p-4` a `p-5`
- Bordes redondeados de `rounded-lg` a `rounded-xl`
- Fondo blanco explicito y sombra sutil

### 4. Barra de Busqueda mas Accesible en Mobile

**Archivo**: `src/pages/AdminDashboard.tsx` (lineas 607-615)

```tsx
// Antes:
<Input placeholder="Buscar..." className="pl-10" />

// Despues:
<Input placeholder="Buscar por nombre, profesion, ubicacion o email..." className="pl-10 h-12 text-base" />
```

Aumentar la altura a `h-12` y el texto a `text-base` para facilitar el tap en mobile.

### 5. Switches con Color de Marca

**Archivo**: `src/pages/AdminDashboard.tsx` (linea 659)

Los switches ya usan `bg-primary` por defecto (que es el violeta de la marca). No se necesita cambio, pero verificar que `--primary` este mapeado al violeta `#7c3aed` en el theme.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/AdminDashboard.tsx` | Scroll horizontal en tabs, cards modernizadas, padding en profesionales, buscador mas alto |
| `src/index.css` | Clase utilitaria `scrollbar-hide` |

## Resultado Esperado

- Tabs deslizables horizontalmente en mobile (sin amontonamiento)
- Cards de stats con bordes de color que crean jerarquia visual
- Tarjetas de profesionales con mas espacio interno y sombra sutil
- Barra de busqueda mas grande y facil de usar en celulares
- Coherencia visual con el violeta de la marca en todos los controles interactivos
