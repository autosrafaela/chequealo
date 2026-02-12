

# Plan: Pantalla "Editar Mis Servicios" completa

## Resumen

Crear una nueva pantalla/componente de edicion de servicios profesionales que unifique la gestion de rubros (profesiones multiples) y servicios en una sola interfaz moderna. Se integrara como contenido del tab "Servicios" en el dashboard profesional, que actualmente esta vacio.

---

## 1. Crear componente EditMyServices

**Nuevo archivo:** `src/components/EditMyServices.tsx`

Componente principal que incluye:

### Seccion A: Selector de Rubros con Autocompletado
- Input de busqueda con icono de lupa que filtra la lista existente de 130+ profesiones (reutilizando la lista de `ProfessionManager.tsx`)
- Al seleccionar un rubro, se agrega como tag/pill
- Limite de 3 rubros maximo

### Seccion B: Gestion de Etiquetas (Pills)
- Cada rubro seleccionado aparece como una pill/badge con:
  - Icono del rubro
  - Nombre del rubro
  - Badge "(Principal)" para el primero
  - Boton "X" para eliminar
- Debajo de cada pill, un campo `Textarea` colapsable para agregar una descripcion especifica de experiencia en ese rubro

### Seccion C: Sugerir Nuevo Rubro
- Si la busqueda no encuentra resultados, mostrar un boton "No encuentras tu rubro? Sugerirlo aqui"
- Al hacer clic, se despliega un `Input` de texto libre para que el profesional escriba su rubro personalizado
- El rubro sugerido se agrega como pill igual que los demas

### Seccion D: Boton de Guardar
- Boton destacado en violeta (bg-primary) con texto "Actualizar Perfil Profesional"
- Al hacer clic: muestra spinner (Loader2 animate-spin) y texto "Actualizando..."
- Guarda en dos tablas:
  1. `professionals.profession` = primer rubro seleccionado (compatibilidad legacy)
  2. `professional_professions` = todos los rubros seleccionados con flag `is_primary`

### Estetica
- Tarjeta blanca con bordes redondeados (`rounded-xl`)
- Separadores sutiles entre secciones
- Tipografia moderna con pesos variados
- Responsive: una columna en mobile, layout mas amplio en desktop

---

## 2. Agregar TabsContent faltantes en ProfessionalDashboard

**Archivo:** `src/pages/ProfessionalDashboard.tsx`

Actualmente faltan los `TabsContent` para "services", "reviews" y "portfolio". Agregar:

```
<TabsContent value="reviews">
  <ReviewManagementPanel />
</TabsContent>

<TabsContent value="services">
  <EditMyServices 
    professionalData={professional}
    onUpdate={fetchDashboardData}
  />
  <ServicesManager />
</TabsContent>

<TabsContent value="portfolio">
  <WorkPhotosManager />
</TabsContent>
```

El tab "Servicios" mostrara primero el nuevo `EditMyServices` (rubros/profesiones) y debajo el `ServicesManager` existente (servicios individuales con precios).

---

## 3. Logica de guardado

Al presionar "Actualizar Perfil Profesional":

1. Actualizar `professionals.profession` con el primer rubro seleccionado
2. Eliminar todos los registros existentes en `professional_professions` para ese profesional
3. Insertar los nuevos rubros seleccionados en `professional_professions` con `is_primary` en el primero
4. Mostrar toast de exito y llamar `onUpdate()`

---

## Archivos a modificar/crear

| Archivo | Accion |
|---------|--------|
| `src/components/EditMyServices.tsx` | Crear nuevo componente |
| `src/pages/ProfessionalDashboard.tsx` | Agregar TabsContent para services, reviews, portfolio; importar EditMyServices |

## Detalle tecnico

### Props del nuevo componente
```typescript
interface EditMyServicesProps {
  professionalData: any;
  onUpdate: () => void;
}
```

### Estructura visual
```text
+------------------------------------------+
| Mis Rubros Profesionales                  |
|                                           |
| [Buscar rubro...]                         |
|                                           |
| [Plomero X] [Electricista X]              |
|                                           |
| > Plomero                                 |
|   [Descripcion de experiencia...]         |
|                                           |
| > Electricista                            |
|   [Descripcion de experiencia...]         |
|                                           |
| No encuentras tu rubro? Sugerirlo aqui    |
|                                           |
| [ Actualizar Perfil Profesional ]         |
+------------------------------------------+
```

### Lista de rubros
Se reutiliza la misma lista de `serviceCategories` del `ProfessionManager.tsx`, extraida a una constante compartida o duplicada en el componente nuevo para evitar dependencias circulares.

