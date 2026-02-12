
# Plan: Corregir el boton "Pedir Presupuesto" corrido

## Problema

El componente `ContactRequestDialog` renderiza su propio boton trigger visible ("Pedir Presupuesto") en la linea 770 del perfil. Este boton aparece flotando suelto porque el componente maneja su propio estado `open` interno. Mientras tanto, los botones CTA del perfil llaman a `setShowContactDialog(true)` pero ese estado no esta conectado al dialog.

## Solucion

Dos cambios simples:

### 1. ContactRequestDialog: aceptar control externo

**Archivo:** `src/components/ContactRequestDialog.tsx`

- Agregar props opcionales `open` y `onOpenChange` a la interfaz
- Usar los props externos cuando se proporcionan, o el estado interno como fallback
- Agregar prop `hideTrigger` para ocultar el boton trigger cuando se controla externamente
- Cuando `hideTrigger=true`, no renderizar el `DialogTrigger`

### 2. ProfessionalProfile: conectar estado al dialog

**Archivo:** `src/pages/ProfessionalProfile.tsx`

- Pasar `open={showContactDialog}` y `onOpenChange={setShowContactDialog}` al `ContactRequestDialog`
- Agregar `hideTrigger` para que no renderice el boton visible suelto
- Resultado: el boton flotante "Pedir Presupuesto" desaparece completamente, y los CTAs existentes (WhatsApp + Solicitar Presupuesto) abren el dialog correctamente

## Resultado esperado

- Sin boton suelto flotando
- Los botones "Solicitar Presupuesto" (superior y sticky bottom) abren el formulario correctamente
- El enlace "Presupuesto Express disponible" tambien sigue funcionando
