

# Plan: Mejoras Visuales Premium - Fase 2

## Resumen

Aplicar 5 mejoras visuales adicionales: tarjetas de categoria con efecto rebote, boton WhatsApp con glow neon, titulos con gradiente de texto, avatares con forma organica, CTA inferior con glassmorphism y blobs, y convertir el sidebar CTA en burbuja de chat.

---

## Cambio 1: Tarjetas de Categorias con efecto rebote y bordes de color

**Archivo:** `src/components/ServiceCategories.tsx`

- Aumentar border-radius a `rounded-3xl` (24px)
- Transicion con cubic-bezier de rebote: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- Hover: `translateY(-8px)`, sombra de color violeta (`shadow-[0_20px_40px_rgba(78,84,200,0.15)]`), borde que se enciende (`border-primary`)
- Icono en hover: `scale(1.2) rotate(-5deg)` con drop-shadow
- Agregar overflow-hidden y pseudo-gradiente sutil de fondo por categoria

---

## Cambio 2: Boton WhatsApp con glow neon

**Archivos:** `src/components/WhatsAppContactButton.tsx`, `src/components/EnhancedProfessionalCard.tsx`

- Fondo con gradiente: `bg-gradient-to-r from-green-500 to-green-700`
- box-shadow con glow verde permanente: `shadow-[0_4px_15px_rgba(37,211,102,0.4)]`
- Hover: glow intenso `shadow-[0_0_25px_rgba(37,211,102,0.7)]` + `scale(1.05)`
- Aplicar tanto en el boton standalone como en las tarjetas de profesional

---

## Cambio 3: Titulos con gradiente de texto

**Archivos:** `src/index.css`, `src/components/Hero.tsx`, `src/components/LatestProfessionals.tsx`, `src/components/ServiceCategories.tsx`

- Agregar clase utilitaria `.text-gradient-brand` en index.css:
  ```css
  .text-gradient-brand {
    background: linear-gradient(90deg, hsl(220 26% 14%) 0%, hsl(220 40% 35%) 50%, hsl(258 90% 66%) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  ```
- Aplicar a titulos de seccion: "Servicios Populares", "Profesionales Destacados"
- En el Hero, mantener blanco (esta sobre fondo oscuro) pero aplicar gradiente al span "profesional"
- letter-spacing: -0.03em en titulos principales

---

## Cambio 4: Avatares con forma organica (squircle animado)

**Archivo:** `src/index.css`, `src/components/EnhancedProfessionalCard.tsx`

- Agregar keyframes `morph` en index.css para las fotos de perfil featured
- Solo aplicar la animacion en tarjetas `featured` (las grandes del bento grid) para no saturar
- Anillo externo con color primary separado via box-shadow
- En tarjetas compactas: squircle estatico (border-radius organico fijo, sin animacion)

---

## Cambio 5: CTA inferior con glassmorphism, blobs decorativos

**Archivo:** `src/components/ProfessionalCTABanner.tsx` (componente `EnhancedProfessionalCTA`)

- Gradiente de fondo actualizado: `from-[#667eea] to-[#764ba2]`
- Agregar 3 blobs decorativos (divs absolutos con blur, border-radius 50%, bg-white/10)
- Contenido principal con z-10 relativo
- Botones con efecto glass sutil

---

## Cambio 6: Sidebar CTA convertido en burbuja de chat

**Archivo:** `src/components/ProfessionalCTABanner.tsx` (componente `DesktopSidebarCTA`)

- Reemplazar el panel lateral grande por una burbuja compacta tipo FAB (Floating Action Button)
- Posicion: fixed bottom-6 right-6 (en vez de centrado verticalmente)
- Estado colapsado: circulo con icono de Briefcase + badge "Registrate"
- Click: expande a mini-card con texto + boton (misma info actual pero mas chico)
- Asi no compite con el contenido principal

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/index.css` | Clases: `.text-gradient-brand`, keyframes `morph`, `.avatar-organic` |
| `src/components/ServiceCategories.tsx` | Efecto rebote, bordes de color, icono animado |
| `src/components/WhatsAppContactButton.tsx` | Gradiente + glow neon |
| `src/components/EnhancedProfessionalCard.tsx` | Glow en WhatsApp btn, avatar organico en featured |
| `src/components/Hero.tsx` | Gradiente en span "profesional" |
| `src/components/LatestProfessionals.tsx` | Gradiente en titulo de seccion |
| `src/components/ProfessionalCTABanner.tsx` | CTA con blobs + sidebar como burbuja |

