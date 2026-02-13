
# Plan: Ajuste de Precision del User Dashboard

## Resumen

Corregir desalineaciones en el panel de cliente: centrar contenido con max-width de 600px, unificar padding y bordes de cards, alinear header con items-center, centrar tabs y aplicar espaciado uniforme.

---

## Cambios

### Archivo: `src/pages/UserDashboard.tsx`

#### 1. Contenedor principal: max-width 600px centrado

Cambiar el contenedor principal (linea 588):

```tsx
// Antes:
<div className="container mx-auto px-4 py-8 max-w-6xl">

// Despues:
<div className="mx-auto px-4 py-6 max-w-[600px]">
```

Esto centra todo el contenido en mobile y tablets con margenes laterales iguales.

#### 2. Header del usuario: alineacion vertical perfecta

El header (linea 594) ya usa `flex items-center gap-4`, lo cual es correcto. Pero el texto interno (lineas 601-612) no tiene alineacion explicita. Agregar `min-w-0` al div de texto para evitar overflow:

```tsx
<div className="flex items-center gap-4 mb-4">
  <Avatar className="h-16 w-16 shrink-0">...</Avatar>
  <div className="min-w-0">
    <h1 className="text-2xl font-bold text-foreground uppercase truncate">...</h1>
    <p className="text-sm text-muted-foreground truncate">...</p>
  </div>
</div>
```

- Reduce `text-3xl` a `text-2xl` para que no desborde en mobile
- Agrega `truncate` para nombres largos
- `shrink-0` en el Avatar para que no se comprima

#### 3. Cards con padding y bordes uniformes (rounded-xl)

Unificar todas las cards del tab Home:

| Card | Antes | Despues |
|------|-------|---------|
| Favoritos | `rounded-2xl shadow-sm` | `rounded-xl shadow-sm` |
| Mis Consultas | `rounded-2xl shadow-sm` | `rounded-xl shadow-sm` |
| CTA Profesional | `rounded-2xl shadow-sm` | `rounded-xl shadow-sm` |
| Card Profesional Banner | sin rounded especifico | `rounded-xl` |

Todas las cards usaran `rounded-xl` para consistencia.

#### 4. Tabs centrados con texto legible en mobile

Cambiar el TabsList (linea 648):

```tsx
// Antes:
<TabsList className="grid w-full grid-cols-5">

// Despues:
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1">
```

Cada TabsTrigger con `shrink-0 text-xs px-2.5` para que en pantallas chicas se pueda scrollear sin amontonarse.

#### 5. Espaciado uniforme space-y-4

Cambiar el `Tabs` wrapper (linea 647):

```tsx
// Antes:
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

// Despues:
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
```

Dentro del tab Home, reemplazar los `mb-6` individuales por un wrapper `space-y-4`:

```tsx
<TabsContent value="home">
  <div className="space-y-4">
    {/* Buscador */}
    <div className="relative">...</div>
    {/* Card Favoritos */}
    <Card className="rounded-xl shadow-sm">...</Card>
    {/* Card Consultas */}
    <Card className="rounded-xl shadow-sm">...</Card>
    {/* CTA Profesional */}
    {!isProfessional && <Card className="rounded-xl shadow-sm ...">...</Card>}
  </div>
</TabsContent>
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | Contenedor 600px, header alineado, cards uniformes, tabs scrollables, space-y-4 |

## Resultado

- Contenido centrado en 600px max-width con margenes simetricos
- Cards con bordes `rounded-xl` y padding consistente
- Header con avatar y texto perfectamente alineados verticalmente
- Tabs navegables con scroll horizontal en pantallas chicas
- Espaciado `space-y-4` uniforme entre todas las secciones
