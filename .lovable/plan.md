
# Plan: Rediseno de Cards de Busqueda - "Atraccion Total"

## Resumen

Redisenar el componente `ProfessionalCard` (usado en la pagina de busqueda `/search`) para maximizar conversion con un CTA principal de "Ver Perfil", estetica premium, y un boton discreto de WhatsApp. Tambien agregar un enlace de "Dejar Resena" que abra el modal existente `WriteReviewModal`.

---

## Cambios

### 1. `src/components/ProfessionalCard.tsx` - Rediseno completo

**Estetica superior:**
- Card: `rounded-3xl shadow-lg hover:shadow-xl` en vez del actual `rounded-2xl shadow-sm`
- Avatar mas grande: `w-20 h-20` con borde decorativo
- Badge "Verificado" como sello premium sobre el avatar (posicion absoluta)

**Seccion de acciones (footer) - Nuevo layout:**
- Eliminar `ContactRequestDialog` (boton "Pedir Presupuesto") del footer
- CTA principal: Boton "Ver Perfil" con fondo violeta de marca (`bg-primary`), ancho completo, `rounded-xl`, con icono `Eye`
- WhatsApp: Icono pequeno circular en la esquina, no compite con "Ver Perfil"

**Resenas visibles:**
- Mantener las 5 estrellas visuales (ya existen)
- Agregar enlace "Dejar Resena" debajo del rating que abre `WriteReviewModal`
- Solo visible si el usuario esta logueado

**Badges de confianza:**
- Si `is_verified`: Badge "Verificado" con fondo emerald sobre el avatar (overlay circular)
- Quitar la duplicacion del badge verificado que aparece tanto arriba como abajo

### 2. Estructura visual propuesta

```text
+-----------------------------------------------+
|  [Avatar 20x20]   Nombre del Pro    [Corazon] |
|  [Badge Verif.]   Profesion                   |
|                   Ubicacion                    |
|                                                |
|  ★★★★☆  4.2 (8 opiniones) · Dejar Resena     |
|                                                |
|  Descripcion del profesional en dos            |
|  lineas maximo...                              |
|                                                |
|  [Disponible]                                  |
+-----------------------------------------------+
|  [====== Ver Perfil Profesional ======] [WA]  |
+-----------------------------------------------+
```

### 3. Detalle tecnico de cambios en `ProfessionalCard.tsx`

**Imports nuevos:**
- Agregar `useState` (ya importado)
- Agregar `WriteReviewModal` import
- Agregar `useAuth` import para mostrar boton de resena solo a usuarios logueados

**Card container (linea 83):**
```tsx
// Antes: rounded-2xl shadow-sm hover:shadow-lg
// Despues: rounded-3xl shadow-lg hover:shadow-xl
```

**Avatar (linea 89):**
```tsx
// Antes: w-16 h-16
// Despues: w-20 h-20 ring-2 ring-primary/20
```

**Badge verificado - Overlay sobre avatar:**
```tsx
// Posicion absoluta sobre el avatar
{isVerified && (
  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-md border-2 border-white">
    <Shield className="h-3 w-3 text-white" />
  </div>
)}
```

**Rating + Dejar Resena (lineas 126-137):**
```tsx
// Agregar enlace "Dejar Resena" al lado del conteo
<button onClick={() => setShowReviewModal(true)} className="text-primary text-sm hover:underline ml-2">
  Dejar Resena
</button>
```

**Eliminar duplicacion de badge verificado** de la seccion de disponibilidad (lineas 151-155).

**Footer de acciones (lineas 159-183):**
```tsx
// Reemplazar los 3 botones por:
<div className="border-t border-gray-100 p-4">
  <div className="flex gap-2">
    <Button 
      className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md"
      onClick={handleViewProfile}
    >
      <Eye className="h-4 w-4 mr-2" />
      Ver Perfil Profesional
    </Button>
    <Button
      size="icon"
      variant="outline"
      className="rounded-xl border-green-200 hover:bg-green-50 text-green-600"
      onClick={handleWhatsAppClick}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  </div>
</div>
```

**WriteReviewModal integration:**
- Estado: `const [showReviewModal, setShowReviewModal] = useState(false);`
- Render del modal al final del componente
- `onReviewSubmitted` hace un toast de exito

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ProfessionalCard.tsx` | Rediseno completo: estetica premium, CTA "Ver Perfil" como principal, WhatsApp como icono, enlace "Dejar Resena", badge verificado como overlay |

## Resultado visual

- Cards con bordes mas redondeados (`rounded-3xl`) y sombras premium (`shadow-lg`)
- Avatar mas grande con borde decorativo violeta
- Badge "Verificado" como sello sobre la foto
- CTA principal violeta "Ver Perfil Profesional" que ocupa casi todo el ancho
- WhatsApp como boton icono pequeno al lado, no compite
- Enlace "Dejar Resena" clickeable junto al rating
- Sin boton "Pedir Presupuesto" en la card (se accede desde el perfil)
- Layout mobile perfecto sin textos cortados
