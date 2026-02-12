
# Plan: Header Minimalista Silicon Valley

## Resumen

Redisenar el Header completo para que sea ultra-limpio y minimalista, eliminando elementos redundantes y agrupando acciones secundarias dentro del menu hamburguesa.

---

## Cambios en `src/components/Header.tsx`

### 1. Logo + Badge Pioneros separado
- Mantener logo a la izquierda
- Badge "PIONEROS" como capsula independiente: fondo dorado solido (`bg-gradient-to-r from-amber-400 to-orange-400`), texto negro (`text-black`), font-weight bold, rounded-full, separado del logo con gap

### 2. Eliminar selectores de Provincia/Ciudad
- Quitar los dos `<select>` de provincia y ciudad del desktop (lineas 182-209)
- Quitar los selectores de ubicacion del menu desplegable mobile (lineas 330-357)
- Reemplazar por texto estatico: icono MapPin + "Rafaela, Santa Fe" en texto pequeno, visible solo en desktop (`hidden md:flex`)

### 3. Eliminar barra de busqueda del header
- Eliminar todo el bloque "Desktop Search Section" (lineas 159-231): input, selects, boton buscar, FilterDropdown
- Eliminar el bloque "Mobile Search Expanded" (lineas 399-425)
- Mantener solo un icono de lupa en mobile que navega a `/search` (ya existe el boton mobile)
- En desktop, mostrar un boton icono de lupa discreto que navega a `/search` o hace scroll al Hero

### 4. Mover "Sugerencias" y "Publicaciones" al menu hamburguesa
- Quitar `FloatingWhatsAppWidget` del header principal
- Agregar dentro del dropdown menu: boton "Sugerencias" (con icono MessageCircle) que ejecuta la misma logica de WhatsApp
- Agregar "Publicaciones" (link a filtro "latest") dentro del menu
- Eliminar FilterDropdown del header y moverlo al menu

### 5. Estetica general
- Cambiar fondo del header de `bg-navy` a `bg-white/80 backdrop-blur-xl border-b border-black/5` para efecto glassmorphism sutil sobre blanco
- Actualizar colores de texto e iconos de `text-navy-foreground` a `text-foreground` (oscuro sobre fondo claro)
- Aumentar padding interno para dar "aire": altura `h-16 sm:h-18`
- Menu hamburguesa con icono limpio, sin texto extra visible

### 6. Menu desplegable rediseñado
- Fondo blanco puro con sombra elegante y border-radius mayor (`rounded-2xl`)
- Items con padding generoso y tipografia limpia
- Incluir: Sugerencias (WhatsApp), Favoritos, Ordenar por (FilterDropdown), Instalar App, auth actions

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/Header.tsx` | Rediseno completo: eliminar search bar, selectores, mover items al menu, glassmorphism blanco |

## Resultado esperado

Header ultra-limpio con solo: Logo | Badge Pioneros | Ubicacion (texto) | Lupa (icono) | Notificaciones | Menu hamburguesa. Todo lo demas dentro del menu. Fondo blanco con blur sutil.
