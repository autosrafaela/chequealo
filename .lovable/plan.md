
# Plan: Corregir carga de conversaciones para usuarios profesionales

## Problema Identificado

Cuando un usuario que **también es profesional** quiere chatear con **otro profesional** como cliente:

1. Se crea correctamente la conversación con:
   - `professional_id` = ID del profesional objetivo (el que ofrece servicio)
   - `user_id` = ID del usuario actual (aunque sea profesional, actúa como cliente)

2. Pero `fetchConversations()` en `useChat.ts` tiene esta lógica defectuosa:
   ```typescript
   if (professional) {
     query = query.eq('professional_id', professional.id);  // ← SOLO busca donde ÉL es el profesional
   } else {
     query = query.eq('user_id', user?.id);
   }
   ```

3. Como el usuario actual ES profesional, el sistema solo busca conversaciones donde `professional_id = su ID`, ignorando las conversaciones donde actúa como cliente (`user_id`).

**Resultado:** La conversación existe en la BD pero no aparece en la lista → no se puede abrir.

## Solución

Modificar la query en `fetchConversations()` para que usuarios profesionales vean **ambos tipos** de conversaciones:
- Donde son el `professional_id` (reciben consultas de clientes)
- Donde son el `user_id` (consultan a otros profesionales)

## Cambios Necesarios

### Archivo: `src/hooks/useChat.ts`

**Función `fetchConversations()` (líneas ~75-110)**

Cambiar la lógica de:
```typescript
if (professional) {
  query = query.eq('professional_id', professional.id);
} else {
  query = query.eq('user_id', user?.id);
}
```

A:
```typescript
if (professional) {
  // Profesional puede tener conversaciones en ambos roles:
  // - Como profesional que recibe consultas (professional_id = su ID)
  // - Como usuario que consulta a otros profesionales (user_id = su auth ID)
  query = query.or(`professional_id.eq.${professional.id},user_id.eq.${user?.id}`);
} else {
  // Usuario normal solo tiene conversaciones como user_id
  query = query.eq('user_id', user?.id);
}
```

### Ajuste adicional en RLS (verificación)

Revisar que la política RLS de `conversations` para SELECT incluya ambos casos. Según el esquema actual:
```sql
USING ((user_id = auth.uid()) OR (professional_id IN (
  SELECT professionals.id FROM professionals WHERE professionals.user_id = auth.uid()
)))
```
Esta política **ya está correcta** - permite ver conversaciones donde eres el `user_id` O donde tu perfil profesional es el `professional_id`.

## Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useChat.ts` | Modificar query en `fetchConversations()` para usar `.or()` cuando el usuario es profesional |

## Resultado Esperado

Después del fix:
- Un profesional verá en su lista TODAS sus conversaciones:
  - Donde clientes le escriben a él (es el `professional_id`)
  - Donde él escribe a otros profesionales (es el `user_id`)
- La conversación `f6175d58-58b0-4a82-ace4-4c7667e10720` aparecerá en la lista y podrá abrirse correctamente
