# Authentication

## Provider: Clerk (MANDATORY)

**All authentication in this project must use Clerk exclusively.**

- Do NOT implement custom auth logic (sessions, JWTs, password hashing, etc.)
- Do NOT use NextAuth, Auth.js, Lucia, or any other auth library
- Clerk handles sign-up, sign-in, session management, and user management out of the box

Install the Clerk SDK if not already present:

```bash
npm install @clerk/nextjs
```

---

## Setup

### Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Middleware

Route protection is enforced via Clerk's middleware. Create `src/middleware.ts` at the project root:

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
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

### ClerkProvider

Wrap the app in `<ClerkProvider>` inside `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Getting the Current User

### In Server Components (preferred)

Use `auth()` from `@clerk/nextjs/server` to get the `userId` in Server Components and pass it to data helpers:

```tsx
// ✅ CORRECT — Server Component
import { auth } from "@clerk/nextjs/server";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) return null; // middleware should prevent this, but guard anyway

  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

### In Client Components (UI state only)

Use `useAuth()` or `useUser()` from `@clerk/nextjs` **only for UI display purposes** — never for data fetching or access control:

```tsx
// ✅ CORRECT — display only
"use client";
import { useUser } from "@clerk/nextjs";

export function UserGreeting() {
  const { user } = useUser();
  return <p>Welcome, {user?.firstName}</p>;
}

// ❌ WRONG — never fetch data from a Client Component
"use client";
import { useAuth } from "@clerk/nextjs";

export function WorkoutList() {
  const { userId } = useAuth();
  useEffect(() => {
    fetch(`/api/workouts?userId=${userId}`); // forbidden — see data-fetching.md
  }, [userId]);
}
```

---

## Sign-In and Sign-Up Pages

Use Clerk's prebuilt components. Create the following pages:

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

Do not build custom sign-in/sign-up forms. The Clerk components handle all flows (email, OAuth, MFA) and are already styled to match your theme via the Clerk dashboard.

---

## User ID in Data Helpers

Always obtain `userId` from the server-side Clerk session — never from URL params, query strings, or client-supplied request bodies.

```ts
// ✅ CORRECT — userId comes from Clerk session in the Server Component caller
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// ❌ WRONG — trusting client-supplied userId without session verification
export async function getWorkoutsForUser(req: Request) {
  const { userId } = await req.json(); // untrusted input
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

See `docs/data-fetching.md` for full data isolation rules.

---

## Summary Checklist

- [ ] `ClerkProvider` wraps the app in `layout.tsx`
- [ ] `clerkMiddleware` protects all non-public routes in `src/middleware.ts`
- [ ] `userId` always retrieved from `auth()` in a Server Component — not from client input
- [ ] No custom auth logic, sessions, or third-party auth libraries
- [ ] Sign-in/sign-up pages use Clerk's `<SignIn>` and `<SignUp>` components
- [ ] Client Components use Clerk hooks for display only — not for data fetching or access control
