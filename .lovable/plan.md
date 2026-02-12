

# Plan: Completar Sistema de Notificaciones PWA

## Resumen

Solo 3 cambios puntuales son necesarios. El resto del sistema ya esta funcionando correctamente.

---

## 1. Vibracion [200, 100, 200] para mensajes de chat

**Archivo:** `src/utils/notificationSound.ts`

Cambiar el patron de vibracion `'short'` (100ms) por un nuevo patron `'chat_message'` con el patron exacto `[200, 100, 200]` para mensajes de chat.

Agregar un nuevo patron en la funcion `triggerVibration`:
```
case 'chat_message':
  vibrationMs = [200, 100, 200];
```

**Archivo:** `src/components/RealtimeNotifications.tsx`

Cambiar la vibracion del listener de mensajes de `'short'` a `'chat_message'`.

**Archivo:** `src/contexts/NotificationContext.tsx`

Actualizar el mapping de sonido para mensajes para usar el patron `'chat_message'` en lugar de `'short'`.

---

## 2. Badge en icono de la PWA (navigator.setAppBadge)

**Archivo:** `src/contexts/NotificationContext.tsx`

Cada vez que `unreadCount` cambie, llamar a `navigator.setAppBadge(count)` si la API esta disponible. Cuando sea 0, llamar a `navigator.clearAppBadge()`.

Agregar un `useEffect` que observe `unreadCount`:
```
useEffect(() => {
  if ('setAppBadge' in navigator) {
    if (unreadCount > 0) {
      navigator.setAppBadge(unreadCount);
    } else {
      navigator.clearAppBadge();
    }
  }
}, [unreadCount]);
```

Esto muestra el numero rojo sobre el icono de la app en Android (Chrome PWA) y iOS (Safari 16.4+ PWA).

---

## 3. Fallback de WhatsApp tras 5 minutos sin respuesta

**Archivo:** `src/components/chat/WhatsAppChatView.tsx`

Agregar logica que detecte si el ultimo mensaje fue enviado por el usuario actual hace mas de 5 minutos y el profesional no ha respondido. En ese caso, mostrar un banner con boton "Reenviar por WhatsApp".

Logica:
- Verificar que los mensajes existan y el ultimo sea del usuario actual
- Calcular si pasaron mas de 5 minutos desde ese mensaje
- Usar un `setInterval` cada 30 segundos para actualizar el estado
- Si se cumple la condicion, mostrar un banner encima del input con:
  - Texto: "Sin respuesta aun..."
  - Boton verde: "Reenviar por WhatsApp"
  - El boton abre `wa.me/{phone}` con el mensaje original como texto

Solo se muestra si el profesional tiene telefono registrado (`professional?.phone`).

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/utils/notificationSound.ts` | Agregar patron de vibracion `'chat_message'` con [200, 100, 200] |
| `src/components/RealtimeNotifications.tsx` | Usar patron `'chat_message'` para mensajes |
| `src/contexts/NotificationContext.tsx` | Usar `'chat_message'` para mensajes + agregar `setAppBadge` |
| `src/components/chat/WhatsAppChatView.tsx` | Banner de fallback WhatsApp tras 5 min sin respuesta |

## Notas

- No se requieren migraciones de base de datos
- No se requieren cambios en el Service Worker (ya usa [200, 100, 200])
- `navigator.setAppBadge` es una API progresiva: si el navegador no la soporta, simplemente no hace nada

