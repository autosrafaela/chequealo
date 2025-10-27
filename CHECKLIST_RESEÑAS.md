# Checklist del Sistema de Reseñas

## ✅ Funcionalidades Implementadas

### 1. Click en Solicitudes de Contacto para Abrir Chat
- ✅ Las cards de solicitudes de contacto son clickeables
- ✅ Al hacer click, se abre el chat flotante con la conversación correspondiente
- ✅ Se crea automáticamente la conversación si no existe
- ✅ Tooltip muestra "Click para abrir el chat"

### 2. Confirmación de Transacciones Completadas
- ✅ Sistema bidireccional donde usuario y profesional deben confirmar
- ✅ Cuando ambos confirman, la transacción se marca como `completed`
- ✅ Se registran timestamps: `user_confirmed_at`, `professional_confirmed_at`, `both_confirmed_at`
- ✅ Se crean notificaciones para ambas partes cuando se completa

### 3. Sistema de Reseñas
- ✅ **Usuarios pueden reseñar profesionales**: tabla `reviews`
- ✅ **Profesionales pueden calificar clientes**: tabla `user_ratings`
- ✅ Ratings por categorías (comunicación, puntualidad, pago, general)
- ✅ Comentarios opcionales
- ✅ Verificación de transacción real

### 4. Notificaciones de Reseñas
- ✅ Notificación inmediata cuando ambos confirman completitud (líneas 167-184 de useTransactionConfirmation.ts)
- ✅ Primera notificación a las 24 horas de completar el trabajo
- ✅ Recordatorios cada 72 horas si no han reseñado
- ✅ Los recordatorios se detienen una vez que se deja la reseña

## 📋 Cómo Funciona el Sistema Completo

### Flujo de Trabajo:

1. **Inicio del Trabajo**
   - Usuario contacta profesional
   - Se crea una `contact_request`
   - Profesional crea una `transaction` con status `pending`

2. **Trabajo en Progreso**
   - Profesional marca trabajo como `in_progress`
   - Profesional puede solicitar confirmación de completitud

3. **Confirmación de Completitud** (🔧 Hook: `useTransactionConfirmation.ts`)
   - Usuario confirma: `user_confirmed_completion = true`
   - Profesional confirma: `professional_confirmed_completion = true`
   - Cuando ambos confirman:
     - Status → `completed`
     - Se registra `completed_at` y `both_confirmed_at`
     - **Se envían notificaciones a ambos para reseñar**

4. **Sistema de Recordatorios** (⚡ Edge Function: `send-review-reminders`)
   
   **Primera Notificación (24 horas):**
   - Se ejecuta automáticamente cada hora
   - Busca transacciones completadas hace 24-25 horas
   - Verifica si falta reseña de usuario o profesional
   - Envía notificación con título: "¡Deja tu reseña!" / "¡Evalúa al cliente!"

   **Recordatorios (cada 72 horas):**
   - Si no han reseñado, se envía recordatorio cada 72 horas
   - Título: "Recordatorio: Deja tu reseña" / "Recordatorio: Evalúa al cliente"
   - Se detiene cuando se deja la reseña

5. **Creación de Reseñas**
   - **Usuario → Profesional**: tabla `reviews` (componente: `UserTransactionReviews.tsx`)
   - **Profesional → Usuario**: tabla `user_ratings` (componente: `UserRatingModal.tsx`)

## 🔧 Edge Function de Recordatorios

**Archivo**: `supabase/functions/send-review-reminders/index.ts`

### Configuración:
- Debe ejecutarse cada 1-2 horas vía cron job
- Query busca transacciones con `status = 'completed'` y `completed_at IS NOT NULL`

### Lógica:
```typescript
- Calcula horas desde completitud
- Si >= 24 horas:
  - Verifica si existe reseña
  - Verifica última notificación enviada
  - Si no hay reseña Y (no hay notificación O han pasado 72hs):
    → Envía recordatorio
```

### Para Configurar el Cron:
```sql
select cron.schedule(
  'send-review-reminders',
  '0 */2 * * *', -- cada 2 horas
  $$
  select net.http_post(
    url:='https://rolitmcxydholgsxpvwa.supabase.co/functions/v1/send-review-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb
  ) as request_id;
  $$
);
```

## 📊 Tablas Involucradas

### `transactions`
- `status`: pending → in_progress → completed
- `user_confirmed_completion`: boolean
- `professional_confirmed_completion`: boolean
- `completed_at`: timestamp
- `both_confirmed_at`: timestamp
- `confirmation_requested_at`: timestamp

### `reviews` (Usuario → Profesional)
- `user_id`, `professional_id`, `transaction_id`
- `rating`: 1-5
- `comment`: texto opcional
- `service_provided`: tipo de servicio
- `is_transaction_verified`: verificación

### `user_ratings` (Profesional → Usuario)
- `professional_id`, `user_id`, `transaction_id`
- `communication_rating`, `punctuality_rating`, `payment_rating`, `overall_rating`: 1-5
- `comment`: texto opcional

### `notifications`
- `user_id`: destinatario
- `title`: título del recordatorio
- `message`: mensaje personalizado
- `type`: 'info'
- `action_url`: link a la sección de reseñas
- `created_at`: para calcular recordatorios

## 🧪 Testing Manual

### Probar el Flujo Completo:

1. **Crear Transacción**
   ```sql
   INSERT INTO transactions (user_id, professional_id, service_type, status, started_at)
   VALUES ('user_uuid', 'prof_uuid', 'Test Service', 'in_progress', NOW());
   ```

2. **Simular Completitud** (ambos confirman)
   ```sql
   UPDATE transactions 
   SET 
     user_confirmed_completion = true,
     professional_confirmed_completion = true,
     status = 'completed',
     completed_at = NOW() - INTERVAL '25 hours', -- hace 25 horas
     both_confirmed_at = NOW() - INTERVAL '25 hours'
   WHERE id = 'transaction_uuid';
   ```

3. **Ejecutar Edge Function Manualmente**
   - Ir a Supabase Dashboard → Edge Functions
   - Ejecutar `send-review-reminders`
   - Verificar logs y notificaciones creadas

4. **Verificar Notificaciones**
   ```sql
   SELECT * FROM notifications 
   WHERE user_id IN ('user_uuid', 'prof_user_uuid')
   ORDER BY created_at DESC;
   ```

5. **Crear Reseña (detiene recordatorios)**
   ```sql
   -- Usuario reseña profesional
   INSERT INTO reviews (user_id, professional_id, transaction_id, rating, comment)
   VALUES ('user_uuid', 'prof_uuid', 'transaction_uuid', 5, 'Excelente trabajo');
   
   -- Profesional reseña usuario
   INSERT INTO user_ratings (professional_id, user_id, transaction_id, 
     communication_rating, punctuality_rating, payment_rating, overall_rating)
   VALUES ('prof_uuid', 'user_uuid', 'transaction_uuid', 5, 5, 5, 5);
   ```

6. **Verificar que NO se envíen más recordatorios**
   - Ejecutar nuevamente la edge function
   - No deberían crearse nuevas notificaciones para ese transaction_id

## 🐛 Debugging

### Si no se envían recordatorios:

1. **Verificar que el cron está activo**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-review-reminders';
   ```

2. **Ver logs de la función**
   - Supabase Dashboard → Edge Functions → send-review-reminders → Logs

3. **Verificar transacciones elegibles**
   ```sql
   SELECT id, completed_at, 
     EXTRACT(EPOCH FROM (NOW() - completed_at))/3600 as hours_since_completed
   FROM transactions
   WHERE status = 'completed' 
     AND completed_at IS NOT NULL;
   ```

4. **Ver últimas notificaciones**
   ```sql
   SELECT n.*, u.email 
   FROM notifications n
   JOIN auth.users u ON n.user_id = u.id
   WHERE n.title ILIKE '%recordatorio%'
   ORDER BY n.created_at DESC
   LIMIT 20;
   ```

## ✨ Mejoras Futuras

- [ ] Panel de administración para ver estadísticas de reseñas
- [ ] Email de recordatorio además de notificación in-app
- [ ] Push notifications para recordatorios móviles
- [ ] Sistema de "reseña destacada" para mejores comentarios
- [ ] Análisis de sentimiento automático en comentarios
- [ ] Límite máximo de recordatorios (ej: max 5 recordatorios)
