

# Plan: Correccion de Errores Criticos en el Sistema de Mensajeria

## Diagnostico

Se identificaron 3 causas raiz que generan los 5 problemas reportados:

### Causa 1: Componentes definidos dentro del render (afecta problemas 3 y 5)
`ConversationList` y `ChatPanel` estan definidos como funciones dentro del componente `MessagesDesktopLayout`. Cada vez que cambia cualquier estado (incluyendo cada tecla presionada en el input), React los trata como componentes nuevos y los **remonta desde cero**, destruyendo el foco del input y cualquier estado temporal.

### Causa 2: Header siempre muestra datos del profesional (afecta problemas 1 y 4)
`ChatHeader` y `getConversationWithRelations` solo obtienen y muestran `professionals.full_name`. Cuando un profesional ve sus chats, deberia mostrar el nombre del **cliente**, no su propio nombre.

### Causa 3: Busqueda solo filtra por nombre del profesional (afecta problema 1)
El filtro de busqueda en la lista solo compara contra `professionals.full_name`, ignorando el nombre del cliente.

---

## Cambios

### 1. `src/components/chat/MessagesDesktopLayout.tsx` - Eliminar componentes internos

**Problema critico**: `ConversationList` y `ChatPanel` son funciones definidas dentro del render. Esto causa remontaje en cada keystroke.

**Solucion**: Convertir el JSX de `ConversationList` y `ChatPanel` en JSX inline directamente en el return del componente principal. Esto elimina la recreacion de componentes y mantiene el foco del input estable.

Cambios especificos:
- Reemplazar `<ConversationList />` y `<ChatPanel />` por su JSX directo
- Eliminar las funciones `ConversationList` y `ChatPanel`
- Corregir el filtro de busqueda para incluir `profiles?.full_name` del cliente cuando `isProfessional=true`

### 2. `src/components/chat/ChatHeader.tsx` - Header dinamico segun rol

**Problema**: Siempre muestra `professional.full_name` independientemente de quien esta viendo el chat.

**Solucion**: Agregar props `isProfessional` y `profiles` (datos del cliente). Cuando `isProfessional=true`, mostrar el nombre y avatar del cliente en lugar del profesional.

Cambios:
- Agregar `isProfessional?: boolean` y `profiles?: { full_name: string; avatar_url?: string }` a la interfaz
- Usar logica condicional para decidir que nombre/avatar mostrar
- Fallback: "Cliente de [profesion]" si el cliente no tiene nombre

### 3. `src/hooks/useChat.ts` - Enriquecer `getConversationWithRelations`

**Problema**: La funcion `getConversationWithRelations` (linea 577-584) no obtiene los datos del perfil del cliente, por lo que el header no tiene acceso al nombre real.

**Solucion**: Agregar una consulta adicional a `profiles` para obtener `full_name` y `avatar_url` del `user_id` de la conversacion, similar a como se hace en `fetchConversations`.

### 4. `src/components/chat/MessagesDesktopLayout.tsx` - Pasar isProfessional al ChatHeader

Pasar la prop `isProfessional` y los datos del perfil del cliente al `ChatHeader` para que pueda mostrar el nombre correcto.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/chat/MessagesDesktopLayout.tsx` | Inlinear JSX, pasar isProfessional a ChatHeader |
| `src/components/chat/ChatHeader.tsx` | Soporte para mostrar nombre del cliente |
| `src/hooks/useChat.ts` | Enriquecer getConversationWithRelations con datos del cliente |

## Resultado esperado

- El input de chat mantiene el foco al escribir
- El header muestra el nombre correcto segun el rol
- La lista muestra nombres de clientes reales para profesionales
- Los mensajes se envian y aparecen al instante
- El campo de texto se limpia correctamente tras enviar

