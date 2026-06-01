# Deployment Checklist

## Pre-Deploy

- `npm install`
- `npm run lint`
- `npm run build`
- Verify `.env.local` values match production environment variables
- Run Supabase migration: [supabase/migrations/0001_velocityos_prod.sql](C:/Users/Admin/Desktop/Pomodoro/supabase/migrations/0001_velocityos_prod.sql)
- Enable Google OAuth in Supabase

## Vercel

- Import repo into Vercel
- Set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_GA_ID`
- Confirm `vercel.json` headers are applied

## Post-Deploy Validation

- Open `/`
- Open `/auth`
- Start demo mode
- Sign in with email
- Sign in with Google
- Load `/workspace`
- Confirm robots and sitemap routes render
- Confirm manifest and service worker register

## Analytics Validation

- Confirm Vercel Analytics is receiving traffic
- Confirm Google Analytics page views are recorded
- Trigger:
  - demo start
  - session start
  - session completion
  - theme change
  - AI coach visit

## Lighthouse

Run on:

- `/`
- `/workspace`

Target:

- Performance 95+
- Accessibility 95+
- Best Practices 95+
- SEO 95+
