

# Plan: Logo activo global en toda la app

## Problema
Actualmente el `LogoManager` guarda `active_logo_url` en `localStorage` pero **ningún componente lo consume**. El logo se importa estáticamente en cada archivo y nunca cambia.

## Solución

### 1. Crear un hook centralizado `useAppLogo`
**Nuevo archivo: `src/hooks/useAppLogo.ts`**

Un hook que lee `active_logo_url` de `localStorage` y retorna la URL del logo activo o el logo por defecto (`chequealo-new-logo.png`). También actualiza el favicon dinámicamente en el DOM.

```ts
export const useAppLogo = () => {
  const activeUrl = localStorage.getItem('active_logo_url');
  const logoSrc = activeUrl || defaultLogo;
  return logoSrc;
};

export const getAppLogo = () => {
  return localStorage.getItem('active_logo_url') || defaultLogo;
};
```

Incluirá una función `updateFavicon()` que cambia el `<link rel="icon">` del `<head>` dinámicamente al logo activo.

### 2. Actualizar todos los componentes que usan el logo

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAppLogo.ts` | **Nuevo** - hook + helper `getAppLogo()` + `updateFavicon()` |
| `src/components/Header.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/components/MobileOptimizedHeader.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/pages/Auth.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/pages/Login.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/pages/Register.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/pages/Install.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/components/PWAInstallPrompt.tsx` | Reemplazar import estático por `useAppLogo()` |
| `src/App.tsx` | Llamar `updateFavicon()` en useEffect para cambiar favicon al cargar |
| `src/components/admin/LogoManager.tsx` | Al activar/desactivar, llamar `updateFavicon()` y disparar evento `storage` para que otros componentes se actualicen en tiempo real |

### 3. Comportamiento
- Al activar un logo en el admin, **inmediatamente** cambia en toda la app (sin recargar)
- El favicon del navegador se actualiza dinámicamente
- Si se desactiva, vuelve al logo por defecto (`chequealo-new-logo.png`)
- Terms y Privacy no tienen logo propio, no necesitan cambios

