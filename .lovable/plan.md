

# Plan: Add "Sacar Foto" / "Buscar en Galería" options to profile photo upload

## Problem
Currently, clicking the camera icon immediately opens the file picker. On mobile devices, users expect to choose between taking a photo with their camera or selecting from gallery.

## Solution
Replace the direct file input trigger with a bottom sheet (Drawer) that presents two options: "Sacar Foto" (capture from camera) and "Buscar en Galería" (pick from gallery). Each option uses a separate hidden `<input type="file">` with the appropriate `capture` attribute.

## Changes

### 1. Update `src/components/profile/ProfileHeroSection.tsx`
- Add state `showPhotoMenu` (boolean) to control the Drawer visibility
- Replace the camera button's `onClick` from directly triggering file input to opening the Drawer
- Add two hidden file inputs:
  - One with `capture="environment"` (or `capture="user"`) for camera capture
  - One without `capture` for gallery selection
- Render a `Drawer` (from vaul, already available) with two options:
  - **Sacar Foto** (Camera icon) — triggers the capture input
  - **Buscar en Galería** (ImageIcon) — triggers the gallery input
- Both inputs share the same `onPhotoUpload` handler

### Key UI:
```
┌──────────────────────────┐
│   Cambiar foto de perfil │
│                          │
│  📷  Sacar Foto          │
│  🖼️  Buscar en Galería   │
│                          │
│      Cancelar            │
└──────────────────────────┘
```

No changes needed in `ProfessionalProfile.tsx` — the `onPhotoUpload` callback remains the same since both inputs fire the same `onChange` event.

