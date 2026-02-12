
# Plan: Rediseno de la Pagina de Autenticacion (/auth)

## Resumen

Transformar la pagina `/auth` para que sea visualmente identica a la pagina de Registro: fondo con imagen de profesionales + blur fuerte, card blanca centrada con bordes muy redondeados, logo del header, boton dorado, Google minimalista, y eliminar el Header con su barra lateral de ruido.

---

## Cambios en `src/pages/Auth.tsx`

### 1. Eliminar Header y ruido
- Quitar `import Header from '@/components/Header'` y el componente `<Header />` del render
- Eliminar el wrapper `bg-background` y el contenedor `container mx-auto`
- Esto elimina automaticamente la barra lateral con Sugerencias, Publicaciones y Favoritos

### 2. Logo del header
- Cambiar `import chequealoLogo from '@/assets/chequealo-transparent-logo.png'` por `import chequealoLogo from '@/assets/chequealo-new-logo.png'`
- Eliminar el `CardTitle` y `CardDescription` actuales, reemplazar por logo centrado pequeno (h-10)

### 3. Fondo identico al Registro
- Agregar `import heroProfessionals from '@/assets/hero-professionals.jpg'`
- Wrapper principal: `min-h-screen flex items-center justify-center bg-cover bg-center relative` con `backgroundImage: url(heroProfessionals)`
- Overlay oscuro con blur: `absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/85 to-navy/80 backdrop-blur-md`
- Boton "Volver al inicio" flotante en esquina superior izquierda (como en Register)

### 4. Card centrada con bordes redondeados
- Reemplazar el `<Card>` actual por un `div` con: `bg-white backdrop-blur-xl p-8 rounded-3xl shadow-2xl`
- Ancho maximo: `max-w-md` con `mx-4` para margen mobile
- Eliminar `CardHeader`, `CardContent` y usar divs simples

### 5. Tabs con estilo consistente
- Mantener Tabs de login/signup pero con estilo visual identico al toggle del Registro:
  - Contenedor: `flex bg-gray-100 rounded-xl p-1 mb-6`
  - Tab activa: `bg-primary text-primary-foreground rounded-lg`
  - Tab inactiva: `text-gray-600 hover:text-gray-800`
- Usar botones custom en lugar de TabsList/TabsTrigger de Radix para control visual total, manteniendo el estado con `activeTab` (useState)

### 6. Inputs modernos
- Agregar a todos los inputs la clase: `border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl h-12`
- Labels: `text-sm font-medium text-foreground`

### 7. Boton Google minimalista
- Mantener el boton de Google pero con estilo limpio: `border border-border/60 rounded-xl h-12 hover:bg-gray-50 bg-white`
- Sin sombra, solo borde fino

### 8. Botones principales dorados
- "Iniciar Sesion": `h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]`
- "Crear Cuenta": mismo estilo dorado
- Mantener estado de loading con Loader2

### 9. Links de navegacion elegantes
- Al final del tab login: "No tenes cuenta? **Registrate**" con link a `/register`
- Al final del tab signup: "Ya tenes cuenta? **Inicia Sesion**" que cambia el tab activo
- Estilo: `text-sm text-gray-500` con el link en `text-primary font-semibold hover:underline`

### 10. Toggle tipo de cuenta en signup
- Mantener el toggle "Busco un Profesional" / "Profesional" con el mismo estilo que el toggle de tabs (bg-gray-100, rounded-xl, estado activo en violeta)

### 11. Forgot Password modal
- Mantener la funcionalidad del modal pero aplicar `rounded-2xl` al Card del modal
- Boton de enviar con estilo dorado

### 12. Loading state
- Mantener el spinner centrado pero sobre el fondo con imagen (no sobre bg-background)

---

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Auth.tsx` | Fondo con imagen + blur, card rounded-3xl, logo header, tabs custom, inputs modernos, botones dorados, Google minimalista, links elegantes, sin Header |

## Estructura visual resultante

```text
+------------------------------------------+
|  [<- Volver al inicio]                   |
|                                          |
|     (imagen profesionales + blur)        |
|                                          |
|        +----------------------+          |
|        |   [Logo Chequealo]   |          |
|        |                      |          |
|        | [Login] [Registrarse]|          |
|        |                      |          |
|        | [Google btn limpio]  |          |
|        | ---- o email ----    |          |
|        | Email: [________]    |          |
|        | Pass:  [________]    |          |
|        | Olvidaste tu pass?   |          |
|        |                      |          |
|        | [===INICIAR SESION===]|         |
|        |  (dorado, grande)    |          |
|        |                      |          |
|        | No tenes cuenta?     |          |
|        | Registrate           |          |
|        +----------------------+          |
|                                          |
+------------------------------------------+
```
