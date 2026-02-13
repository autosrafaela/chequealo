

# Plan: Mensaje de Feedback Personalizado para Resenas

## Estado Actual

Todo lo solicitado ya esta implementado:
- Card con `rounded-3xl`, `shadow-lg`, `hover:shadow-xl`
- Boton "Ver Perfil Profesional" violeta como CTA principal
- WhatsApp como icono secundario minimalista
- Estrellas y promedio visibles debajo del nombre
- Enlace "Dejar Resena" que abre `WriteReviewModal`
- Las resenas se guardan en la tabla `reviews` y un trigger de base de datos (`update_professional_rating`) actualiza automaticamente el rating y el conteo en la card

## Unico Cambio Pendiente

Personalizar el mensaje de exito al dejar una resena.

### Archivo: `src/components/WriteReviewModal.tsx` (linea 119)

Cambiar:
```
toast.success('¡Reseña publicada correctamente!');
```
Por:
```
toast.success('¡Gracias por tu opinión! Ayudas a la comunidad de Rafaela');
```

### Archivo: `src/components/ProfessionalCard.tsx` (linea en onReviewSubmitted)

Cambiar:
```
toast.success('¡Reseña enviada con éxito!');
```
Por: eliminar este toast duplicado (ya lo muestra el modal).

## Resultado

- Al publicar una resena, el usuario vera un unico mensaje: "Gracias por tu opinion! Ayudas a la comunidad de Rafaela"
- Sin toasts duplicados
