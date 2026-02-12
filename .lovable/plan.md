

# Plan: Correccion de Diseno en Header y Layout Principal

## Resumen

Corregir el espacio blanco entre Header y contenido, hacer visible el badge PIONEROS y la ubicacion en mobile, eliminar la sombra visual del borde del header, y asegurar z-index correcto.

---

## 1. Eliminar espacio blanco entre Header y contenido

**Archivo:** `src/pages/Index.tsx`

El problema principal son los `mt-10 md:mt-0` en las secciones de notificaciones (linea 47) y carousel (linea 53). Estos agregan 40px de margen superior en mobile sin razon.

- Linea 47: Cambiar `pt-4 md:pt-4 mt-10 md:mt-0` a `pt-3`
- Linea 53: Cambiar `py-4 sm:py-6 mt-10 md:mt-0` a `py-3 sm:py-4`

## 2. Header mobile: mostrar badge PIONEROS y ubicacion

**Archivo:** `src/components/Header.tsx`

- **Badge PIONEROS** (linea 78): Cambiar `hidden sm:inline-flex` a `inline-flex` para que sea visible en todas las pantallas. Reducir tamano en mobile con `text-[8px] sm:text-[10px] px-2 sm:px-3`.
- **Ubicacion** (linea 84): Cambiar `hidden md:flex` a `flex`. En mobile, simplificar a solo el icono MapPin con texto reducido. Usar `text-[10px] sm:text-sm` y colocar junto al badge PIONEROS dentro del mismo flex del logo, o como segunda fila compacta debajo del logo.
- Reorganizar el area izquierda del header: logo + badge en una fila, y debajo en mobile una mini-fila con pin + "Rafaela" (solo en mobile, en desktop queda como esta en el centro).

**Estructura propuesta del header izquierdo:**
```
[Logo] [PIONEROS]
[Pin Rafaela]        <- solo mobile, debajo del logo
```

En desktop se mantiene la ubicacion centrada como esta.

## 3. Eliminar sombra visual del border-bottom

**Archivo:** `src/components/Header.tsx`

- Linea 72: Cambiar `border-b border-black/5` a `border-b border-transparent` o eliminarlo completamente para que no haya linea de sombra visual empujando el contenido. Alternativa: usar `shadow-none` explicitamente.
- Resultado: el header se funde suavemente con el contenido sin linea divisoria.

## 4. Z-Index del Header

**Archivo:** `src/components/Header.tsx`

- Linea 72: Cambiar `z-50` a `z-[100]` para garantizar que el header este siempre por encima de todo el contenido al hacer scroll.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/Header.tsx` | Badge PIONEROS visible en mobile, ubicacion visible en mobile, eliminar border-b visual, z-index a z-[100] |
| `src/pages/Index.tsx` | Eliminar mt-10 de secciones de notificaciones y carousel |

## Detalle tecnico

### Header.tsx - Estructura izquierda reorganizada

El area del logo pasa de un simple flex horizontal a un mini-layout:
- Fila 1: Logo + Badge PIONEROS (ambos visibles siempre)
- Fila 2 (solo mobile): icono MapPin mini + "Rafaela, Santa Fe" en texto muy pequeno
- En desktop (md+): la ubicacion se mantiene centrada como actualmente

### Index.tsx - Margins a eliminar
- `mt-10 md:mt-0` en linea 47 (EnableNotificationsBanner)
- `mt-10 md:mt-0` en linea 53 (HeaderCarousel)

Estos margins eran probablemente residuos de cuando habia un banner sticky que ya fue eliminado (MobileCTABanner retorna null).

