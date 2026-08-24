# Plan: App Nativa Android + iOS para Chequealo.net

## Enfoque recomendado

No reescribir la plataforma desde cero. Usar **Capacitor** para convertir la app web React existente en una app nativa instalable, y agregar código Kotlin/Swift solo donde sea estrictamente necesario (plugins nativos, configuraciones de plataforma, splash screen, etc.).

El proyecto ya tiene `capacitor.config.ts` con:
- `appId`: `app.lovable.f6bb3e036006482e858f9a265175f27d`
- `appName`: `chequealo`
- server URL apuntando a `https://chequealo.net`

## Alcance de este plan

1. Verificar/instalar dependencias de Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`).
2. Inicializar/actualizar configuración nativa (`capacitor.config.ts` ya existe, se ajustará si es necesario).
3. Agregar plataformas Android e iOS (`npx cap add android`, `npx cap add ios`).
4. Configurar assets nativos:
   - Splash screen
   - Iconos adaptativos (Android) y app icon (iOS)
   - Status bar / safe areas
   - Permisos básicos si se requieren (notificaciones push, ubicación, cámara)
5. Sincronizar build web con plataformas nativas (`npm run build` + `npx cap sync`).
6. Crear código nativo mínimo requerido:
   - Kotlin: `MainActivity.kt` personalizado si se necesita deep linking o plugins custom.
   - Swift: `AppDelegate.swift` / configuración de escena si se necesita.
7. Documentar cómo ejecutar en emulador/dispositivo físico.

## Lo que NO incluye este plan

- Reescribir pantallas de React a Kotlin/Swift.
- Publicación en App Store / Google Play (se puede agregar en un plan posterior).
- Funcionalidades nativas complejas como background tracking, pasarelas de pago nativas, etc. (se pueden agregar como plugins posteriores).

## Archivos a crear/modificar

- `android/` (carpeta generada por Capacitor)
- `ios/` (carpeta generada por Capacitor)
- `capacitor.config.ts` — ajustar `server.url` para desarrollo local/emulador si es necesario
- `package.json` — agregar scripts como `sync:android`, `sync:ios`, `open:android`, `open:ios`
- `public/manifest.json` / `index.html` — ajustar theme-color, viewport-fit=cover, íconos

## Consideraciones de seguridad

- El `server.url` actual apunta a `https://chequealo.net`. Para desarrollo/debug se puede apuntar al preview local, pero nunca debe quedar hardcodeado a localhost en producción.
- Las credenciales de Supabase y otras keys deben seguir viniendo de variables de entorno del build web, no del código nativo.
- El tráfico HTTP cleartext ya está habilitado (`cleartext: true`); revisar si es necesario para desarrollo local y deshabilitar en producción.

## Entregables

- Proyecto Android listo para abrir en Android Studio (`npx cap open android`).
- Proyecto iOS listo para abrir en Xcode (`npx cap open ios`).
- Instrucciones de ejecución en emulador/dispositivo físico.
- Notas sobre qué partes están en Kotlin/Swift real vs. web envuelta en Capacitor.
