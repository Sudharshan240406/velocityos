# VelocityOS Folder Structure

## App

- `app/page.tsx`
  - Landing page
- `app/auth/*`
  - Authentication and reset flows
- `app/workspace/page.tsx`
  - Main product workspace
- `app/layout.tsx`
  - Global metadata and providers
- `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`
  - SEO and PWA assets
- `app/opengraph-image.tsx`, `app/twitter-image.tsx`
  - Social metadata image routes

## Components

- `components/landing-page.tsx`
  - Marketing experience
- `components/auth/*`
  - Email, Google, and demo auth UX
- `components/velocity/workspace-shell.tsx`
  - Workspace shell and lazy section loading
- `components/velocity/sections/*`
  - Feature panels split by concern
- `components/analytics-provider.tsx`
  - Client analytics pageview handling
- `components/cloud-sync-provider.tsx`
  - Supabase sync hydration and persistence

## Data and State

- `stores/focus-store.ts`
  - Core state for timer, garage, settings, notes, and rewards
- `lib/data.ts`
  - Static nav, vehicles, starter content, and theme options
- `lib/types.ts`
  - Shared domain types
- `lib/velocity-utils.ts`
  - Analytics and timer helpers
- `lib/idb.ts`
  - IndexedDB persistence
- `lib/supabase/*`
  - Browser, server, and middleware auth helpers
- `lib/analytics.ts`
  - Event tracking utility
- `supabase/migrations/*`
  - Production database schema and RLS policies

## Docs

- `docs/performance-report.md`
- `docs/deployment-guide.md`
- `docs/architecture-diagram.md`
- `docs/folder-structure.md`
- `docs/feature-documentation.md`
- `docs/production-readiness-report.md`
- `docs/case-study.md`
- `docs/linkedin-launch-package.md`
- `docs/demo-video-script.md`
- `docs/competition-package.md`
