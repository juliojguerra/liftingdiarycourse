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
