
# Plan: Rediseno de Comunicacion en el Dashboard Profesional

## Resumen

Fusionar la pestana "Solicitudes" con "Mensajes", transformar la seccion de mensajes en una interfaz de chat moderno a pantalla completa dentro del dashboard, y simplificar las acciones rapidas para destacar unicamente el boton de Mensajes con contador en tiempo real.

---

## Cambios Detallados

### 1. Fusionar Solicitudes en Mensajes (ProfessionalDashboard.tsx)

**Que cambia:**
- Eliminar el `TabsTrigger` de "Solicitudes" (value="requests") de la lista de tabs
- Eliminar el `TabsContent value="requests"` completo (lineas 629-659)
- En el `TabsContent value="messages"`, integrar las solicitudes pendientes (TransactionConfirmationCard, ReadyToRateTransactions, ContactRequestsPanel) como una seccion colapsable ARRIBA del chat
- Reducir las tabs de 9 a 8: Mensajes, Resenas, Servicios, Portfolio, Trabajos, Suscripcion, Mi Perfil, Config

**Logica de integracion:**
- Las solicitudes de contacto (ContactRequestsPanel) se muestran como un banner/acordeon dentro de la tab de Mensajes
- Cada solicitud pendiente incluye un boton "Responder" que abre el chat directamente
- Las confirmaciones pendientes (TransactionConfirmationCard) tambien se muestran arriba del chat

### 2. Interfaz de Chat Moderno a Pantalla Completa (MessagesDesktopLayout.tsx)

**Que cambia:**
- Cambiar la altura fija de `h-[600px]` a `h-[calc(100vh-300px)] min-h-[500px]` para ocupar mas pantalla
- En la columna izquierda (lista de chats):
  - Mantener foto circular (Avatar), nombre, ultimo mensaje y fecha (ya existe)
  - Mejorar el empty state del avatar con icono User en lugar de iniciales
- En la columna derecha (area de chat):
  - Mantener las burbujas existentes del MessageBubble (ya usa colores tematicos via CSS variables)
  - El color de burbujas se controla via `--chat-bubble-sent` y `--chat-bubble-received` en el tema

**Header del chat (ChatHeader + WhatsAppChatView):**
- Ya muestra nombre y profesion del contacto
- Agregar etiqueta contextual: "Interesado en: [profesion]" cuando el chat viene de un contact_request con service_type
- Para esto, al cargar la conversacion, buscar si tiene `contact_request_id` y mostrar el `service_type` del contact_request asociado

**Input de mensaje:**
- Ya existe con boton de enviar (Send icon) y adjuntar archivos (Paperclip)
- Sin cambios necesarios, la funcionalidad esta completa

### 3. Etiqueta "Interesado en" en el Header del Chat

**Archivo:** `src/components/chat/MessagesDesktopLayout.tsx`

En el ChatPanel, cuando se selecciona una conversacion que tiene `contact_request_id`, consultar el `service_type` del contact_request asociado y mostrarlo como badge debajo del nombre:

```text
Juan Perez
Interesado en: Lobbista
```

Esto requiere expandir la query de conversaciones para incluir el service_type del contact_request relacionado, o hacer una query adicional al seleccionar la conversacion.

Enfoque elegido: agregar el campo `service_type` a la relacion de conversacion, consultando `contact_requests(service_type, type)` en la query de fetchConversations del useChat hook.

### 4. Acciones Rapidas - Solo Mensajes con Contador (ActiveUserDashboard.tsx)

**Que cambia:**
- Reducir la grilla de 4 tiles a una sola accion prominente: "Mensajes"
- Mostrar un contador de notificaciones pendientes (unread messages + pending requests) en tiempo real
- El tile de Mensajes sera mas grande, ocupando el ancho completo
- Mantener los otros 3 tiles (Perfil Publico, Servicios, Galeria) pero como links secundarios mas pequenos debajo

**Implementacion del contador:**
- Usar `useNotification` context para obtener el unread count de mensajes
- Sumar `stats.pendingRequests` para las solicitudes pendientes
- Mostrar como badge rojo sobre el icono de Mensajes

### 5. Redireccion de "Ver solicitudes ahora" (ActiveUserDashboard.tsx)

**Que cambia:**
- El boton urgente "Ver solicitudes ahora" (ZONA 1) cambia de `onTabChange('requests')` a `onTabChange('messages')`
- Los links de "Consultas Recientes" tambien redirigen a `onTabChange('messages')` en lugar de `onTabChange('requests')`

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalDashboard.tsx` | Eliminar tab "Solicitudes", mover su contenido a tab "Mensajes", reordenar tabs |
| `src/components/chat/MessagesDesktopLayout.tsx` | Aumentar altura, agregar seccion de solicitudes pendientes arriba del chat, mostrar etiqueta "Interesado en" |
| `src/components/dashboard/ActiveUserDashboard.tsx` | Hacer "Mensajes" la accion principal con contador, cambiar redirects de 'requests' a 'messages' |
| `src/hooks/useChat.ts` | Expandir query de conversaciones para incluir `contact_requests(service_type)` |

## Notas Tecnicas

- No se requieren migraciones de base de datos
- La tabla `contact_requests` ya tiene el campo `service_type` que se usara para la etiqueta "Interesado en"
- La tabla `conversations` ya tiene `contact_request_id` como FK opcional
- El NotificationContext ya provee contadores de mensajes no leidos en tiempo real
