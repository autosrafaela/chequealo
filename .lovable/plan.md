

# Plan: Corregir Visibilidad de Iconos en el Header

## Problema

El icono de la campana (notificaciones) tiene clase `text-white`, haciendolo invisible sobre el fondo blanco del header. Los demas iconos (buscar, menu) ya usan `text-foreground` correctamente.

---

## Cambios

### 1. `src/components/NotificationCenter.tsx` (linea 213)

**Antes:**
```tsx
<Button variant="ghost" size="sm" className="relative text-white hover:text-primary hover:bg-white/10">
```

**Despues:**
```tsx
<Button variant="ghost" size="sm" className="relative text-foreground hover:text-primary hover:bg-black/5 transition-colors">
```

- Cambia `text-white` a `text-foreground` (gris oscuro, consistente con los otros iconos del header)
- Cambia `hover:bg-white/10` a `hover:bg-black/5` (efecto hover visible sobre fondo claro)
- Agrega `transition-colors` para transicion suave en hover

### 2. `src/components/notifications/NotificationBadge.tsx`

Sin cambios necesarios. Ya usa `bg-destructive` que mapea a rojo (`0 84.2% 60.2%`) con texto blanco (`text-destructive-foreground`). Funciona correctamente.

### 3. `src/components/Header.tsx` - Mejorar hover en iconos

Los botones de Search y Menu ya usan `text-foreground hover:bg-black/5`. Agregar `transition-colors` para consistencia:

**Boton Search (linea ~103):**
```tsx
className="text-foreground p-2 hover:bg-black/5 transition-colors"
```

**Boton Menu (linea ~114):**
```tsx
className="text-foreground p-2 hover:bg-black/5 transition-colors"
```

### 4. Bottom Navigation (mobile)

Ya usa `text-muted-foreground` y `text-primary` correctamente. Sin cambios necesarios.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/NotificationCenter.tsx` | Cambiar `text-white` a `text-foreground`, fix hover |
| `src/components/Header.tsx` | Agregar `transition-colors` a iconos |

## Resultado

- Campana visible en gris oscuro sobre fondo blanco
- Badge rojo brillante con numero blanco (ya funciona)
- Hover suave con transicion en todos los iconos
- Consistencia visual mobile y desktop

