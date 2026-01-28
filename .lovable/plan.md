
# Plan: Corregir visualización de Profesiones en Perfil Profesional

## Problema Identificado

El componente `ProfileHeroSection.tsx` tiene una **query duplicada** para obtener las profesiones. Ya se obtienen en `useProfessionalProfile.ts` y se pasan como parte del objeto `professional`, pero el componente Hero hace una segunda query independiente que puede:

1. **Tener datos desactualizados** por el cache de React Query
2. **Mostrar orden incorrecto** ya que ambas queries ordenan diferente
3. **No refrescarse** cuando se agregan nuevas profesiones

## Solución

### Cambio 1: Modificar `ProfileHeroSection.tsx`
Eliminar la query duplicada y usar las profesiones que ya vienen en el objeto `professional`:

```text
Antes:
- El componente hace su propia query a professional_professions
- Cache independiente que puede estar desactualizado

Después:
- Usar professional.professions que viene del hook useProfessionalProfile
- Una sola fuente de verdad
- Invalidación de cache automática cuando se modifican profesiones
```

### Cambio 2: Actualizar la Interface en `ProfileHeroSection.tsx`
Agregar la propiedad `professions` al tipo `Professional`:

```typescript
interface Professional {
  id: string;
  full_name: string;
  profession: string;
  professions?: Array<{ profession: string; is_primary: boolean }>;
  // ... otras propiedades
}
```

### Cambio 3: Simplificar `getProfessionDisplay()`
Usar las profesiones del objeto en lugar de la query:

```typescript
const getProfessionDisplay = () => {
  if (professional.professions && professional.professions.length > 0) {
    return professional.professions.map(p => p.profession).join(' • ');
  }
  return professional.profession;
};
```

### Cambio 4: Invalidar Cache al agregar profesiones
En el componente donde se agregan profesiones (Dashboard), asegurar que se invalide el cache:

```typescript
queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
queryClient.invalidateQueries({ queryKey: ['professional-professions', professionalId] });
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/profile/ProfileHeroSection.tsx` | Eliminar query duplicada, usar props |
| `src/components/dashboard/ProfessionModal.tsx` | Agregar invalidación de cache |

## Resultado Esperado

Después de aplicar estos cambios:
- Las profesiones nuevas aparecerán inmediatamente
- No habrá inconsistencias de cache
- El perfil mostrará siempre las profesiones actualizadas
