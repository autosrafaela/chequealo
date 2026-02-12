
# Plan: Rediseno Profesionales Destacados, CTA y Footer

## Resumen

Tres bloques de mejora: (1) tarjetas de profesionales con avatares modernos, sombras, badge verificado prominente y nombres en negrita; (2) seccion CTA con fondo azul oscuro, patron de puntos y boton dorado protagonista; (3) footer con mas aire, iconos sociales y mejor organizacion.

---

## Cambio 1: Tarjetas de Profesionales Mejoradas

**Archivo:** `src/components/EnhancedProfessionalCard.tsx`

### Avatar sin foto - Silueta elegante
- Reemplazar el fallback de iniciales por un icono `User` de Lucide en tonos grises
- AvatarFallback: fondo `bg-gray-100 dark:bg-gray-800` con icono `User` en `text-gray-400` (tamanio responsive segun featured/compact)
- Eliminar las iniciales de texto

### Sombra en tarjetas
- Agregar `shadow-sm` base al Card (no solo en hover)
- Hover mantiene el efecto premium existente pero con `shadow-lg` mas visible

### Badge Verificado prominente
- Cambiar de `border-green-500 text-green-600 bg-green-50` a fondo solido esmeralda: `bg-emerald-500 text-white`
- Agregar icono `CheckCircle` blanco en lugar del texto "checkmark"
- Hacerlo siempre visible (quitar el hidden/inline toggle en mobile, mostrar "Verificado" siempre)

### Nombres con peso marcado
- Cambiar `font-semibold` a `font-bold` en el h3 del nombre
- En tarjetas featured: usar `font-extrabold`

---

## Cambio 2: Seccion CTA Rediseñada

**Archivo:** `src/components/ProfessionalCTABanner.tsx`

### Fondo azul oscuro con patron de puntos
- Cambiar gradiente de `from-[#667eea] to-[#764ba2]` a `from-[#0f172a] to-[#1e293b]` (azul oscuro profundo, tipo Stripe)
- Agregar patron de puntos via CSS radial-gradient como background-image superpuesto (puntos blancos al 5% de opacidad, separados 20px)

### Boton protagonista dorado
- Cambiar el boton "Registrate gratis" de `bg-white/90 text-[#667eea]` a `bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold`
- Agregar glow dorado: `shadow-[0_0_20px_rgba(251,191,36,0.4)]`
- Hover: `shadow-[0_0_30px_rgba(251,191,36,0.6)]` + scale 1.05

### Icono estilizado
- Reemplazar `Briefcase` por `Rocket` de Lucide (mas aspiracional y moderno)
- Contenedor del icono con borde sutil glass

### Blobs actualizados
- Cambiar colores de blobs a tonos azul electrico (`bg-blue-500/10`, `bg-indigo-500/5`) para que combinen con el fondo oscuro

---

## Cambio 3: Footer Premium

**Archivo:** `src/pages/Index.tsx`

### Mas padding
- Cambiar `py-8 sm:py-10 md:py-12` a `py-12 sm:py-16 md:py-20`
- Fondo: mantener `bg-card` pero agregar sutil separacion con `border-t-2`

### Titulos en negrita y jerarquia
- Titulos de columna: `font-bold text-base sm:text-lg` (subir de semibold a bold)
- Links: `text-xs sm:text-sm` con hover underline

### Iconos sociales
- Agregar fila de iconos sociales (Instagram, Facebook, Linkedin) debajo de la descripcion de Chequealo
- Usar iconos custom SVG inline (Lucide no tiene iconos de redes sociales, asi que se renderizan como SVG pequenos)
- Estilo: circulos `w-8 h-8` con fondo `bg-muted hover:bg-primary hover:text-white` y transicion

### Copyright actualizado
- Cambiar "2024" a "2025"

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/EnhancedProfessionalCard.tsx` | Avatar silueta, sombra base, badge esmeralda, nombre bold |
| `src/components/ProfessionalCTABanner.tsx` | Fondo azul oscuro + puntos, boton dorado, icono Rocket |
| `src/pages/Index.tsx` | Footer con mas padding, iconos sociales, titulos bold |
