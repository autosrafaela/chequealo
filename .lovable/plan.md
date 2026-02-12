
# Plan: Ajustes Finales de Comunicacion en el Dashboard Profesional

## Resumen

Cuatro cambios principales: eliminar secciones redundantes del dashboard, mostrar nombres reales y avatares de clientes en el chat, agregar indicadores de lectura claros, y mejorar el layout de mensajes.

---

## 1. Eliminar "Consultas Recientes" y boton "Mensajes" del Dashboard

**Archivo:** `src/components/dashboard/ActiveUserDashboard.tsx`

- Eliminar ZONA 3 completa ("Consultas Recientes", lineas 171-225): el bloque con la lista de las ultimas 3 solicitudes y el boton "Ver todas las consultas"
- Eliminar el boton "Mensajes" de ZONA 4 (lineas 247-260): queda un grid de solo 2 botones ("Ver mi Perfil" y "Mis Servicios") con `grid-cols-2`
- Eliminar el import de `useQuery` y `formatDistanceToNow` ya que solo se usaban para Consultas Recientes
- Eliminar los imports de iconos no usados: `Clock`, `User`, `ChevronRight`, `Bell`
- Eliminar la query `recentRequests` (lineas 66-80)
- Eliminar el bloque de DashboardHero "URGENTE" (ZONA 1, lineas 96-115) ya que depende de pendingRequests que ahora se gestiona solo desde la tab Mensajes

## 2. Mostrar Nombres Reales y Avatares de Clientes (Humanizacion)

**Archivo:** `src/hooks/useChat.ts`

Modificar la query `fetchConversations` (linea 87) para incluir tambien los datos del perfil del usuario (cliente):
```
conversations: select `*, professionals!professional_id(...), profiles!user_id(full_name, avatar_url)`
```

Esto agrega una relacion `profiles` a cada conversacion con el nombre y avatar del cliente.

Modificar la interface `Conversation` dentro de useChat.ts para incluir:
```
profiles?: {
  full_name: string;
  avatar_url?: string;
};
```

Hacer lo mismo en `getConversationWithRelations` (linea 554-561).

**Archivo:** `src/types/chat.ts`

Agregar el campo `profiles` a la interface `Conversation`:
```
profiles?: {
  full_name: string;
  avatar_url?: string;
};
```

**Archivo:** `src/components/chat/MessagesDesktopLayout.tsx`

En la seccion de ConversationList (lineas 286-350), cuando `isProfessional` es true:
- Usar `conversation.profiles?.full_name` en lugar del texto fijo 'Usuario'
- Si no tiene nombre, usar fallback: `'Cliente de ' + (profession || 'consulta')`
- Usar `conversation.profiles?.avatar_url` como imagen del avatar

**Archivo:** `src/components/chat/WhatsAppChatList.tsx`

Agregar prop `isProfessional` al componente. Cuando es true:
- Mostrar el nombre del cliente desde `conv.profiles?.full_name`
- Fallback: `'Cliente de ' + (professional?.profession || 'consulta')`
- Mostrar avatar del cliente desde `conv.profiles?.avatar_url`

Cuando es false (vista de usuario normal), mantener el comportamiento actual mostrando datos del profesional.

## 3. Indicador Visual de Mensajes No Leidos para el Profesional

**Archivo:** `src/components/chat/MessagesDesktopLayout.tsx`

Ya existe un punto azul para unread (linea 346). Mejorar:
- Agregar negrita al nombre cuando hay mensajes sin leer (ya se hace para el preview en linea 337-340)
- Asegurar que `unread_count_professional` se use correctamente cuando `isProfessional=true` (ya esta en linea 295-297)

**Archivo:** `src/components/chat/WhatsAppChatList.tsx`

Agregar prop para determinar que campo de unread usar. Para profesionales, usar `unread_count_professional`. Agregar un punto azul junto al avatar cuando hay mensajes sin leer, similar al estilo de Instagram/WhatsApp.

## 4. Layout Limpio - Mensajes como Seccion Destacada

**Archivo:** `src/pages/ProfessionalDashboard.tsx`

En el TabsContent de "messages" (lineas 872-908):
- Cambiar la altura del MessagesDesktopLayout de `h-[calc(100vh-300px)]` a `h-[calc(100vh-200px)]` para dar mas espacio vertical
- Simplificar la seccion de confirmaciones pendientes para que no ocupe tanto espacio visual sobre el chat

**Archivo:** `src/components/chat/MessagesDesktopLayout.tsx`

Actualizar la altura minima del contenedor principal (linea 436) para que ocupe mas espacio:
```
h-[calc(100vh-200px)] min-h-[600px]
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/ActiveUserDashboard.tsx` | Eliminar Consultas Recientes, boton Mensajes, y bloque URGENTE |
| `src/hooks/useChat.ts` | Incluir `profiles!user_id(full_name, avatar_url)` en queries |
| `src/types/chat.ts` | Agregar campo `profiles` a interface Conversation |
| `src/components/chat/MessagesDesktopLayout.tsx` | Mostrar nombre/avatar real del cliente, mejorar layout |
| `src/components/chat/WhatsAppChatList.tsx` | Soporte para mostrar nombre/avatar de clientes, punto azul de no leido |
| `src/pages/ProfessionalDashboard.tsx` | Ajustar altura de seccion mensajes |

## Notas

- No se requieren migraciones de base de datos: la tabla `profiles` ya tiene los campos `full_name` y `avatar_url`
- La relacion `profiles!user_id` funciona porque `conversations.user_id` referencia al mismo `user_id` que `profiles.user_id`
- El fallback "Cliente de [Rubro]" asegura que nunca se muestre "Usuario" generico
