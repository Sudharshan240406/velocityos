# VelocityOS

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Ready-3ecf8e)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-orange)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#)

VelocityOS is a startup-grade, automotive-inspired productivity platform that turns deep work into a premium driving experience. It combines a landing page, protected workspace, Velocity Mode timer, garage progression, AI Driver Coach, analytics, theme marketplace, demo mode, and offline-first persistence.

## Project Overview

VelocityOS is designed to feel closer to a high-end digital product than a typical Pomodoro app. The product experience blends:

- supercar-style focus telemetry
- gamified vehicle unlock progression
- AI-guided productivity coaching
- cloud-ready Supabase auth and sync
- Vercel + Google analytics instrumentation
- mobile-friendly PWA behavior

## Features

- Landing page with startup-quality positioning and CTA flow
- Protected `/workspace` route with email auth, Google OAuth, and instant demo access
- Velocity Mode dashboard with Focus Speed, RPM, Turbo, and Nitro telemetry
- Garage system with unlockable vehicles and XP progression
- AI Driver Coach insights and recommendations
- Tasks, notes, analytics, settings, and floating timer widget
- Theme marketplace and animated background effects
- Offline-first persistence via Zustand, local storage, and IndexedDB
- Supabase-ready cloud sync for profiles, tasks, notes, settings, garage, and session history
- Vercel Analytics and Google Analytics event tracking
- SEO metadata, Open Graph, Twitter cards, sitemap, robots, and PWA assets

## Screenshots

Add screenshots here once captured:

- `docs/screenshots/landing-page.png`
- `docs/screenshots/auth-screen.png`
- `docs/screenshots/workspace-dashboard.png`
- `docs/screenshots/garage-system.png`
- `docs/screenshots/mobile-experience.png`

## Architecture Diagram

See [docs/architecture-diagram.md](C:/Users/Admin/Desktop/Pomodoro/docs/architecture-diagram.md).

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Zustand
- React Query
- Framer Motion
- IndexedDB
- Supabase
- Vercel Analytics
- Google Analytics
- PWA service worker

## Performance Results

- Homepage first-load JS: `589 kB -> 106 kB`
- Current homepage first-load JS: `106 kB`
- Current workspace first-load JS: `193 kB`

See [docs/performance-report.md](C:/Users/Admin/Desktop/Pomodoro/docs/performance-report.md).

## Folder Structure

See [docs/folder-structure.md](C:/Users/Admin/Desktop/Pomodoro/docs/folder-structure.md).

## Setup Instructions

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/workspace`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GA_ID=
```

Detailed guide: [docs/environment-variables.md](C:/Users/Admin/Desktop/Pomodoro/docs/environment-variables.md)

## Deployment Instructions

1. Import the repository into Vercel
2. Configure the environment variables above
3. Create the Supabase schema with [supabase/migrations/0001_velocityos_prod.sql](C:/Users/Admin/Desktop/Pomodoro/supabase/migrations/0001_velocityos_prod.sql)
4. Enable Google auth in Supabase
5. Deploy and run Lighthouse on `/` and `/workspace`

More detail: [docs/deployment-guide.md](C:/Users/Admin/Desktop/Pomodoro/docs/deployment-guide.md)

## Documentation

- [Production Readiness Report](C:/Users/Admin/Desktop/Pomodoro/docs/production-readiness-report.md)
- [Deployment Checklist](C:/Users/Admin/Desktop/Pomodoro/docs/deployment-checklist.md)
- [Case Study](C:/Users/Admin/Desktop/Pomodoro/docs/case-study.md)
- [LinkedIn Launch Package](C:/Users/Admin/Desktop/Pomodoro/docs/linkedin-launch-package.md)
- [Demo Video Script](C:/Users/Admin/Desktop/Pomodoro/docs/demo-video-script.md)
- [Competition Package](C:/Users/Admin/Desktop/Pomodoro/docs/competition-package.md)

## Roadmap

- Complete production Supabase table typing
- Add fully live leaderboard and focus room UI
- Add richer achievement management and unlock history
- Capture final product screenshots and demo video
- Add e2e tests for auth, demo mode, and sync flows

## Future Enhancements

- Native push notifications
- Team workspaces
- Shared focus rooms with live presence
- Advanced AI recommendations backed by historical trend models
- Revenue instrumentation and billing flow
