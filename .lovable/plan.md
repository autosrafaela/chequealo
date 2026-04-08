

# Plan: Hacer la URL personalizada más visible y accesible

## Problema actual

El `SlugConfiguration` está enterrado como una Card separada debajo de la info de perfil en la pestaña "Mi Perfil" del dashboard profesional. Pasa desapercibido — el profesional tiene que scrollear para encontrarlo.

## Solución

Integrar el slug directamente dentro de la Card de perfil (la tarjeta de identidad), como un campo más al lado de WhatsApp y Ubicación. En lugar de un componente Card pesado con reglas y botones, mostrar una versión compacta e inline:

**Vista normal (no editing):** Debajo de Ubicación, mostrar una fila:
```text
URL personalizada    chequealo.net/tu-slug  [📋 Copiar]
— o si no tiene —
URL personalizada    [Configurar tu link →]
```

**Al hacer clic en "Configurar tu link"** o en el slug existente: se abre un Dialog/Sheet con el `SlugConfiguration` completo (el componente actual, sin cambios).

Esto elimina el scroll innecesario y pone el link personalizado al mismo nivel visual que WhatsApp y Ubicación — exactamente donde el profesional mira.

## Archivos a modificar

### 1. Editar `src/pages/ProfessionalDashboard.tsx`
- En la vista "no editing" de la Card de perfil (líneas ~289-308), agregar una fila más para el slug con botón de copiar y link para editar
- Envolver el `SlugConfiguration` existente en un `Dialog` que se abre al hacer clic
- Eliminar el `SlugConfiguration` suelto como Card separada (líneas 313-320)

### 2. Sin cambios en `SlugConfiguration.tsx`
Se reutiliza tal cual dentro del Dialog.

## Resultado visual

La Card de perfil queda:
```text
┌─────────────────────────────────┐
│  [Avatar]  NOMBRE               │
│  Profesiones • aquí             │
│                                 │
│  WhatsApp     +54 341 xxx       │
│  Ubicación    📍 Rafaela        │
│  Mi Link      🔗 chequealo.net/slug [📋] │
│               (toca para editar)│
│                                 │
│  Descripción breve...           │
└─────────────────────────────────┘
```

