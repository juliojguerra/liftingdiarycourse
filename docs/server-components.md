# Server Components

## Default: Server Components First

Pages and layouts in the App Router are **Server Components by default**. Only add `"use client"` when a component genuinely needs browser APIs or interactivity (event handlers, `useState`, `useEffect`, router navigation, etc.).

Keep the tree as server-rendered as far down as possible — push the `"use client"` boundary to the leaves.

---

## Async Params and SearchParams (Next.js 15 — MANDATORY)

**In Next.js 15, `params` and `searchParams` are Promises. You MUST `await` them before accessing any property.**

This applies to every page and layout that receives these props.

```tsx
// ✅ CORRECT — params typed as Promise, awaited before use
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  // ...
}
```

```tsx
// ✅ CORRECT — searchParams typed as Promise, awaited before use
type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewWorkoutPage({ searchParams }: Props) {
  const { date } = await searchParams;
  // ...
}
```

```tsx
// ❌ WRONG — synchronous access, params is a Promise in Next.js 15
type Props = {
  params: { workoutId: string }; // wrong type
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = params; // silently returns undefined at runtime
  // ...
}
```

### Why

Next.js 15 made `params` and `searchParams` async to support fully dynamic rendering without blocking. Accessing them synchronously does **not** throw a TypeScript error at the destructuring site, making this a silent runtime bug. Always type them as `Promise<...>` and `await` them.

---

## Page Component Conventions

### Typing Props

Always define a local `Props` type for each page component. Do not use inline generic types.

```tsx
// ✅ CORRECT
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
}

// ❌ WRONG — inline typing, harder to read and maintain
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {}
```

### Parallel Awaits

When you need both `params` and another async value (e.g., `auth()`), destructure `params` first, then fire the independent awaits in parallel if they do not depend on each other.

```tsx
// ✅ CORRECT — params awaited, then auth and data fetched in parallel
export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();

  if (!userId) return null;

  const workout = await getWorkoutById(Number(workoutId), userId);
  // ...
}
```

---

## Not-Found Handling

Use Next.js's built-in `notFound()` from `"next/navigation"` when a dynamic route resolves to a record that does not exist. Do not return `null` or render empty UI for missing resources.

```tsx
import { notFound } from "next/navigation";

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();

  if (!userId) return null; // middleware should prevent this

  const id = Number(workoutId);
  if (isNaN(id)) notFound(); // invalid segment — show 404

  const workout = await getWorkoutById(id, userId);
  if (!workout) notFound(); // record not found or not owned by user — show 404
}
```

---

## Summary Checklist

- [ ] No `"use client"` unless browser APIs or interactivity are genuinely required
- [ ] `params` typed as `Promise<{ ... }>` and `await`ed before accessing properties
- [ ] `searchParams` typed as `Promise<{ ... }>` and `await`ed before accessing properties
- [ ] Local `Props` type defined for every page component
- [ ] Missing dynamic records handled with `notFound()`, not silent `null` returns
