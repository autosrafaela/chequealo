# Checklist de Registro y Login - Chequealo.net

## 📋 Flujos de Registro

### ✅ Registro de Cliente (Email/Password)
- [ ] 1. Ir a `/auth` o `/register`
- [ ] 2. Seleccionar tipo de cuenta "Cliente"
- [ ] 3. Completar formulario:
  - [ ] Nombre completo
  - [ ] Email válido
  - [ ] Contraseña (mínimo 6 caracteres, con mayúsculas, minúsculas, números)
  - [ ] Confirmar contraseña (debe coincidir)
- [ ] 4. Click en "Registrarse"
- [ ] 5. **ESPERADO**: Redirige automáticamente a `/user-dashboard`
- [ ] 6. **VERIFICAR**: Dashboard de usuario muestra correctamente

### ✅ Registro de Profesional (Email/Password)
- [ ] 1. Ir a `/auth` o `/register`
- [ ] 2. Seleccionar tipo de cuenta "Profesional"
- [ ] 3. Completar formulario básico:
  - [ ] Nombre completo
  - [ ] Email válido
  - [ ] DNI (requerido para profesionales)
  - [ ] Contraseña segura
  - [ ] Confirmar contraseña
- [ ] 4. Click en "Registrarse"
- [ ] 5. **ESPERADO**: Redirige a `/register` para completar perfil profesional
- [ ] 6. Completar perfil profesional:
  - [ ] Descripción
  - [ ] Ubicación (provincia, ciudad)
  - [ ] Teléfono
  - [ ] Seleccionar servicios (1-3 servicios)
  - [ ] Aceptar términos y condiciones
- [ ] 7. Click en "Completar Registro"
- [ ] 8. **ESPERADO**: Redirige automáticamente a `/dashboard` (panel profesional)
- [ ] 9. **VERIFICAR**: Dashboard profesional muestra correctamente

### ✅ Registro con Google (Cliente)
- [ ] 1. Ir a `/auth` o `/register`
- [ ] 2. Click en "Continuar con Google" o "Registrarse con Google"
- [ ] 3. Seleccionar cuenta de Google
- [ ] 4. Autorizar permisos
- [ ] 5. **ESPERADO**: Redirige automáticamente a `/user-dashboard`
- [ ] 6. **VERIFICAR**: Perfil pre-llenado con datos de Google
- [ ] 7. **VERIFICAR**: Dashboard de usuario muestra correctamente

### ✅ Registro con Google (Profesional)
- [ ] 1. Ir a `/register`
- [ ] 2. Asegurarse que tipo es "Profesional"
- [ ] 3. Click en "Continuar con Google"
- [ ] 4. Seleccionar cuenta de Google
- [ ] 5. Autorizar permisos
- [ ] 6. **ESPERADO**: Regresa a `/register` con datos pre-llenados
- [ ] 7. Completar perfil profesional:
  - [ ] DNI (requerido)
  - [ ] Descripción
  - [ ] Ubicación
  - [ ] Teléfono
  - [ ] Servicios (1-3)
  - [ ] Aceptar términos
- [ ] 8. Click en "Completar Registro"
- [ ] 9. **ESPERADO**: Redirige a `/dashboard` (panel profesional)
- [ ] 10. **VERIFICAR**: Dashboard profesional muestra correctamente

---

## 🔑 Flujos de Login

### ✅ Login Cliente (Email/Password)
- [ ] 1. Ir a `/auth` o `/login`
- [ ] 2. Ingresar email y contraseña
- [ ] 3. Click en "Iniciar Sesión"
- [ ] 4. **ESPERADO**: Redirige automáticamente a `/user-dashboard`
- [ ] 5. **VERIFICAR**: Dashboard de usuario muestra datos correctos

### ✅ Login Profesional (Email/Password)
- [ ] 1. Ir a `/auth` o `/login`
- [ ] 2. Ingresar email y contraseña
- [ ] 3. Click en "Iniciar Sesión"
- [ ] 4. **ESPERADO**: Redirige automáticamente a `/dashboard` (panel profesional)
- [ ] 5. **VERIFICAR**: Dashboard profesional muestra datos correctos

### ✅ Login con Google
- [ ] 1. Ir a `/auth`
- [ ] 2. Click en "Continuar con Google"
- [ ] 3. Seleccionar cuenta de Google
- [ ] 4. **ESPERADO**: 
  - Si es profesional → `/dashboard`
  - Si es cliente → `/user-dashboard`
- [ ] 5. **VERIFICAR**: Dashboard correcto según tipo de usuario

---

## 🔄 Validaciones y Seguridad

### ✅ Validación de Email
- [ ] Email inválido muestra error
- [ ] Email duplicado muestra mensaje apropiado
- [ ] Email no confirmado (si aplica) muestra instrucciones

### ✅ Validación de Contraseña
- [ ] Mínimo 6 caracteres
- [ ] Al menos una mayúscula
- [ ] Al menos una minúscula
- [ ] Al menos un número
- [ ] Indicador de fortaleza funciona correctamente

### ✅ Validación de DNI (Profesionales)
- [ ] DNI requerido para profesionales
- [ ] DNI duplicado es rechazado
- [ ] DNI válido acepta el registro

### ✅ Validación de Servicios (Profesionales)
- [ ] Mínimo 1 servicio seleccionado
- [ ] Máximo 3 servicios permitidos
- [ ] Búsqueda de servicios funciona

---

## 🚀 Redirecciones Post-Registro/Login

### Estados a Verificar:
- [ ] Usuario nuevo (cliente) → `/user-dashboard`
- [ ] Usuario nuevo (profesional con perfil completo) → `/dashboard`
- [ ] Usuario existente (cliente) → `/user-dashboard`
- [ ] Usuario existente (profesional) → `/dashboard`
- [ ] Usuario ya autenticado intenta acceder a `/auth` → Redirige a su dashboard
- [ ] Usuario ya autenticado intenta acceder a `/register` → Redirige a su dashboard
- [ ] Usuario ya autenticado intenta acceder a `/login` → Redirige a su dashboard

---

## 📱 Casos Especiales

### ✅ Recuperación de Contraseña
- [ ] Click en "¿Olvidaste tu contraseña?"
- [ ] Ingresar email
- [ ] **VERIFICAR**: Email de recuperación enviado
- [ ] **VERIFICAR**: Link de recuperación funciona
- [ ] **VERIFICAR**: Puede establecer nueva contraseña
- [ ] **VERIFICAR**: Redirige a dashboard correcto después

### ✅ Confirmación de Email (si está habilitada)
- [ ] Email de confirmación recibido
- [ ] Link de confirmación funciona
- [ ] **VERIFICAR**: Puede iniciar sesión después de confirmar
- [ ] **VERIFICAR**: Redirige a dashboard correcto

### ✅ OAuth Callbacks
- [ ] `/auth` maneja callback de Google correctamente
- [ ] `/register` maneja callback de Google correctamente
- [ ] No se producen errores 404
- [ ] Query params se limpian después del callback

---

## 🐛 Problemas Conocidos a Verificar

- [ ] ❌ **PROBLEMA**: Después de registro/login, redirige a `/` en lugar del dashboard
- [ ] ❌ **PROBLEMA**: No distingue entre cliente y profesional al redireccionar
- [ ] ✅ **SOLUCIONADO**: (Marcar cuando se corrija)

---

## 🔧 Configuración de Supabase

### Verificar en Supabase Dashboard:
- [ ] "Confirm email" está deshabilitado (para testing rápido)
- [ ] Google OAuth configurado correctamente
- [ ] Redirect URLs incluyen:
  - `https://chequealo.net/auth`
  - `https://chequealo.net/register`
  - `https://chequealo.net/dashboard`
  - `https://chequealo.net/user-dashboard`

---

## ✨ Testing Completo

### Escenario 1: Cliente Nuevo
1. Registrarse como cliente (email/password)
2. **DEBE** ir a `/user-dashboard` automáticamente
3. Cerrar sesión
4. Iniciar sesión nuevamente
5. **DEBE** ir a `/user-dashboard` automáticamente

### Escenario 2: Profesional Nuevo
1. Registrarse como profesional (email/password)
2. Completar perfil profesional
3. **DEBE** ir a `/dashboard` automáticamente
4. Cerrar sesión
5. Iniciar sesión nuevamente
6. **DEBE** ir a `/dashboard` automáticamente

### Escenario 3: Cliente con Google
1. Registrarse con Google (primera vez)
2. **DEBE** ir a `/user-dashboard` automáticamente
3. Cerrar sesión
4. Iniciar sesión con Google
5. **DEBE** ir a `/user-dashboard` automáticamente

### Escenario 4: Profesional con Google
1. Registrarse con Google como profesional
2. Completar perfil profesional
3. **DEBE** ir a `/dashboard` automáticamente
4. Cerrar sesión
5. Iniciar sesión con Google
6. **DEBE** ir a `/dashboard` automáticamente

---

## 📊 Resumen de Estados

| Tipo Usuario | Primera Vez | Perfil Completo | Destino Final |
|--------------|-------------|-----------------|---------------|
| Cliente | Email/Password | ✅ Automático | `/user-dashboard` |
| Cliente | Google OAuth | ✅ Automático | `/user-dashboard` |
| Profesional | Email/Password | ⚠️ Requiere completar | `/register` → `/dashboard` |
| Profesional | Google OAuth | ⚠️ Requiere completar | `/register` → `/dashboard` |
| Cualquiera | Login existente | ✅ Ya existe | Su dashboard correspondiente |
