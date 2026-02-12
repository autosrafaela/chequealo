

# Plan: Rediseño Visual Premium del Homepage

## Resumen

Transformar la experiencia visual del homepage aplicando las 5 mejoras solicitadas: Hero con glassmorphism, Bento Grid para profesionales, tipografía display, micro-interacciones, y badge "Pioneros".

---

## Cambio 1: Hero con Glassmorphism - Buscador protagonista

**Archivo:** `src/components/Hero.tsx`, `src/components/IntelligentSearch.tsx`

- Reducir texto de bienvenida (menos "bla bla")
- Buscador GIGANTE con efecto glassmorphism: `backdrop-filter: blur(12px)`, borde semitransparente, sombra profunda
- Input mas alto (h-14 mobile, h-16 desktop), border-radius 20px, padding generoso
- Quitar los USPs inline (redundantes con la seccion de abajo) para dar mas espacio al buscador
- Titulo mas corto y directo: solo "Encontra al profesional que necesitas" con tipografia impactante

**Clases clave del buscador:**
```
bg-white/10 backdrop-blur-[12px] border border-white/20 
shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[20px] p-4 sm:p-6
```

---

## Cambio 2: Bento Grid para Profesionales Destacados

**Archivo:** `src/components/LatestProfessionals.tsx`, `src/components/EnhancedProfessionalCard.tsx`

- Reemplazar la grilla uniforme por una Bento Grid asimetrica
- Los primeros 2 profesionales (verificados, mejor rating) ocupan `col-span-2 row-span-2` (tarjeta grande, mas detalle)
- Los siguientes ocupan 1x1 (tarjeta compacta)
- CSS Grid con `grid-auto-rows` y clases de span condicionales
- Las tarjetas grandes muestran descripcion completa, foto mas grande, y boton de contacto visible

**Estructura de la grilla:**
```
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
grid-auto-rows: minmax(200px, auto)
```

---

## Cambio 3: Tipografia Display con clamp()

**Archivo:** `src/index.css`, `src/components/Hero.tsx`, `src/components/LatestProfessionals.tsx`

- Importar fuente "Inter" con peso 800-900 para titulos (ya disponible en Google Fonts, muy similar a Clash Display pero sin licencia)
- Usar `clamp()` para scaling fluido: `font-size: clamp(2rem, 5vw + 1rem, 4rem)`
- Letter-spacing negativo (-0.02em) para look premium
- Line-height compacto (0.95) en titulos principales
- Aplicar a: Hero h1, titulos de seccion, nombre de profesionales en card grande

---

## Cambio 4: Micro-interacciones en tarjetas

**Archivo:** `src/components/EnhancedProfessionalCard.tsx`, `src/components/ProfessionalCard.tsx`, `src/components/ServiceCategories.tsx`

- Hover: `translateY(-5px) scale(1.02)` con `cubic-bezier(0.25, 0.8, 0.25, 1)`
- Sombra que crece en hover: `shadow-[0_20px_40px_rgba(0,0,0,0.15)]`
- Borde de color accent que aparece en hover: `border-primary/40`
- Glow sutil en tarjetas de profesionales verificados
- Categorias de servicio: escala e iluminacion al hover
- Transicion suave de 300ms en todas las propiedades

---

## Cambio 5: Badge "Programa Pioneros"

**Archivo:** `src/components/Header.tsx` (o nuevo componente `src/components/PioneersBadge.tsx`)

- Badge flotante en el header, estilo VIP con gradiente dorado
- Texto: "PIONEROS" con gradient text (`background-clip: text`)
- Borde dorado, border-radius pill, letra spacing amplio
- Visible en desktop como badge en el header
- En mobile: integrado discretamente junto al logo
- Gradiente: `linear-gradient(45deg, #FFD700, #FF8C00)`

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/index.css` | Agregar font import, clases glassmorphism, animaciones hover |
| `src/components/Hero.tsx` | Redisenar con glassmorphism, menos texto, buscador protagonista |
| `src/components/IntelligentSearch.tsx` | Estilos glassmorphism, input mas grande |
| `src/components/LatestProfessionals.tsx` | Bento Grid layout |
| `src/components/EnhancedProfessionalCard.tsx` | Variante "featured" grande + micro-interacciones |
| `src/components/ProfessionalCard.tsx` | Micro-interacciones hover |
| `src/components/ServiceCategories.tsx` | Micro-interacciones en categorias |
| `src/components/Header.tsx` | Badge Pioneros |

## Resultado esperado

- Homepage que se siente "cara" y moderna, no generica
- Buscador como elemento central que invita a la accion
- Tarjetas de profesionales con jerarquia visual (destacados vs normales)
- Interacciones que dan vida a cada elemento
- Identidad de marca reforzada con el badge Pioneros

