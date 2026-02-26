# Data Fetching

## Golden Rule: Server Components Only

**ALL data fetching in this app must happen exclusively in Server Components.**

- Do NOT fetch data in Client Components (`"use client"`)
- Do NOT fetch data in Route Handlers (`src/app/api/`)
- Do NOT use `useEffect` + `fetch` patterns
- Do NOT use SWR, React Query, or any client-side data fetching library

Server Components run only on the server and have direct, secure access to the database. There is no need for an intermediate API layer for data reads.

```tsx
// ✅ CORRECT — async Server Component fetches data directly
import { getWorkoutsForUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}

// ❌ WRONG — never fetch in a Client Component
"use client";
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(...); // forbidden
  }, []);
}
```

---

## Database Access: `/data` Directory + Drizzle ORM

All database queries must be encapsulated in helper functions inside the `/data` directory (e.g., `src/data/workouts.ts`).

- **Use Drizzle ORM exclusively.** Do NOT write raw SQL strings.
- Helper functions are the only place database logic lives — never inline queries in components.

```ts
// ✅ CORRECT — src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// ❌ WRONG — raw SQL
export async function getWorkoutsForUser(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
}
```

---

## Data Isolation: Users Can Only Access Their Own Data

**This is a hard security requirement.** Every query that returns user data MUST filter by the authenticated user's ID. A logged-in user must never be able to read, modify, or delete another user's data.

### Rules

1. **Always scope queries to the current user.** Pass `userId` into every data helper and include it in the `where` clause.
2. **Never trust client-supplied IDs alone.** When fetching a single record by ID (e.g., a workout), always add a `userId` check alongside the record ID.
3. **Retrieve the user session on the server.** Get `userId` from your auth session in the Server Component, then pass it down to the data helper — never accept it as a URL param or form field without cross-checking against the session.

```ts
// ✅ CORRECT — always scope by userId AND record id
export async function getWorkoutById(workoutId: string, userId: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// ❌ WRONG — fetches by record id only, any user could access any record
export async function getWorkoutById(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId));
}
```

```tsx
// ✅ CORRECT — Server Component obtains userId from session
import { auth } from "@/lib/auth";
import { getWorkoutById } from "@/data/workouts";

export default async function WorkoutPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const workout = await getWorkoutById(params.id, session.user.id);
  // ...
}
```

---

## Summary Checklist

- [ ] Data fetched in a Server Component — not a Client Component or Route Handler
- [ ] Query lives in a helper function under `src/data/`
- [ ] Query uses Drizzle ORM — no raw SQL
- [ ] Query filters by `userId` to enforce data isolation
- [ ] `userId` comes from the server-side auth session — not from URL params or client input
