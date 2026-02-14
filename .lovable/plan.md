
# Plan: Hacer los servicios expandibles en el perfil publico

## Problema

En la seccion de Servicios del perfil profesional (`ProfessionalProfile.tsx`), tanto el nombre como la descripcion del servicio usan la clase `truncate`, lo que corta el texto con "..." sin posibilidad de leer el contenido completo.

## Solucion

Convertir cada servicio en un componente expandible: al hacer click se muestra la descripcion completa. Cambios minimos y directos.

## Cambios

### Archivo: `src/pages/ProfessionalProfile.tsx` (lineas 437-470)

1. Quitar `truncate` de la descripcion del servicio (linea 445) y reemplazarlo por un estado expandible
2. Mantener `truncate` en el nombre del servicio (siempre una linea)
3. Hacer la fila clickeable: al tocar, se expande/colapsa la descripcion
4. Cambiar la descripcion de `truncate` a `line-clamp-2` cuando esta colapsada, y sin limite cuando esta expandida
5. Agregar un indicador visual sutil (chevron o texto "ver mas") para que el usuario sepa que puede tocar

**Implementacion tecnica:**
- Agregar un estado `expandedServiceId` (string o null) al componente
- Al hacer click en un servicio, si tiene descripcion larga, se expande
- La descripcion pasa de `truncate` a mostrar el texto completo
- Agregar `cursor-pointer` a la fila cuando hay descripcion

```tsx
// Estado nuevo:
const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

// Cada servicio:
<div 
  key={service.id} 
  className="py-3 border-b border-border/30 last:border-b-0 cursor-pointer"
  onClick={() => service.description && setExpandedServiceId(
    expandedServiceId === service.id ? null : service.id
  )}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="p-2 bg-primary/10 rounded-full shrink-0">
        <Briefcase className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{service.service_name}</p>
      </div>
    </div>
    <span className="text-primary font-bold text-sm whitespace-nowrap ml-3">
      {/* precio */}
    </span>
  </div>
  {service.description && (
    <p className={`text-xs text-muted-foreground mt-1 ml-11 ${
      expandedServiceId === service.id ? '' : 'line-clamp-2'
    }`}>
      {service.description}
      {expandedServiceId !== service.id && (
        <span className="text-primary ml-1 font-medium">ver mas</span>
      )}
    </p>
  )}
</div>
```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Agregar estado `expandedServiceId`, hacer servicios clickeables con descripcion expandible |

## Resultado

- El nombre del servicio sigue en una linea (truncado si es muy largo)
- La descripcion muestra 2 lineas con "ver mas" al tocar
- Al hacer click se expande y muestra todo el texto
- Un segundo click la colapsa
- El precio se mantiene siempre visible
