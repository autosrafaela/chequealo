

# Plan: Add photo upload button to ProfileHeroSection for owners

## Problem
On the public professional profile page (`/maxibustamanteok`), there is no way for the owner to change their profile photo. The camera icon and upload logic only exist in the Dashboard's "Mi Perfil" tab, not on the public profile hero.

## Solution
Add an optional `onPhotoUpload` callback prop to `ProfileHeroSection`. When provided (i.e., the viewer is the owner), render a camera icon overlay on the avatar that triggers a hidden file input. The upload logic itself will live in `ProfessionalProfile.tsx`, reusing the same validated upload pipeline (avatars bucket, 2MB limit, cache-busting).

## Changes

### 1. Update `src/components/profile/ProfileHeroSection.tsx`
- Add optional props: `onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void` and `isOwner?: boolean`
- When `isOwner && onPhotoUpload`, render a camera icon button overlaid on the bottom-right of the avatar (similar to the dashboard pattern)
- Include a hidden `<input type="file" accept="image/*">` triggered by the camera button

### 2. Update `src/pages/ProfessionalProfile.tsx`
- Add a `handlePhotoUpload` function (same logic as ProfessionalDashboard: validate size/format, upload to `avatars` bucket with `currentUser.id`, update both `professionals.image_url` and `profiles.avatar_url`, cache-bust)
- Pass `onPhotoUpload={handlePhotoUpload}` and `isOwner={isOwner}` to `<ProfileHeroSection>`
- After successful upload, invalidate the `['professional', id]` query to refresh the hero image

