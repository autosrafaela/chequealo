
# Plan: Rediseno del Dashboard de Usuario (Cliente)

## Resumen

Simplificar el UserDashboard eliminando la pestana de Favoritos, agregando una Card de favoritos en la vista principal, un buscador prominente, y un acceso directo a mensajes. Limpiar bloques innecesarios.

---

## Cambios en `src/pages/UserDashboard.tsx`

### 1. Eliminar pestana "Favoritos" del TabsList

- Reducir de 7 columnas (`grid-cols-7`) a 6 (`grid-cols-6`)
- Eliminar el `TabsTrigger value="favorites"` y su `TabsContent value="favorites"` correspondiente

### 2. Redisenar la vista principal (tab "profile")

Reemplazar el contenido actual del `TabsContent value="profile"` con una estructura limpia:

**a) Buscador protagonista (arriba de todo)**
```
Barra de busqueda grande con icono Search
Placeholder: "Que servicio buscas hoy en Rafaela?"
Al hacer clic o escribir, navega a /search?q={query}
```

**b) Card "Mis Profesionales Favoritos"**
- Usa el hook `useFavorites` para obtener IDs
- Consulta `professionals_public` para obtener datos (nombre, profesion, imagen)
- Muestra un grid horizontal scrollable con items circulares: foto + nombre + rubro
- Click en un favorito navega a `/professional/{id}`
- Estado vacio: icono Heart + "Aun no tienes favoritos guardados"

**c) Card "Mis Consultas" (acceso directo a mensajes)**
- Icono MessageSquare + titulo "Mis Consultas"
- Muestra cantidad de conversaciones activas
- Boton que cambia a `setActiveTab('messages')`

**d) Mantener la Card de "Crear Cuenta Profesional"** (si no es profesional) como CTA al final

### 3. Eliminar bloques de la vista principal

- Eliminar los 4 Stats Cards actuales (Solicitudes Enviadas, Solicitudes Activas, Favoritos Guardados, Crear Cuenta)
- Eliminar TransactionConfirmationCard y ReadyToRateTransactions del tab profile (mover a solicitudes si es necesario)
- Eliminar ProfileCompletionChecklist si existe en la vista

### 4. Mover formulario de perfil

- El formulario de "Informacion Personal" pasa a la pestana "Configuracion" o se mantiene como tab separado pero NO es la vista principal
- La vista principal ahora muestra: Buscador + Favoritos + Mis Consultas

---

## Detalle tecnico

### Estructura del nuevo tab principal ("home")

```tsx
// Renombrar tab "profile" a "home" como vista principal
<TabsContent value="home">
  {/* Buscador */}
  <div className="mb-6">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Que servicio buscas hoy en Rafaela?"
        className="pl-12 h-14 text-lg rounded-2xl shadow-sm"
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${searchQuery}`)}
      />
    </div>
  </div>

  {/* Card Favoritos */}
  <Card className="rounded-2xl shadow-sm mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" />
        Mis Profesionales Favoritos
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Grid horizontal scrollable */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {favoriteProfessionals.map(prof => (
          <button onClick={() => navigate(`/professional/${prof.id}`)}>
            <Avatar className="h-16 w-16" />
            <p className="text-xs font-semibold">{prof.full_name}</p>
            <p className="text-xs text-muted-foreground">{prof.profession}</p>
          </button>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Card Mis Consultas */}
  <Card className="rounded-2xl shadow-sm mb-6 cursor-pointer"
        onClick={() => setActiveTab('messages')}>
    <CardContent className="p-6 flex items-center gap-4">
      <MessageSquare className="h-8 w-8 text-primary" />
      <div>
        <p className="font-semibold">Mis Consultas</p>
        <p className="text-sm text-muted-foreground">Ver conversaciones con profesionales</p>
      </div>
    </CardContent>
  </Card>

  {/* CTA Crear cuenta profesional */}
  {!isProfessional && <Card>...</Card>}
</TabsContent>
```

### Fetch de favoritos con detalles

```tsx
const [favoriteProfessionals, setFavoriteProfessionals] = useState([]);

useEffect(() => {
  if (favoriteIds.length === 0) return;
  supabase
    .from('professionals_public')
    .select('id, full_name, profession, image_url')
    .in('id', favoriteIds)
    .then(({ data }) => setFavoriteProfessionals(data || []));
}, [favoriteIds]);
```

### Tabs actualizados

| Antes (7 tabs) | Despues (6 tabs) |
|---|---|
| Mi Perfil | Inicio |
| Favoritos | ~~eliminado~~ |
| Mensajes | Mensajes |
| Solicitudes | Solicitudes |
| Resenas | Resenas |
| App Movil | App Movil |
| Configuracion | Configuracion (incluye perfil personal) |

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | Rediseno completo de la vista principal, eliminar tab Favoritos, mover perfil a Configuracion, agregar buscador + card favoritos + card mensajes |

## Estetica

- Cards con `rounded-2xl shadow-sm` para estilo limpio
- Bordes suaves, sin bordes duros
- Avatares circulares con foto o iniciales en color determinista (usa `getAvatarColor`)
- Espaciado generoso entre secciones
