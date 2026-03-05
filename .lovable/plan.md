

# Plan: Fix avatar upload pipeline

## Root Cause

The `ProfessionalDashboard.tsx` uploads avatars to a **non-existent** bucket called `'professional-photos'`. The correct bucket is `'avatars'` (which already exists, is public, and has proper RLS policies).

The `UserDashboard.tsx` and `ProfileCompletionProgress.tsx` correctly use the `'avatars'` bucket — those paths work fine.

## Storage & RLS Status

- The `avatars` bucket already exists and is public.
- RLS policies already exist for SELECT (public), INSERT/UPDATE/DELETE (owner only via `storage.foldername(name)[1]` matching `auth.uid()`).
- No SQL migration needed.

## Changes

### 1. Fix `src/pages/ProfessionalDashboard.tsx` (lines 127-138)

Change the bucket from `'professional-photos'` to `'avatars'`, and use `user.id` (not `professional.id`) as the folder name to match the RLS policy:

```typescript
// Before:
const filePath = `${professional.id}/avatar.${fileExt}`;
supabase.storage.from('professional-photos').upload(...)
supabase.storage.from('professional-photos').getPublicUrl(...)

// After:
const filePath = `${user.id}/avatar.${fileExt}`;
supabase.storage.from('avatars').upload(...)
supabase.storage.from('avatars').getPublicUrl(...)
```

Also need to ensure `user` is available in this component scope (it likely gets `user` from auth context or a parent).

### 2. Add validation (size + format) to `ProfessionalDashboard.tsx`

Add file size check (max 2MB) and format validation before upload, matching the pattern in `UserDashboard.tsx`.

### 3. Add cache-busting to `UserDashboard.tsx`

The professional dashboard already appends `?t=${Date.now()}` for cache-busting. Add the same to `UserDashboard.tsx` so the avatar updates visually after upload.

### 4. Also update `ProfileCompletionProgress.tsx` profiles update

This component updates `professionals.image_url` but also uses `avatars` bucket with `user.id` folder — this is correct. Just verify it also updates `profiles.avatar_url` for the sync trigger to work both ways.

