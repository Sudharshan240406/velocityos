# Environment Variable Guide

## Required for Full Production

### `NEXT_PUBLIC_SUPABASE_URL`

The HTTPS project URL from Supabase.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The publishable key used by browser and server auth clients.

### `NEXT_PUBLIC_GA_ID`

Google Analytics Measurement ID, for example `G-XXXXXXXXXX`.

## Optional Compatibility Variable

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supported as a fallback if you prefer the older naming convention.

## Local-Only Behavior Without Supabase

If Supabase variables are omitted:

- auth falls back to demo/local usage
- cloud sync is disabled
- workspace still functions locally

## Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
