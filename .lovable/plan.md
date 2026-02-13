

# Plan: Pestanas con Color y Vida en los 3 Dashboards

## Resumen

Darle personalidad visual a las pestanas de los 3 dashboards (Usuario, Profesional, Admin) con iconos coloridos, efecto glassmorphism en inactivas, sombra en la activa y un contenedor flotante.

---

## Cambios

### 1. User Dashboard - `src/pages/UserDashboard.tsx` (lineas 648-668)

**TabsList** - Contenedor flotante con padding y sombra:

```tsx
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50">
```

**Cada TabsTrigger** - Estilo pill con sombra en activo y fondo glassmorphism en inactivo:

```tsx
// Inicio (Search icon - violeta)
<TabsTrigger value="home" className="shrink-0 text-xs px-3 py-2 rounded-full bg-gray-100/80 hover:bg-primary/10 transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-0 border-0">
  <Search className="h-4 w-4 mr-1.5 text-primary data-[state=active]:text-white" />
  Inicio
</TabsTrigger>

// Mensajes (azul)
<TabsTrigger ...>
  <MessageSquare className="h-4 w-4 mr-1.5 text-blue-500" />
  Mensajes
</TabsTrigger>

// Resenas (dorado)
<TabsTrigger ...>
  <Star className="h-4 w-4 mr-1.5 text-amber-500" />
  Resenas
</TabsTrigger>

// App Movil (verde)
<TabsTrigger ...>
  <Smartphone className="h-4 w-4 mr-1.5 text-green-500" />
  App Movil
</TabsTrigger>

// Config (naranja)
<TabsTrigger ...>
  <Settings className="h-4 w-4 mr-1.5 text-orange-500" />
  Config
</TabsTrigger>
```

Nota: Los iconos pierden su color individual cuando el tab esta activo porque el texto se vuelve blanco. Para lograr esto usaremos `[&_svg]:data-[state=active]:text-white` en el trigger o simplemente `data-[state=active]:text-white` que hereda a los hijos.

### 2. Professional Dashboard - `src/pages/ProfessionalDashboard.tsx` (lineas 829-854)

**TabsList** - Mismo contenedor flotante:

```tsx
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50 sticky top-4 z-10">
```

**Cada TabsTrigger** con icono colorido:

| Tab | Icono | Color del icono |
|-----|-------|-----------------|
| Mensajes | MessageCircle | text-blue-500 |
| Resenas | Star | text-amber-500 |
| Servicios | Briefcase | text-green-500 |
| Galeria | ImageIcon | text-purple-500 |
| Suscripcion | CreditCard | text-cyan-500 |
| Mi Perfil | User | text-orange-500 |

Agregar iconos faltantes (Star, Briefcase, ImageIcon, CreditCard, User) al import de lucide-react. Actualmente solo MessageCircle tiene icono.

### 3. Admin Dashboard - `src/pages/AdminDashboard.tsx` (lineas 583-600)

**TabsList** - Contenedor flotante:

```tsx
<TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/80 backdrop-blur-sm h-auto rounded-2xl shadow-sm border border-border/50">
```

**Cada TabsTrigger** - Mismo estilo pill pero sin iconos individuales (son 16 tabs, agregar iconos los haria demasiado anchos). Solo el estilo visual:

```tsx
<TabsTrigger value="professionals" className="shrink-0 text-xs px-3 py-2 rounded-full bg-gray-100/80 hover:bg-primary/10 transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md border-0">
  Profesionales
</TabsTrigger>
```

### 4. CSS - Clase auxiliar para iconos en tabs activos

En `src/index.css`, agregar:

```css
/* Tab icons: inherit white color when active */
.tab-icon-colored {
  transition: color 0.2s ease;
}
[data-state="active"] .tab-icon-colored {
  color: white !important;
}
```

Esto permite que los iconos coloridos cambien a blanco cuando su tab padre esta activo.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | TabsList flotante + 5 triggers con iconos coloridos |
| `src/pages/ProfessionalDashboard.tsx` | TabsList flotante + 6 triggers con iconos coloridos + imports nuevos |
| `src/pages/AdminDashboard.tsx` | TabsList flotante + 16 triggers con estilo pill glassmorphism |
| `src/index.css` | Clase `.tab-icon-colored` para transicion de color en activo |

## Resultado visual

- Barra de pestanas "flotante" con fondo semi-transparente y blur (glassmorphism)
- Pestanas inactivas en gris suave con hover violeta tenue
- Pestana activa en violeta solido con texto blanco y sombra de elevacion
- Iconos con colores unicos por seccion (azul mensajes, dorado resenas, etc.)
- Los iconos se vuelven blancos automaticamente cuando el tab esta activo
- Scroll horizontal suave en mobile como carrete de botones coloridos
