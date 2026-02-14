
# Plan: Permitir recorrer la imagen con zoom (pan/drag)

## Problema

Actualmente al hacer zoom en una foto del lightbox, el contenedor tiene `overflow-auto` pero al intentar arrastrar para recorrer la imagen, el click cierra el zoom. No hay forma de navegar por la imagen ampliada.

## Solucion

Implementar drag-to-pan (arrastrar para recorrer) cuando la imagen esta en zoom, tanto para mouse como para touch. El click solo alterna el zoom si el usuario NO arrastro.

## Cambios en `src/pages/ProfessionalProfile.tsx`

### 1. Agregar estados para el drag

```tsx
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
const [hasDragged, setHasDragged] = useState(false);
const zoomContainerRef = useRef<HTMLDivElement>(null);
```

### 2. Separar click de drag

- `onMouseDown` / `onTouchStart`: guardar posicion inicial y marcar inicio de drag
- `onMouseMove` / `onTouchMove`: si esta en zoom y arrastrando, hacer scroll del contenedor (pan)
- `onMouseUp` / `onTouchEnd`: si el usuario NO arrastro (movimiento menor a 5px), alternar zoom; si arrastro, no hacer nada
- Esto permite: click corto = zoom in/out, arrastrar = recorrer la imagen

### 3. Centrar la imagen al hacer zoom

Cuando el usuario hace zoom in, centrar el scroll del contenedor en el punto donde hizo click, para que el zoom se sienta natural.

### 4. Actualizar el contenedor de la imagen (lineas 680-694)

- Agregar `ref={zoomContainerRef}` al div contenedor
- Reemplazar el `onClick` simple por los handlers de drag
- Agregar `touch-action: none` cuando esta en zoom para evitar scroll del navegador
- Cambiar el cursor a `cursor-grab` cuando esta en zoom (y `cursor-grabbing` al arrastrar)

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Agregar logica de drag-to-pan en el lightbox con zoom |

## Resultado

- Click corto: alterna zoom in/out (igual que antes)
- Arrastrar con mouse o dedo: recorre la imagen ampliada en todas las direcciones
- Cursor visual: zoom-in cuando no hay zoom, grab/grabbing cuando hay zoom
- La imagen se centra en el punto de click al hacer zoom
