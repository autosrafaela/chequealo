

# Plan: Redesign professional share cards to premium quality

## Current State
The `generateCard()` function in `useGenerateShareCard.ts` produces a basic centered layout with gradient backgrounds and simple text stacking. The `Professional` interface lacks services/skills data needed for the new design.

## New Design

```text
┌─────────────────────────────────┐
│  ✓ Chequealo.net          (top) │
│                                 │
│  ┌──────┐                       │
│  │ FOTO │  NOMBRE COMPLETO      │
│  │      │  Título Profesional   │
│  └──────┘  ✓ Verificado        │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  📍 Ubicación                   │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Skill│ │Skill│ │Skill│ ...   │
│  └─────┘ └─────┘ └─────┘      │
│                                 │
│  ★★★★★  4.8 (23 reseñas)      │
│                                 │
│  "Gestión eficiente y           │
│   transparente..."              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  📞  ✉️  💬  ✓                  │
│                                 │
│  ┌─────────────────────────┐   │
│  │  ¡Escaneá y contactame! │   │
│  │     [QR CODE]           │   │
│  │  chequealo.net/slug     │   │
│  └─────────────────────────┘   │
│                                 │
│  Profesionales de confianza     │
└─────────────────────────────────┘
```

## Changes

### 1. Extend Professional interface (`useGenerateShareCard.ts`)
Add optional fields: `services?: { name: string }[]`, `description?: string`, `phone?: string`, `email?: string`.

### 2. Rewrite `generateCard()` (`useGenerateShareCard.ts`)
Complete redesign of the Canvas drawing logic:
- **Background**: Dark charcoal (#1a1a2e) to white gradient with subtle geometric shapes (soft circles/rectangles at low opacity) instead of the current pattern system.
- **Header**: "✓ Chequealo.net" top-left, small and elegant.
- **Profile section** (asymmetric): Photo circle top-left with a thin accent border (teal #0ea5e9), name + title to the right in bold sans-serif, verified badge as a small teal circle with checkmark near the name.
- **Location**: With pin icon, clean line below.
- **Skills grid**: Up to 6 service names rendered as pill/chip shapes from `services[]`.
- **Rating**: Stars + numeric + review count.
- **CTA text**: Professional's description or a generated tagline.
- **Contact icons row**: Minimalist circles for phone, email, WhatsApp, Chequealo logo.
- **QR section**: Generate a QR code using Canvas (simple QR matrix drawing) pointing to the profile URL, with "chequealo.net/slug" below.
- **Footer**: Subtle branding line.

### 3. QR Code generation
Add a lightweight QR code generator function (alphanumeric QR encoding via Canvas — ~80 lines). No external library needed; we'll use a simple QR matrix algorithm or encode the URL into a visual grid pattern that looks like a QR code for aesthetic purposes, with the actual URL text below for functionality.

**Alternative (simpler)**: Use the Google Charts QR API to load a QR image: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=URL` — load it as an image onto the canvas. This is more reliable.

### 4. Update `ProfileShareCard.tsx` and `ProfessionalProfile.tsx`
Pass the additional data (services, description) to the card generator. The `ProfileShareCard` component already receives `professional` — we just need to enrich it with services data from the parent.

### 5. Update card styles
Reduce to 3-4 premium styles instead of 8 generic ones: `executive` (dark), `clean` (white/light), `accent` (teal/blue brand colors). All use the new asymmetric layout.

## Files to modify
- `src/hooks/useGenerateShareCard.ts` — full rewrite of `generateCard()`, extended interface
- `src/types/cardStyles.ts` — new premium style definitions
- `src/components/ProfileShareCard.tsx` — pass services data
- `src/pages/ProfessionalProfile.tsx` — pass services to `ProfileShareCard`

