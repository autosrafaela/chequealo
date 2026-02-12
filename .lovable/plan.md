

# Plan: Rediseno del Perfil Publico del Profesional

## Resumen

Transformar la vista de perfil publico con un diseno moderno y limpio: hero con foto grande y badge verificado superpuesto, dos CTAs principales (WhatsApp verde + Solicitar Presupuesto violeta), servicios en filas con separadores tenues, galeria con lightbox, seccion de resenas con mensaje Pioneros, y estetica general con fondo claro y amplio whitespace.

---

## 1. Hero de Perfil Rediseñado

**Archivo:** `src/components/profile/ProfileHeroSection.tsx`

- Foto circular mas grande: `w-36 h-36` con `border-4 border-white shadow-xl` (borde blanco sutil + sombra suave)
- Badge de verificado: reposicionar como un circulo verde con tilde blanca que sobresalga del borde inferior-derecho de la foto (`absolute -bottom-1 -right-1`), usando `CheckCircle` con fondo `bg-emerald-500` y borde blanco
- Nombre en `text-2xl font-bold` con fuente sans-serif (ya es default de Tailwind)
- Nombre en uppercase (segun convencion de la plataforma)
- Eliminar el badge rectangular de "Verificado" actual y reemplazarlo por el circulo superpuesto en la foto
- Mover el rating debajo del nombre con un diseno mas sutil

## 2. Botones de Accion (CTAs) - Dos botones principales

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Reemplazar el grid de 3 `ProfileQuickAction` (Llamar, Mensaje, Reservar) por 2 botones redondeados principales:
  - "WhatsApp" - `bg-green-600 hover:bg-green-700 text-white rounded-full h-12` con icono `MessageCircle`
  - "Solicitar Presupuesto" - `bg-primary hover:bg-primary/90 text-white rounded-full h-12` (violeta de la marca) con icono `Send`
- Ambos botones en un `flex gap-3` ocupando todo el ancho

- Actualizar tambien el sticky bottom CTA para que coincida: WhatsApp + Solicitar Presupuesto (en vez de WhatsApp + Reservar Turno)

## 3. Seccion de Servicios con separadores tenues

**Archivo:** `src/components/profile/ProfileServiceCard.tsx`

- Eliminar el fondo `bg-muted/50` y el borde `border border-border`
- Usar un diseno de fila limpio: icono minimalista a la izquierda (circulo pastel), nombre del servicio al centro, precio a la derecha
- Agregar `rounded-none` y separar con `border-b border-border/30 last:border-b-0` (separadores muy tenues entre items)
- Reducir padding: `py-3 px-0`

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- En la seccion de servicios, eliminar el Card wrapper y usar un `div` con `bg-white rounded-2xl shadow-sm p-4`
- Sin borde exterior visible

## 4. Portfolio con Lightbox

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Cambiar grid de fotos de `grid-cols-3` a `grid-cols-2 gap-3` para fotos mas grandes
- Cada foto con `rounded-xl overflow-hidden` y un pie de foto: "Trabajo Realizado" o el caption real si existe
- Agregar estado `selectedPhoto` para lightbox
- Al hacer clic en una foto, abrir un Dialog (lightbox) con la imagen en grande, fondo oscuro, y boton de cerrar
- El lightbox usa `Dialog` de shadcn con imagen `max-h-[80vh] object-contain`

## 5. Seccion de Resenas con mensaje Pioneros

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Cuando no hay resenas (`reviews.length === 0`), mostrar un bloque especial:
  - Fondo: `bg-amber-50/50 rounded-2xl p-6`
  - 5 estrellas doradas decorativas (`Star` con `fill-current text-amber-400`) centradas
  - Texto: "¡[Nombre] es nuevo en el Programa Pioneros! Deja tu resena y gana descuentos"
  - Tipografia: `text-base font-medium text-foreground` para el mensaje
- Mantener el diseno actual cuando SI hay resenas

## 6. Estetica General

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Fondo principal: cambiar `bg-background` a `bg-gray-50/50` (gris muy claro)
- Aumentar spacing entre secciones: `space-y-3` a `space-y-6` en el main
- Eliminar bordes visibles de las Cards: usar `border-0 shadow-sm` en todas las secciones
- Seccion "Sobre mi": sin Card wrapper, solo un `div` con padding y titulo en bold
- Tipografias oscuras: asegurar `text-foreground` en titulos

**Archivos de componentes profile:**
- `ProfileLocationCard.tsx`: cambiar Card a `border-0 shadow-sm rounded-2xl`
- `ProfileReviewCard.tsx`: mantener diseno actual pero con `border-0 bg-gray-50`

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/profile/ProfileHeroSection.tsx` | Foto grande con borde blanco, badge verificado circular superpuesto, nombre bold uppercase |
| `src/components/profile/ProfileServiceCard.tsx` | Filas limpias con separadores tenues, sin fondo ni borde |
| `src/components/profile/ProfileLocationCard.tsx` | Sin borde, shadow suave |
| `src/components/profile/ProfileReviewCard.tsx` | Fondo sutil gris, sin borde |
| `src/pages/ProfessionalProfile.tsx` | CTAs WhatsApp+Presupuesto, galeria 2col con lightbox, resenas Pioneros empty state, estetica limpia |

## Detalles tecnicos

### Lightbox para galeria
- Estado: `const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)`
- Componente: usar `Dialog` de shadcn existente
- Al hacer clic en foto: `setSelectedPhoto(photo.image_url)`
- El Dialog muestra la imagen centrada con `object-contain max-h-[80vh]`

### Badge verificado superpuesto
```text
Posicion: absolute bottom-0 right-0 del contenedor del Avatar
Icono: CheckCircle de lucide-react
Estilo: bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-md
Tamano: w-8 h-8 (el contenedor), icono w-5 h-5
```

### CTAs sticky bottom actualizados
- WhatsApp: mantiene `bg-green-600`
- Segundo boton cambia de "Reservar Turno" a "Solicitar Presupuesto" con `bg-primary`
- El boton de presupuesto abre el `ContactRequestDialog` existente

