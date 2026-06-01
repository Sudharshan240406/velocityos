# VelocityOS Performance Report

## Baseline

- Date: June 1, 2026
- Route: `/`
- First load JS: `589 kB`
- Route payload: `482 kB`
- Problem: the original FocusOS app shipped the entire workspace on the homepage, including charts, markdown rendering, drag-and-drop, celebration effects, and the timer experience.

## Optimization Work

- Split the experience into a lightweight landing page at `/` and a dedicated product workspace at `/workspace`.
- Replaced the old monolithic homepage entry with server-rendered marketing content.
- Added lazy-loaded workspace sections with `next/dynamic` for:
  - timer workspace modules
  - analytics charts
  - notes markdown preview
  - garage and social surfaces
  - completion celebration overlay
- Removed the heavy 3D timer dependency path from the primary user flow and replaced it with an SVG telemetry dashboard.
- Kept data local-first while preserving IndexedDB hydration.
- Added route-level SEO assets and static metadata pages.

## Result

### After

- Route: `/`
- First load JS: `106 kB`
- Route payload: `821 B`

- Route: `/workspace`
- First load JS: `193 kB`
- Route payload: `21.6 kB`

## Impact

- Homepage first load dropped from `589 kB` to `106 kB`.
- Improvement: about `82%` reduction.
- Public entry route is now well below the requested `250 kB` target and also below the `150 kB` elite target.
- Workspace first load remains below `250 kB` after adding production auth, sync, analytics, and demo-mode features.

## Remaining Opportunities

- Add true bundle analyzer output with `@next/bundle-analyzer` if you want per-chunk charts.
- Stream or virtualize very large note/task collections if the dataset grows materially.
- Move optional soundscape generation behind a user-initiated import if you want even more workspace trimming.
