# Routing

## Route Structure

All application routes live under `/dashboard`. The root `/` page is the only public entry point.

```
/                          → Public home page (sign-in / sign-up CTAs)
/sign-in                   → Clerk sign-in (public)
/sign-up                   → Clerk sign-up (public)
/dashboard                 → Dashboard home — PROTECTED
/dashboard/workout/new     → Create workout — PROTECTED
/dashboard/workout/[id]    → Edit workout — PROTECTED
```

Never add protected pages outside of `/dashboard`. If a new feature requires its own page, nest it under `/dashboard/`.

---

## Route Protection: Middleware (MANDATORY)

**All `/dashboard` routes must be protected via Next.js middleware — not by individual page-level redirects.**

Use Clerk's `createRouteMatcher` to declare a whitelist of public routes. Everything not on the whitelist is automatically protected by calling `auth.protect()`.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Why middleware — not page redirects

Page-level `auth()` guards (e.g., `if (!userId) redirect("/")`) are a **secondary defense**, not the primary one. Middleware runs before the page renders and before any data is fetched, so it's the correct place to enforce authentication boundaries. A page that relies solely on a redirect guard can still execute server logic before the redirect fires.

✅ Middleware = enforced at the edge, before any rendering
❌ Page redirect alone = auth check happens inside the render cycle

---

## Adding New Routes

When adding a page under `/dashboard`:

1. Create the file at `src/app/dashboard/<feature>/page.tsx`.
2. No changes to middleware are needed — the `isPublicRoute` whitelist already excludes all `/dashboard/*` paths.
3. Add a secondary `auth()` guard in the page as a belt-and-suspenders check (see `docs/auth.md`).

When adding a **public** route (e.g., a marketing page):

1. Create the page file.
2. Add the path to the `isPublicRoute` matcher in `src/middleware.ts`.

---

## File Conventions

| Convention | Rule |
|---|---|
| Pages | `page.tsx` inside the route folder |
| Layouts | `layout.tsx` — only add if the route group needs a shared shell |
| Dynamic segments | `[paramName]` folder names (e.g., `[workoutId]`) |
| Catch-all routes | `[[...slug]]` — used for Clerk sign-in/sign-up pages only |
| Route params | Must be typed as `Promise<{ paramName: string }>` and awaited (Next.js 15+) — see `docs/server-components.md` |

---

## Related Docs

- `docs/auth.md` — Clerk setup, `auth()` usage, and session access patterns
- `docs/server-components.md` — async params/searchParams conventions and Props typing
