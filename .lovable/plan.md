
# Plan: Rediseno de Cuadricula de Categorias - Uniforme y Moderna

## Resumen

Reemplazar el layout asimetrico actual (bento grid con tarjetas de distintos tamanos) por una cuadricula uniforme, limpia y coherente. Todas las tarjetas tendran el mismo tamano, iconos outline sin fondo circular, solo el nombre en negrita, y un efecto hover sutil.

---

## Cambios en `src/components/ServiceCategories.tsx`

### 1. Grid uniforme
- Eliminar toda la logica de `isHero` / `isWide` / `isLarge` (tarjetas con col-span-2, row-span-2, gradiente navy)
- Todas las tarjetas ocupan exactamente 1 columna, mismo tamano
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` con `gap-4`

### 2. Iconos outline sin fondo circular
- Eliminar los contenedores con `category.color` (ej. `bg-teal-100 text-teal-600`)
- Renderizar el icono directamente sobre el fondo blanco de la tarjeta
- Color del icono: `text-gray-600 group-hover:text-primary` (gris oscuro por defecto, violeta de la marca al hover)
- Tamano uniforme: `h-7 w-7`

### 3. Tipografia limpia
- Nombre de categoria en `font-bold text-sm text-foreground`
- Eliminar todos los subtitulos ("Encontra los mejores profesionales") de las tarjetas
- Mantener solo el nombre centrado debajo del icono

### 4. Estructura de cada tarjeta
- Layout vertical centrado: icono arriba, nombre abajo
- Padding uniforme: `p-5`
- Fondo: `bg-card`
- Borde: `border border-border/50`
- Border-radius: `rounded-2xl`

### 5. Efecto hover
- `hover:-translate-y-1` (subida sutil de 4px)
- `hover:border-primary` (borde cambia al color principal)
- `hover:shadow-md` (sombra media)
- Transicion suave: `transition-all duration-300`

### 6. Propiedades `color` del array `categories`
- Ya no se usan para los fondos circulares, se pueden eliminar del objeto o simplemente ignorar

---

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ServiceCategories.tsx` | Grid uniforme, iconos sin fondo, solo nombre bold, hover sutil |

## Resultado esperado

Cuadricula limpia con 12 tarjetas identicas: icono gris outline + nombre en negrita. 5 por fila en desktop, 2 en mobile. Hover eleva la tarjeta y resalta el borde en el color de la marca.
