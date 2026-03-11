

# Plan: Flujo completo de Recuperación de Contraseña

## Diagnóstico (Macanas encontradas)

**CRITICO para Pioneros**: El flujo de recovery está **roto**. Cuando un Pionero (o cualquier usuario) hace clic en "Recuperar Contraseña":

1. `resetPasswordForEmail()` envía el email con `redirectTo: /auth`
2. El usuario hace clic en el link del email
3. Supabase redirige a `/auth#access_token=...&type=recovery`
4. `Auth.tsx` (líneas 53-76) procesa el hash, llama `setSession()`, y **loguea al usuario automáticamente**
5. El `useEffect` de línea 86-92 detecta `user` y lo manda al dashboard
6. **Nunca se muestra un formulario para cambiar la contraseña**

El Pionero queda logueado con la contraseña UUID random que ni conoce. Si cierra sesión, queda afuera de vuelta. Bucle infinito de recovery sin recovery real.

## Solución

### 1. Crear `src/pages/ActualizarPassword.tsx`
Página dedicada que:
- Escucha `onAuthStateChange` para el evento `PASSWORD_RECOVERY`
- Muestra formulario con nueva contraseña + confirmación + indicador de fortaleza
- Llama `supabase.auth.updateUser({ password })` al enviar
- Redirige al dashboard tras éxito
- Si el usuario llega sin token de recovery, muestra mensaje de error con link a `/auth`

### 2. Actualizar `src/contexts/AuthContext.tsx`
Cambiar `redirectTo` en `resetPassword()`:
```
const redirectUrl = `${window.location.origin}/actualizar-password`;
```

### 3. Actualizar `src/App.tsx`
- Importar lazy `ActualizarPassword`
- Agregar ruta: `<Route path="/actualizar-password" element={<ActualizarPassword />} />`

### 4. Actualizar `Auth.tsx` (líneas 50-84)
En el bloque que procesa el hash, detectar si `type=recovery` y redirigir a `/actualizar-password` en vez de loguear silenciosamente. Esto cubre el caso donde Supabase redirige a `/auth` por algún email viejo.

### 5. Actualizar email template de recovery
En `send-custom-auth-email/index.ts`, el `confirmationUrl` ya usa el `redirect_to` que viene del payload, así que se actualizará automáticamente cuando cambiemos el `redirectTo` del frontend.

## Diseño de la página `/actualizar-password`

```text
┌─────────────────────────────────┐
│         [Logo CHEQUEALO]        │
│                                 │
│   Crear tu nueva contraseña     │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Nueva contraseña        │   │
│   └─────────────────────────┘   │
│   [████████░░] Buena            │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Confirmar contraseña    │   │
│   └─────────────────────────┘   │
│                                 │
│   [  Actualizar Contraseña  ]   │
│                                 │
└─────────────────────────────────┘
```

Mismo estilo visual que Auth.tsx (fondo hero, card blanca centrada, botón gradient amber/orange).

## Archivos a modificar
- **Crear** `src/pages/ActualizarPassword.tsx`
- **Editar** `src/contexts/AuthContext.tsx` — cambiar redirectTo
- **Editar** `src/App.tsx` — agregar ruta
- **Editar** `src/pages/Auth.tsx` — detectar `type=recovery` en hash y redirigir

