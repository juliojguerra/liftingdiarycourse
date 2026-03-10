# Data Mutations

## Golden Rule: Server Actions Only

**ALL data mutations in this app must happen exclusively via Server Actions.**

- Do NOT mutate data inside Route Handlers (`src/app/api/`)
- Do NOT mutate data directly inside Server Components
- Do NOT call database helpers directly from Client Components
- Do NOT use `fetch` + REST patterns for writes

Server Actions run only on the server, have direct access to the database, and integrate natively with Next.js form handling and cache invalidation.

---

## Server Actions: Colocation + File Convention

Server Actions must live in **colocated `actions.ts` files** — placed next to the page or component they belong to.

```
src/app/workouts/
  page.tsx
  actions.ts        ← server actions for this route
src/app/workouts/[id]/
  page.tsx
  actions.ts        ← server actions for this nested route
```

Every `actions.ts` file must begin with the `"use server"` directive:

```ts
"use server";

// actions go here
```

---

## Typed Parameters — No FormData

Server Action parameters must be **explicitly typed**. The `FormData` type is forbidden.

Parse and validate form inputs before they reach the action, or accept structured objects directly.

```ts
// ✅ CORRECT — typed parameters
export async function createWorkout(params: CreateWorkoutParams) { ... }

// ❌ WRONG — FormData is untyped and bypasses validation
export async function createWorkout(formData: FormData) { ... }
```

---

## Validation: Zod (MANDATORY)

**Every Server Action must validate its arguments with Zod before doing anything else.**

Define the Zod schema in the same `actions.ts` file, above the action function. Validation must be the first operation inside the action body — before auth checks, database calls, or any other logic.

```ts
"use server";

import { z } from "zod";
import { createWorkoutRecord } from "@/data/workouts";
import { auth } from "@/lib/auth";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutParams = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkout(params: CreateWorkoutParams) {
  // 1. Validate first
  const validated = CreateWorkoutSchema.safeParse(params);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  // 2. Then get the authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    return { error: { _root: ["Unauthorized"] } };
  }

  // 3. Then mutate via the data helper
  const workout = await createWorkoutRecord({
    ...validated.data,
    userId: session.user.id,
  });

  return { data: workout };
}
```

> **Why `safeParse` over `parse`?** `parse` throws on invalid input, which surfaces as an unhandled server error. `safeParse` returns a result object that lets you return structured error messages back to the client gracefully.

---

## Database Access: `/data` Directory + Drizzle ORM

Server Actions must **never** call Drizzle directly. All database writes must go through helper functions in `src/data/`.

- Helper functions are the only place database logic lives
- Use Drizzle ORM exclusively — no raw SQL strings
- Name mutation helpers clearly: `createX`, `updateX`, `deleteX`

```ts
// ✅ CORRECT — src/data/workouts.ts
import { db } from "@/lib/db";
import { workouts } from "@/lib/schema";

export async function createWorkoutRecord(input: {
  name: string;
  date: Date;
  notes?: string;
  userId: string;
}) {
  const [workout] = await db.insert(workouts).values(input).returning();
  return workout;
}

// ❌ WRONG — Drizzle called directly inside a Server Action
export async function createWorkout(params: CreateWorkoutParams) {
  // ...
  await db.insert(workouts).values({ ...params, userId: session.user.id }); // forbidden
}
```

---

## Data Isolation: Always Scope Mutations to the Current User

**This is a hard security requirement.** Every mutation that writes, updates, or deletes user data must verify ownership using the authenticated user's ID from the server-side session.

### Rules

1. **Always get `userId` from the auth session** inside the Server Action — never accept it as a parameter from the client.
2. **For updates and deletes**, pass both the record ID and `userId` to the data helper and include both in the `where` clause so a user cannot modify another user's records.
3. **Never trust client-supplied ownership.** A user crafting a request with someone else's record ID must not be able to affect that record.

```ts
// ✅ CORRECT — src/data/workouts.ts
export async function deleteWorkoutRecord(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// ❌ WRONG — deletes by record id only, any authenticated user could delete any record
export async function deleteWorkoutRecord(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
}
```

```ts
// ✅ CORRECT — actions.ts gets userId from session, not from the client
export async function deleteWorkout(params: DeleteWorkoutParams) {
  const validated = DeleteWorkoutSchema.safeParse(params);
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { error: { _root: ["Unauthorized"] } };

  await deleteWorkoutRecord(validated.data.workoutId, session.user.id);
  return { data: null };
}
```

---

## Return Shape Convention

Server Actions should return a consistent discriminated union so callers can handle success and error states uniformly:

```ts
// On success
return { data: result };

// On validation or auth failure
return { error: { fieldName: ["message"] } };
```

Never throw from a Server Action unless the error is truly unexpected — prefer returning structured error objects.

---

## Navigation After Mutations: Client-Side Only

**Server Actions must never call `redirect()`.** After a successful mutation, return `{ data }` and let the calling Client Component navigate using `useRouter().push(...)`.

```ts
// ✅ CORRECT — action returns data, client navigates
// actions.ts
return { data: { date: dateParam } };

// ClientComponent.tsx
const result = await createWorkout(params);
if (result.data) router.push(`/dashboard?date=${result.data.date}`);

// ❌ WRONG — server decides where the user goes
redirect("/dashboard");
```

---

## Summary Checklist

- [ ] Mutation lives in a colocated `actions.ts` file with `"use server"` at the top
- [ ] Parameters are typed — `FormData` is never used
- [ ] Zod schema is defined and `safeParse` is called as the **first** operation
- [ ] Database writes go through a helper in `src/data/` — no inline Drizzle calls
- [ ] Helper uses Drizzle ORM — no raw SQL
- [ ] `userId` comes from the server-side auth session — never from client input
- [ ] Updates and deletes scope their `where` clause to both the record ID and `userId`
- [ ] Action returns `{ data }` on success or `{ error }` on failure
- [ ] Action never calls `redirect()` — navigation is handled by the Client Component
