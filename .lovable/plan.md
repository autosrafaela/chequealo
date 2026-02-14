
# Plan: Hacer clickeable el texto "Consultar" en Servicios

## Problema

Cuando un servicio no tiene precio definido, se muestra el texto "Consultar" como label estatico. El usuario espera que al tocarlo pueda contactar al profesional, pero no pasa nada.

## Solucion

Convertir "Consultar" en un link que abre WhatsApp del profesional con un mensaje pre-armado mencionando el servicio.

## Cambio unico en `src/pages/ProfessionalProfile.tsx`

En la seccion donde se renderiza el precio del servicio (lineas 478-486), cuando el texto es "Consultar", envolverlo en un elemento clickeable que llame a `handleWhatsApp` con un mensaje personalizado.

**Antes:**
```tsx
<span className="text-primary font-bold text-sm whitespace-nowrap">
  {service.price_from && service.price_to
    ? `$${...} - $${...}`
    : ...
    : 'Consultar'}
</span>
```

**Despues:**
- Si hay precio numerico: se muestra igual que ahora (texto estatico)
- Si es "Consultar": se muestra como un boton/link con estilo clickeable que abre WhatsApp con el mensaje: "Hola [nombre], vi tu servicio '[nombre del servicio]' en Chequealo y me gustaria consultar el precio."
- Se agrega `e.stopPropagation()` para no disparar el expand/collapse de la descripcion

## Detalle tecnico

Se creara una funcion auxiliar `handleConsultarWhatsApp(serviceName)` que:
1. Toma el telefono del profesional de `contactInfo?.phone`
2. Arma un mensaje contextual con el nombre del servicio
3. Abre `wa.me` en nueva pestana
4. Si no hay telefono, muestra toast de error

El texto "Consultar" tendra estilo `underline cursor-pointer hover:text-primary/80` para que sea visualmente interactivo.

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Agregar funcion `handleConsultarWhatsApp`, hacer clickeable el texto "Consultar" en servicios |
