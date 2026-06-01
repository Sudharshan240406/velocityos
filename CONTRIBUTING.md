# Contributing to VelocityOS

## Principles

- Preserve the existing VelocityOS product direction.
- Prefer incremental hardening over architectural churn.
- Keep performance, accessibility, and mobile behavior in mind.
- Use official docs for unstable platform integrations.

## Local Workflow

```bash
npm install
npm run lint
npm run build
```

## Branch / PR Expectations

- Describe the problem clearly
- Keep changes scoped
- Include screenshots for UI changes
- Note any environment variables or migrations required
- Confirm `npm run lint` and `npm run build` pass

## Code Standards

- TypeScript strict mode only
- Prefer reusable modules over monolithic files
- Preserve route-level code splitting
- Use `apply_patch` for edits during Codex-assisted work

## Areas That Need Special Care

- Auth and middleware
- Cloud sync logic
- Analytics tracking
- PWA/service worker behavior
- Build size regressions

## Reporting Issues

Include:

- expected behavior
- actual behavior
- browser/device
- screenshots or logs
- steps to reproduce
