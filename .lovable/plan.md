
# Plan: Limpieza Final del Perfil Profesional

## Resumen

Eliminar las secciones duplicadas (Zona Hoy y Mis Profesiones) del tab "Mi Perfil", dejando solo: Informacion Basica, URL Personalizada y acceso a Galeria. Ajustar botones a la paleta violeta de marca.

---

## Cambios en `src/pages/ProfessionalDashboard.tsx`

### Dentro de `ProfileTabContent` (lineas 289-320):

**Eliminar:**
- `ProfessionManager` (lineas 289-294) - gestion de rubros ya centralizada en otro modulo
- `ZonaTodayManager` (lineas 315-320) - ya reside en el Dashboard principal

**Reordenar lo que queda:**
1. Card principal (foto, nombre, datos editables) - sin cambios
2. URL Personalizada (`SlugConfiguration`) - se mantiene
3. Boton de acceso a Galeria de Trabajos - se mantiene

**Resultado final del return en ProfileTabContent:**
```
<div className="space-y-8">
  <Card> ... foto + datos editables ... </Card>
  <SlugConfiguration ... />
  <Button ... > Galeria de Trabajos </Button>
</div>
```

### Eliminar imports no usados:
- `ProfessionManager` (linea ~22)
- `ZonaTodayManager` (linea ~24)

### Estetica de botones - paleta violeta:
- Boton "Guardar URL" en `SlugConfiguration.tsx` (linea 269): ya usa `className="w-full"` con variant default (que es `bg-primary` = violeta de marca). No requiere cambio, ya es violeta.
- Boton "Galeria de Trabajos" (linea 297-304): cambiar de `variant="outline"` a `variant="default"` o agregar clase `bg-primary text-primary-foreground hover:bg-primary/90` para que sea violeta.
- Boton "Guardar Cambios" del formulario de edicion (linea 255): ya usa variant default = violeta. OK.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalDashboard.tsx` | Eliminar ProfessionManager y ZonaTodayManager del ProfileTabContent, ajustar boton Galeria a violeta, eliminar imports no usados |

## Notas

- Los componentes no se eliminan del proyecto, solo dejan de usarse en esta vista
- SlugConfiguration ya usa el variant default (violeta) por defecto
- El boton de Galeria es el unico que necesita cambio visual (de outline a default)
