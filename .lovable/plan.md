
Contexto y diagnóstico (qué está pasando)
- El “bucle” de “Abriendo conversación…” ocurre porque en /mensajes el parámetro `?chat=` puede venir como:
  1) conversation.id (UUID de la tabla conversations) — es lo que hoy envía `ProfessionalProfile.tsx`
  2) professional.id o professional.user_id (UUID del profesional)
- El componente `src/pages/Messages.tsx` actualmente asume que si `chatParam` no está ya en `conversations[]`, entonces “no es un conversationId” y lo trata como `professionalId`, intentando crear una conversación con ese UUID.
- Como en la BD `conversations.professional_id` tiene FK a `professionals(id)` (y/o validaciones), cuando `chatParam` es un conversationId termina intentando insertar `professional_id = <conversationId>`, lo que falla y dispara “Error al crear conversación”.
- Además, el `useEffect` que procesa el chat depende de `handleChatParam`, y `handleChatParam` depende de estados que cambian (`isCreatingChat`, `conversations`). Eso re-dispara el efecto y provoca reintentos infinitos → spinner + toasts repetidos.

Objetivo del fix
- Abrir chats de forma determinística y sin loops:
  - Si `chatParam` es un conversationId existente → abrir esa conversación.
  - Si `chatParam` es un professionalId / professional user_id → buscar conversación existente o crearla.
  - Si el parámetro es inválido → mostrar error con botón “Reintentar” y no auto-reintentar en bucle.

Cambios propuestos (sin tocar BD; NO se dropean tablas)
1) Corregir el flujo de apertura en `src/pages/Messages.tsx`
   1.1. Cambiar la estrategia del effect para que NO se re-ejecute por cambios de `conversations`/`isCreatingChat`
   - Derivar `chatParam` como string estable (ej. `const chatParam = searchParams.get('chat')`) y hacer que el `useEffect` dependa de:
     - `chatParam`, `user?.id`, `loading`
   - Eliminar el patrón actual “useEffect depende de handleChatParam” que está disparando el loop.

   1.2. Agregar un “guard” anti-bucle
   - Crear `useRef<string | null>` (por ejemplo `lastProcessedChatRef`) para registrar el último `chatParam` procesado automáticamente.
   - Si el mismo `chatParam` ya fue intentado y falló, no reintentar automáticamente (solo con botón “Reintentar”).

   1.3. Resolver el tipo de `chatParam` consultando la BD (en vez de inferir por `conversations[]`)
   - Paso A (prioridad 1): intentar tratarlo como conversationId real
     - Query: `conversations` por `id = chatParam` con `.maybeSingle()`
     - Si existe → `setSelectedConversationId(chatParam)` y opcionalmente `refreshConversations()` (en background).
   - Paso B (si no existe como conversation): tratarlo como “profesional”
     - Resolver `professionalId`:
       - Primero intentar `professionals` por `user_id = chatParam` (por si `chatParam` es un auth.user id).
       - Si no, validar si existe `professionals` por `id = chatParam`.
       - Si no existe profesional → setear error “No se encontró el profesional/chat” y terminar.
     - Buscar conversación existente con ese professionalId y `user.id`.
     - Si no existe → llamar `createConversation(professionalId)`.

   1.4. UI de error en lugar de loop
   - Agregar estado `chatOpenError` (string).
   - Si falla abrir/crear → mostrar una pantalla simple en el panel derecho con:
     - Mensaje de error (amigable)
     - Botón “Reintentar” que:
       - Limpia `chatOpenError`
       - Resetea `lastProcessedChatRef.current = null`
       - Vuelve a ejecutar la apertura (manual)

   1.5. Logging útil (para terminar de cerrar el problema)
   - Agregar `console.info/console.error` con:
     - chatParam recibido
     - si se detectó como conversationId (y su resultado)
     - professionalId resuelto
     - error de supabase (code/message) si falla
   - Esto permitirá ver exactamente el motivo si queda algún caso extremo.

2) Ajuste preventivo en `src/pages/ProfessionalProfile.tsx` (reduce casos de carrera)
   - Cambiar el redirect a Mensajes para pasar el professionalId, no el conversationId:
     - En vez de: `/mensajes?chat=${conversation.id}`
     - Usar: `/mensajes?chat=${id}`
   - Opcional (recomendado): simplificar el botón “Mensaje” para que NO cree la conversación ahí:
     - Solo navega a Mensajes con el professionalId, y Mensajes hace “find-or-create”.
   - Beneficios:
     - Evita que Mensajes tenga que “confiar” en que el conversationId ya está en el listado.
     - Reduce timing/race conditions.

3) Hardening opcional (si queremos blindar aún más)
   - En `useChat.createConversation`, agregar validación previa del professionalId:
     - `professionals` por `id = professionalId` antes de insertar.
     - Si no existe, mostrar error claro y no intentar insert (evita FK violation).
   - Mejorar el toast de error para incluir un motivo más útil (sin exponer datos sensibles), por ejemplo:
     - “No pudimos abrir el chat. Probá nuevamente.” + log detallado a consola.

Archivos a tocar
- src/pages/Messages.tsx
  - Rework del effect y resolver chatParam correctamente (conversationId vs professionalId)
  - Guard anti-loop + UI de error + retry
  - Logs
- src/pages/ProfessionalProfile.tsx
  - Cambiar navegación a `/mensajes?chat=${id}` (professional id) y opcionalmente remover `createConversation` previo al navigate
- (Opcional) src/hooks/useChat.ts
  - Validación de professionalId antes del insert o mejora de logs/toasts

Criterios de aceptación / pruebas manuales
- Caso 1: Desde un perfil profesional, click “Mensaje”
  - Debe abrir el chat sin spinner infinito y sin toasts repetidos.
- Caso 2: Abrir /mensajes?chat=<conversationId> directo (pegando URL)
  - Debe abrir la conversación (aunque la lista todavía no haya cargado).
- Caso 3: Abrir /mensajes?chat=<professionalId>
  - Debe abrir o crear conversación correctamente.
- Caso 4: Parámetro inválido
  - Debe mostrar error y botón Reintentar (sin reintentos automáticos).

Riesgos y mitigaciones
- Posible colisión UUID (que un professionalId coincida con un conversationId existente): extremadamente improbable; aceptable.
- Latencia extra: se suma 1 query rápida a `conversations` para detectar si es conversationId; es un trade-off correcto para eliminar loops y falsos inserts.
