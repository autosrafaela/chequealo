

# Plan: Corregir Servicios, Express Quote y Botones del Perfil Publico

## Resumen

Corregir el layout de servicios para que sea una fila con precio y botones de gestion alineados a la derecha, eliminar el boton flotante de Presupuesto Express y convertirlo en un enlace secundario, asegurar botones simetricos en mobile, y limpiar espacios excesivos.

---

## 1. Servicios: Layout de fila correcto

**Archivo:** `src/pages/ProfessionalProfile.tsx` (lineas 418-433)

Reemplazar el sistema actual de `ProfileServiceCard` + boton `absolute` por un layout inline completo directamente en el map:

```
[Icono] [Nombre + descripcion]  ···  [Precio]  [Editar] [Eliminar]
```

- Cada fila: `flex items-center justify-between py-3 border-b border-border/30 last:border-b-0`
- Izquierda (`flex-1 min-w-0`): icono en circulo pastel + nombre/descripcion truncados
- Derecha (`flex items-center gap-3 ml-4 shrink-0`): precio en `text-primary font-bold` + iconos de gestion del owner
- Se elimina el `relative` + `absolute` del boton de eliminar, pasa a ser parte del flex inline
- Ya no se usa `ProfileServiceCard` en esta pagina (el componente sigue existiendo para reutilizacion)

## 2. Eliminar boton flotante Express Quote

**Archivo:** `src/pages/ProfessionalProfile.tsx` (lineas 577-586)

- Eliminar completamente el bloque de `ExpressQuoteButton` flotante
- Agregar debajo de los CTAs principales (linea 354) un enlace secundario pequeno para profesionales verificados:

```tsx
{professional.is_verified && (
  <p className="text-center text-xs text-muted-foreground">
    <button onClick={() => setShowContactDialog(true)} className="text-amber-600 font-semibold hover:underline">
      Presupuesto Express disponible
    </button>
  </p>
)}
```

- Eliminar el import de `ExpressQuoteButton` (linea 12)

## 3. Botones principales simetricos en mobile

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- CTAs superiores (lineas 339-354): Ambos ya tienen `flex-1 h-12` -- esta correcto
- CTAs sticky bottom (lineas 722-738): Ambos ya tienen `flex-1 h-14` -- esta correcto
- Sin cambios necesarios aqui, ya son simetricos

## 4. Limpiar gaps excesivos

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Linea 589: Tabs section tiene `className="mt-6"` -- cambiar a `mt-4`
- Linea 711: PublicAgendaGrid tiene `className="mt-6"` -- cambiar a `mt-4`
- Estas reducciones eliminan el gap excesivo entre galeria y botones de contacto

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Servicios inline con precio+botones a la derecha, eliminar Express flotante, agregar enlace Express sutil, reducir gaps |

## Detalle tecnico

### Servicios - Nuevo layout por fila

Cada item de servicio pasa de:
- `<div relative>` + `<ProfileServiceCard>` + `<Button absolute top-2 right-2>`

A:
- `<div flex items-center justify-between>` con precio y botones inline a la derecha, todo en una fila
- El precio va primero, luego los iconos de gestion (solo para owner) con `gap-3` entre ellos

### Express Quote - Integracion sutil
- Se elimina el boton naranja grande flotante
- Se agrega un texto link pequeno "Presupuesto Express disponible" en amber debajo de los CTAs, que abre el mismo `ContactRequestDialog`
- Esto mantiene la funcionalidad sin romper la estetica limpia

