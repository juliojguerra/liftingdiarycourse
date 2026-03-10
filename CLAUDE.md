# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint (flat config v9+)
npm start        # Run production server
```

No test runner is configured yet.

## Architecture

**Next.js 16 App Router** project using React 19, TypeScript (strict), and Tailwind CSS v4.

All source code lives under `src/app/` — the App Router convention. Pages are `page.tsx` files, layouts are `layout.tsx`. Server Components are the default; use `"use client"` directive only when browser APIs or interactivity are needed.

**Path alias:** `@/*` maps to `./src/*`.

## Documentation First

**IMPORTANT:** Before generating any code, always consult the relevant documentation file in the `/docs` directory. Currently available:
- `docs/ui.md` — UI patterns, component guidelines, and design decisions
- `docs/data-fetching.md` — Server Component data fetching, Drizzle ORM, and data isolation rules
- `docs/data-mutations.md` — Server Actions, Zod validation, typed params, and mutation data helpers
- `docs/auth.md` — Authentication via Clerk: setup, middleware, session access, and sign-in/sign-up pages
- `docs/server-components.md` — Server Component conventions: async params/searchParams (must be awaited in Next.js 15), Props typing, and not-found handling
- `docs/routing.md` — Route structure, middleware-based protection for /dashboard routes, and file conventions

If a relevant doc exists for the feature or area being worked on, read it first and follow its conventions.

## Key Conventions

- **Styling:** Tailwind CSS v4 utility classes + CSS custom properties in `globals.css` for theming. Dark mode is handled via `prefers-color-scheme` media query on `:root` variables — no class-based toggling.
- **Fonts:** Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx` and injected as CSS variables (`--font-geist-sans`, `--font-geist-mono`).
- **Images:** Use `next/image` for all images to get automatic optimization.
- **No state management library** — React's built-in hooks only for now.

## Project Context

This is a **Lifting Diary** app built as a course project. Feature development is expected in:
- `src/app/api/` — API routes (not yet created)
- `src/components/` — Shared UI components (not yet created)
- `src/lib/` — Utilities and data access helpers (not yet created)
