# UI Coding Standards

## Component Library: shadcn/ui (MANDATORY)

**All UI in this project must use shadcn/ui components exclusively.**

- **No custom components.** Do not create custom buttons, inputs, dialogs, cards, or any other UI primitives. Always reach for the shadcn/ui equivalent first.
- shadcn/ui components live in `@/components/ui/` and are installed via the CLI: `npx shadcn@latest add <component>`.
- The project uses the **new-york** style with **neutral** base color and **lucide** icons (see `components.json`).

### Why

shadcn/ui gives us accessible, consistently styled, composable components that integrate with Tailwind CSS v4 and our CSS variable theming out of the box. Building custom replacements introduces inconsistency and maintenance burden.

### Examples

| Need | Use |
|------|-----|
| Button | `<Button>` from `@/components/ui/button` |
| Text input | `<Input>` from `@/components/ui/input` |
| Modal / dialog | `<Dialog>` from `@/components/ui/dialog` |
| Dropdown menu | `<DropdownMenu>` from `@/components/ui/dropdown-menu` |
| Data table | `<Table>` from `@/components/ui/table` |
| Form fields | `<Form>`, `<FormField>`, etc. from `@/components/ui/form` |
| Notifications | `<Toast>` / `useToast` from `@/components/ui/toast` |
| Cards | `<Card>` from `@/components/ui/card` |

If a shadcn/ui component does not exist for your need, check the [shadcn/ui docs](https://ui.shadcn.com/docs/components) before assuming one needs to be built.

---

## Date Formatting: date-fns (MANDATORY)

All date formatting must use **date-fns**. Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting approach.

### Required Format

Dates must be displayed using ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2026
```

### Implementation

```ts
import { format } from "date-fns";

// Produces: "1st Sep 2025", "2nd Aug 2025", etc.
format(date, "do MMM yyyy");
```

The `do` token in date-fns produces the ordinal day (1st, 2nd, 3rd, 4th…). `MMM` produces the abbreviated month name. `yyyy` is the four-digit year.

### Example Usage

```tsx
import { format } from "date-fns";

function WorkoutDate({ date }: { date: Date }) {
  return <span>{format(date, "do MMM yyyy")}</span>;
}
```

---

## Summary Checklist

- [ ] UI element needed → find the shadcn/ui component, install if missing
- [ ] No hand-rolled buttons, inputs, modals, or layout primitives
- [ ] All dates formatted with `date-fns` using the `"do MMM yyyy"` pattern
