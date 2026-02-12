
# Plan: Rediseno del Flujo de Registro

## Resumen

Redisenar la pagina de registro (`/register`) con terminologia actualizada, sistema de tags para profesiones, layout en dos columnas, inputs modernos con focus violeta, fondo con blur fuerte, boton dorado y el mismo logo del header.

---

## Cambios en `src/pages/Register.tsx`

### 1. Logo del Header
- Cambiar `import chequealoLogo from '@/assets/chequealo-transparent-logo.png'` por `import chequealoLogo from '@/assets/chequealo-new-logo.png'` (el mismo que usa el Header)

### 2. Terminologia
- Cambiar el texto del boton "Soy Cliente" por "Busco un Profesional"
- Mantener "Soy Profesional" sin cambios

### 3. Fondo con blur mas fuerte
- Cambiar el overlay de `from-navy/80 via-navy/70 to-navy/60` a `from-navy/90 via-navy/85 to-navy/80` para oscurecer mas
- Agregar `backdrop-blur-md` al overlay para aplicar desenfoque a la imagen de fondo
- Cambiar el contenedor del formulario de `bg-card/95 backdrop-blur-sm` a `bg-white backdrop-blur-xl` con `rounded-3xl` (bordes muy redondeados)

### 4. Sistema de Tags multiseleccion para profesiones
- Reemplazar la lista vertical scrollable de servicios por un sistema de tags/chips
- Los servicios seleccionados se muestran como tags con fondo violeta (`bg-primary text-white`) con boton X para eliminar
- El buscador filtra y muestra resultados como chips clickeables en una grilla de `flex flex-wrap gap-2`
- Cada chip sin seleccionar: `border border-border rounded-full px-3 py-1.5 text-sm hover:border-primary cursor-pointer`
- Eliminar iconos de los chips para mantener limpieza (solo texto)
- Agregar al final de la lista la opcion "Otra profesion (Sugerir)" que al clickear muestra un campo de texto debajo para escribir la profesion custom
- Mantener limite de 3 selecciones

### 5. Layout en dos columnas para profesionales
- Cuando `userType === 'professional'`, organizar los campos del formulario en grid de 2 columnas (`grid grid-cols-1 md:grid-cols-2 gap-4`)
- Columna 1: Nombre, Email, Contrasena, Confirmar Contrasena
- Columna 2: DNI, Telefono, Ciudad (LocationAutocomplete), Descripcion
- La seccion de tags de profesiones ocupa el ancho completo (`col-span-full`)
- Los terminos y boton de submit tambien ocupan ancho completo
- Ampliar `max-w-md` a `max-w-2xl` para profesionales (mantener `max-w-md` para clientes)

### 6. Inputs modernos
- Agregar clase global a los inputs: `border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl` (bordes finos, focus violeta claro)
- Eliminar iconos dentro de los inputs (User, Mail, Lock) para un look mas limpio -- o mantenerlos pero en `text-muted-foreground/50`
- Tipografia: los Labels con `text-sm font-medium text-foreground`

### 7. Boton "Crear cuenta" dorado
- Cambiar de `bg-primary` a `bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold`
- Agregar `shadow-[0_0_20px_rgba(251,191,36,0.3)]` para glow dorado sutil
- Hacer el boton mas grande: `h-14 text-base rounded-xl`
- Hover: `hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]`

---

## Cambios en `src/pages/Auth.tsx`

### 1. Terminologia en la tab de signup
- Cambiar el boton "Cliente" del toggle de tipo de cuenta por "Busco un Profesional"

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Register.tsx` | Logo, terminologia, tags, 2 columnas, inputs, boton dorado, blur fuerte |
| `src/pages/Auth.tsx` | Cambiar "Cliente" por "Busco un Profesional" en signup toggle |

## Detalles tecnicos

- Estado adicional: `showCustomProfession: boolean` y `customProfession: string` para manejar la opcion "Otra profesion (Sugerir)"
- Cuando se selecciona "Otra profesion", se agrega `customProfession` al array `selectedServices` al confirmar
- Los chips de profesiones eliminan los iconos y colores del array `serviceCategories`, solo usan `category.name`
- El contenedor del formulario se expande responsivamente: `max-w-md` en mobile, `max-w-2xl` en desktop para profesionales
