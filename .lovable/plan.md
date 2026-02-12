

# Plan: Fix de Identidad en Mensajeria y Rebranding Pendiente

## Problema Principal

Hay **dos componentes de chat separados** que muestran conversaciones:

1. **`Messages.tsx`** (pagina `/mensajes`) - usa `WhatsAppChatList` y `WhatsAppChatView`
2. **`MessagesDesktopLayout.tsx`** (dashboard profesional) - usa layout propio

El fix anterior corrigio `MessagesDesktopLayout.tsx` pero **no toco** `Messages.tsx` ni `WhatsAppChatView.tsx`, que son los componentes que el usuario ve en la pagina principal de mensajes. Ambos siempre muestran `professional.full_name` sin importar el rol del usuario logueado.

---

## Cambios a Realizar

### 1. `src/pages/Messages.tsx` - Detectar rol y pasar `isProfessional`

**Problema**: No detecta si el usuario logueado es profesional. Siempre muestra nombre del profesional.

**Solucion**:
- Agregar deteccion de rol profesional consultando la tabla `professionals` por `user_id`
- Pasar `isProfessional` a `WhatsAppChatList` y `WhatsAppChatView`
- Actualizar el filtro de busqueda para incluir `profiles.full_name` cuando es profesional

### 2. `src/components/chat/WhatsAppChatView.tsx` - Header dinamico segun rol

**Problema**: Lineas 69-72 siempre usan `conversation.professionals` para nombre y avatar, sin importar quien esta viendo.

**Solucion**:
- Agregar prop `isProfessional`
- Cuando `isProfessional=true`, mostrar `conversation.profiles.full_name` (nombre del cliente) y `profiles.avatar_url`
- Fallback: "Cliente de [profesion]" si no tiene nombre

### 3. `src/components/chat/WhatsAppChatList.tsx` - Identidad correcta en lista

**Problema**: Lineas 103-109 ya tienen logica para `isProfessional` pero depende de que la prop se pase correctamente desde `Messages.tsx` (actualmente no se pasa).

**Solucion**:
- Verificar que `Messages.tsx` pase `isProfessional={true}` cuando corresponda
- El componente ya tiene la logica interna correcta, solo falta la prop

### 4. Avatar con color determinista por nombre

**Problema**: Todos los avatars fallback usan el mismo color `bg-primary/10`.

**Solucion**:
- Crear funcion `getAvatarColor(name)` que genere un color determinista basado en el hash del nombre
- Paleta de 8-10 colores predefinidos (azul, verde, rojo, naranja, etc.)
- Aplicar en `WhatsAppChatList`, `WhatsAppChatView` y `MessagesDesktopLayout`

### 5. `src/pages/Register.tsx` - Rebranding pendiente

**Problema**: Los terminos y condiciones en el modal de registro todavia dicen "CHEQUEALO.AR" (25 ocurrencias).

**Solucion**:
- Reemplazar todas las menciones de "CHEQUEALO.AR" por "CHEQUEALO.NET" en el texto legal del modal

---

## Detalle Tecnico

### Deteccion de rol en Messages.tsx

```typescript
const [isProfessional, setIsProfessional] = useState(false);

useEffect(() => {
  if (!user?.id) return;
  supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
    .then(({ data }) => setIsProfessional(!!data));
}, [user?.id]);
```

### Funcion de color determinista para avatars

```typescript
const avatarColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  'bg-red-500', 'bg-indigo-500', 'bg-amber-500', 'bg-cyan-500'
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};
```

### WhatsAppChatView - Logica de identidad

```typescript
// Nuevo: recibir isProfessional como prop
const clientProfile = conversation?.profiles;
const name = isProfessional
  ? (clientProfile?.full_name || `Cliente de ${professional?.profession || 'consulta'}`)
  : (professional?.full_name || 'Usuario');
const avatar = isProfessional
  ? clientProfile?.avatar_url
  : professional?.image_url;
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Messages.tsx` | Detectar rol, pasar isProfessional, fix filtro busqueda |
| `src/components/chat/WhatsAppChatView.tsx` | Header dinamico con isProfessional |
| `src/components/chat/WhatsAppChatList.tsx` | Avatars con color determinista |
| `src/components/chat/MessagesDesktopLayout.tsx` | Avatars con color determinista |
| `src/pages/Register.tsx` | Rebranding CHEQUEALO.AR a CHEQUEALO.NET |

