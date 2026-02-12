

# Plan: Limpieza Radical del Perfil Profesional

## Resumen

Transformar la tab "Mi Perfil" del dashboard profesional en una tarjeta de presentacion limpia y minimalista, eliminando secciones irrelevantes y unificando la edicion en un solo lugar.

---

## Cambios en `src/pages/ProfessionalDashboard.tsx`

### Eliminar del tab "profile" (lineas 684-782):

1. **ProfileCompletionProgress** (linea 686-689) - Eliminar la barra circular de progreso y checklist de tareas pendientes
2. **Card "Informacion del Perfil"** (lineas 691-733) - Eliminar el bloque de solo lectura que muestra datos no editables (nombre, email, telefono, ubicacion como texto plano)
3. **AchievementsBadges** (linea 757) - Eliminar insignias y logros
4. **BankingInfoForm** (linea 758) - Eliminar datos bancarios
5. **SlugConfiguration** (lineas 761-767) - Mantener (URL personalizada es util)
6. **ZonaTodayManager** (lineas 770-781) - Mantener

### Reemplazar con estructura limpia:

```
TabsContent value="profile":
  1. Header elegante con foto grande editable + nombre + boton "Ver Perfil Publico"
  2. Seccion "Datos Personales" - formulario inline editable:
     - Foto de perfil (click para cambiar)
     - Nombre completo
     - WhatsApp / Telefono
     - Ubicacion
     - Descripcion profesional
     Boton "Guardar Cambios"
  3. ProfessionManager (Mis Profesiones) - ya existe, se mantiene
  4. Boton de acceso a "Galeria de Trabajos" (link a tab portfolio)
  5. SlugConfiguration (URL personalizada)
  6. ZonaTodayManager (Zona Hoy)
```

### Diseno visual:
- Foto de perfil grande (w-24 h-24) centrada con overlay de camara para editar
- Tipografia grande para el nombre (text-2xl font-bold)
- Campos de formulario con mucho espacio (space-y-6)
- Fondo limpio sin cards anidadas innecesarias
- Una sola Card principal con padding generoso (p-8)

### Eliminar imports no usados:
- `ProfileCompletionProgress`
- `AchievementsBadges`
- `BankingInfoForm`
- `ProfessionalProfileEdit` (su logica de edicion se integra directamente en el tab)

### Logica de edicion unificada:
En lugar de abrir un Dialog para editar, los campos seran editables inline dentro de la misma tarjeta. Un estado `isEditing` controla si los campos son de lectura o edicion. Al hacer click en "Editar", los campos se transforman en inputs. Al guardar, se actualiza todo junto.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalDashboard.tsx` | Reescribir TabsContent "profile" completo, eliminar imports innecesarios |

## Notas

- No se eliminan los componentes (AchievementsBadges, BankingInfoForm, ProfileCompletionProgress) del proyecto, solo se dejan de usar en esta vista
- ProfessionalProfileEdit se reemplaza por edicion inline directa
- La galeria de trabajos se accede desde un boton que cambia a la tab "portfolio"

