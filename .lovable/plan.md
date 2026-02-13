

# Plan: Fix de Pestanas Recortadas - Scroll Horizontal Perfecto

## Problema

Las pestanas se cortan en mobile porque:
1. El componente base `TabsList` usa `inline-flex` y `justify-center` que no se sobreescriben correctamente con `cn()`
2. Falta `flex-nowrap` explicito para evitar que se apilen
3. No hay padding al final para que la ultima pestana no quede pegada al borde
4. No hay efecto snap para centrar al deslizar

## Solucion

Dos cambios: uno en el componente base y otro en los dashboards.

---

## Cambios

### 1. Componente base `src/components/ui/tabs.tsx`

Cambiar la clase base del `TabsList` de `inline-flex` a `flex` para que las clases de los dashboards puedan sobreescribir correctamente:

```tsx
// Linea 15, antes:
"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"

// Despues:
"flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
```

Esto no afecta otros usos porque `flex` se comporta igual que `inline-flex` dentro de contenedores de bloque.

### 2. `src/pages/UserDashboard.tsx` - TabsList (linea 648)

```tsx
// Antes:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50">

// Despues:
<TabsList className="flex flex-nowrap w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 p-2 pr-6 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50 justify-start">
```

Cada TabsTrigger agregar `snap-center min-w-fit`:

```tsx
// Ejemplo, antes:
className="shrink-0 text-xs px-3 py-2 rounded-full ..."

// Despues:
className="shrink-0 snap-center min-w-fit text-xs px-3 py-2 rounded-full ..."
```

Aplicar a los 5 triggers.

### 3. `src/pages/ProfessionalDashboard.tsx` - TabsList (linea 834)

Mismo patron:

```tsx
// Antes:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50 sticky top-4 z-10">

// Despues:
<TabsList className="flex flex-nowrap w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 p-2 pr-6 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50 sticky top-4 z-10 justify-start">
```

Cada TabsTrigger (6 triggers) agregar `snap-center min-w-fit`.

### 4. `src/pages/AdminDashboard.tsx` - TabsList

Mismo patron aplicado a la barra de 16 tabs.

---

## Resumen de clases nuevas

| Clase | Funcion |
|-------|---------|
| `flex-nowrap` | Prohibe que las pestanas bajen a otra linea |
| `snap-x snap-mandatory` | Efecto snap al deslizar |
| `snap-center` | Cada tab se centra al hacer snap |
| `min-w-fit` | El texto nunca se corta |
| `pr-6` | Padding derecho para que la ultima pestana no quede pegada |
| `justify-start` | Sobreescribe el `justify-center` base |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ui/tabs.tsx` | `inline-flex` a `flex` en TabsList base |
| `src/pages/UserDashboard.tsx` | TabsList + 5 triggers con nowrap/snap/min-w-fit |
| `src/pages/ProfessionalDashboard.tsx` | TabsList + 6 triggers con nowrap/snap/min-w-fit |
| `src/pages/AdminDashboard.tsx` | TabsList + 16 triggers con nowrap/snap/min-w-fit |

