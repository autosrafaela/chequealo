

# Plan: Ajustes Finales de Usabilidad y Configuracion

## Resumen

Cuatro cambios puntuales: eliminar tab Solicitudes del user dashboard, verificar que el switch de notificaciones push funcione en Configuracion, confirmar identidad en mensajeria del profesional, y limpiar redirects muertos.

---

## Cambios a Realizar

### 1. Eliminar Pestana "Solicitudes" del User Dashboard

**Archivo**: `src/pages/UserDashboard.tsx`

- Reducir grid de tabs de `grid-cols-6` a `grid-cols-5`
- Eliminar el `TabsTrigger value="requests"` (lineas 721-724)
- Eliminar todo el `TabsContent value="requests"` (lineas 868-962)
- Eliminar imports y estados relacionados: `contactRequests`, `getStatusBadge`, fetch de contact_requests en `fetchUserData`
- Eliminar imports no usados: `Phone`, `Mail`, `ExternalLink`, `format`, `es` (si ya no se usan en otro lugar)

Los usuarios accederan a su historial de conversaciones directamente desde la pestana "Mensajes".

### 2. Push Notifications en Configuracion (ya funcional)

**Archivo**: `src/pages/UserDashboard.tsx`

El componente `PushNotificationToggle` ya esta renderizado en la pestana de Configuracion (linea 1084). Este componente usa `usePushNotifications` que ya:
- Solicita permisos del navegador (`Notification.requestPermission()`)
- Se suscribe via VAPID / Service Worker
- Guarda la suscripcion en `push_subscriptions`

**Verificacion**: El switch ya esta funcional. No se requieren cambios de codigo, solo confirmar que funciona correctamente en el preview.

### 3. Identidad en Mensajeria del Profesional (ya implementada)

En el ultimo cambio se implemento la logica de `myProfessionalId` en:
- `useChat.ts` - expone `myProfessionalId`
- `MessagesDesktopLayout.tsx` - pasa `myProfessionalId` a los sub-componentes
- `WhatsAppChatList.tsx` y `WhatsAppChatView.tsx` - usan `amProfessionalHere` per-conversation

**Verificacion**: Ya deberia mostrar el nombre del cliente en el panel del profesional. Confirmar visualmente.

### 4. Limpiar Redirects de "Solicitud Enviada"

**Archivo**: `src/components/ContactRequestDialog.tsx`

El redirect actual despues del exito es:
```
navigate(`/user-dashboard?tab=messages&conversation=${conversationId}`)
```

Esto ya apunta correctamente a Mensajes (no a Solicitudes). Como eliminamos el tab Solicitudes, si algun usuario tenia un bookmark a `?tab=requests`, simplemente caera en el tab por defecto ("home"). No se necesita cambio adicional.

**Archivo**: `src/components/ContactRequestsPanel.tsx`

Revisar si este componente se usa en algun lugar del user dashboard. Dado que eliminamos el tab requests, cualquier referencia interna que redirija a `tab=requests` debe apuntar a `tab=messages`.

---

## Detalle Tecnico

### Tabs finales del User Dashboard (5 tabs)

| Tab | Valor | Icono |
|-----|-------|-------|
| Inicio | home | Search |
| Mensajes | messages | MessageSquare |
| Resenas | reviews | Star |
| App Movil | mobile | Smartphone |
| Configuracion | settings | Settings |

### Codigo a eliminar en UserDashboard.tsx

1. **Interface `ContactRequest`** (lineas 65-81) - ya no se usa
2. **Estado `contactRequests`** (linea 96) - ya no se usa
3. **Fetch de contact_requests** en `fetchUserData` (lineas 266-300) - eliminar bloque completo
4. **Funcion `getStatusBadge`** - buscar y eliminar si existe
5. **TabsTrigger y TabsContent de "requests"** - eliminar ambos bloques

### Grid de tabs

```tsx
// Antes: grid-cols-6
// Despues: grid-cols-5
<TabsList className="grid w-full grid-cols-5">
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/UserDashboard.tsx` | Eliminar tab Solicitudes, reducir grid a 5 cols, limpiar codigo muerto |

## Sin cambios necesarios

| Archivo | Razon |
|---------|-------|
| `PushNotificationToggle.tsx` | Ya funciona correctamente en Configuracion |
| `MessagesDesktopLayout.tsx` | Identidad ya corregida con myProfessionalId |
| `ContactRequestDialog.tsx` | Redirect ya apunta a messages, no a requests |

