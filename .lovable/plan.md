
# Plan: Lightbox Estilo E-commerce con Descripcion Visible

## Problema

1. Al hacer click en una foto de "Trabajos Realizados", el lightbox solo muestra la imagen, sin la descripcion (`caption`) ni el tipo de trabajo (`work_type`).
2. La imagen se muestra con `object-contain` sin posibilidad de zoom, causando pixelado en imagenes pequenas.
3. En la grilla, el caption esta truncado con `truncate` (una sola linea).

## Solucion

Redisenar el lightbox para que funcione como un visor de producto de e-commerce: imagen grande con zoom, navegacion entre fotos (anterior/siguiente), y descripcion visible debajo.

## Cambios en `src/pages/ProfessionalProfile.tsx`

### 1. Cambiar el estado `selectedPhoto`

Actualmente guarda solo un string (la URL). Cambiarlo para guardar el indice de la foto seleccionada, lo que permite:
- Mostrar caption y work_type de esa foto
- Navegar entre fotos con flechas

```
// Antes:
const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

// Despues:
const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
```

### 2. Redisenar el Lightbox Dialog (lineas 620-631)

Reemplazar el Dialog actual por uno estilo e-commerce:

- Fondo oscuro (`bg-black/95`)
- Imagen centrada con tamano maximo optimizado
- **Zoom con click**: al hacer click en la imagen, se alterna entre `object-contain` (vista completa) y `object-cover` con `cursor-zoom-in/zoom-out`
- **Navegacion**: flechas izquierda/derecha (ChevronLeft, ChevronRight) para pasar entre fotos
- **Descripcion visible**: debajo de la imagen, mostrar `caption` y `work_type` sobre fondo semi-transparente
- **Contador**: "3 de 12" para indicar posicion

```text
+------------------------------------------+
|  [X]                              3 de 12 |
|                                           |
|  [<]     IMAGEN GRANDE CON ZOOM     [>]  |
|                                           |
|  Caption: "Instalacion de aire split"     |
|  Tipo: "Refrigeracion"                    |
+------------------------------------------+
```

### 3. Mejorar la grilla de previews (lineas 576-606 y 706-731)

- Quitar `truncate` del caption y usar `line-clamp-2` para mostrar hasta 2 lineas
- Mostrar `work_type` como badge pequeno si existe

### 4. Detalle tecnico

**Nuevo estado y helpers:**
```tsx
const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
const [isZoomed, setIsZoomed] = useState(false);

const selectedPhotoData = selectedPhotoIndex !== null ? workPhotos[selectedPhotoIndex] : null;

const goToNext = () => {
  if (selectedPhotoIndex !== null && selectedPhotoIndex < workPhotos.length - 1) {
    setSelectedPhotoIndex(selectedPhotoIndex + 1);
    setIsZoomed(false);
  }
};

const goToPrev = () => {
  if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
    setSelectedPhotoIndex(selectedPhotoIndex - 1);
    setIsZoomed(false);
  }
};
```

**Lightbox rediseñado:**
```tsx
<Dialog open={selectedPhotoIndex !== null} onOpenChange={() => { setSelectedPhotoIndex(null); setIsZoomed(false); }}>
  <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0 overflow-hidden">
    {selectedPhotoData && (
      <div className="relative flex flex-col h-full">
        {/* Contador */}
        <div className="absolute top-3 right-12 text-white/70 text-sm z-10">
          {selectedPhotoIndex + 1} de {workPhotos.length}
        </div>

        {/* Imagen con zoom */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-4"
             onClick={() => setIsZoomed(!isZoomed)}>
          <img 
            src={selectedPhotoData.image_url}
            alt={selectedPhotoData.caption || 'Trabajo realizado'}
            className={`transition-all duration-300 rounded-lg ${
              isZoomed 
                ? 'max-w-none w-auto h-auto cursor-zoom-out' 
                : 'max-h-[70vh] w-full object-contain cursor-zoom-in'
            }`}
          />
        </div>

        {/* Flechas de navegacion */}
        <button onClick={goToPrev} className="absolute left-2 top-1/2 ...">
          <ChevronLeft />
        </button>
        <button onClick={goToNext} className="absolute right-2 top-1/2 ...">
          <ChevronRight />
        </button>

        {/* Descripcion */}
        <div className="bg-black/80 px-6 py-4 text-white">
          {selectedPhotoData.work_type && (
            <span className="text-xs bg-primary/30 text-primary-foreground px-2 py-1 rounded-full">
              {selectedPhotoData.work_type}
            </span>
          )}
          {selectedPhotoData.caption && (
            <p className="text-sm mt-2">{selectedPhotoData.caption}</p>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

**Actualizar los onClick en las grillas:**
```tsx
// Antes: onClick={() => setSelectedPhoto(photo.image_url)}
// Despues: onClick={() => setSelectedPhotoIndex(workPhotos.indexOf(photo))}
// (o usar el index del map)
```

**Soporte de teclado:**
- Agregar un `useEffect` que escuche las teclas izquierda/derecha y Escape para navegar.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Reemplazar lightbox simple por visor e-commerce con zoom, navegacion, y descripcion visible |

## Resultado

- Al hacer click en una foto, se abre un visor a pantalla completa con la imagen en alta calidad
- Debajo de la imagen se muestra la descripcion y el tipo de trabajo
- Se puede hacer zoom con click para ver detalles sin pixelado
- Flechas para navegar entre fotos sin cerrar el visor
- En la grilla, el caption muestra hasta 2 lineas en vez de cortarse
