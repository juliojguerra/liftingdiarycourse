"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkoutRecord } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export type CreateWorkoutParams = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkout(params: CreateWorkoutParams) {
  // 1. Validate first
  const validated = CreateWorkoutSchema.safeParse(params);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  // 2. Get authenticated user from session — never from client input
  const { userId } = await auth();
  if (!userId) {
    return { error: { _root: ["Unauthorized"] } };
  }

  // 3. Mutate via the data helper
  const workout = await createWorkoutRecord({
    name: validated.data.name,
    startedAt: validated.data.startedAt,
    userId,
  });

  const dateParam = validated.data.startedAt.toISOString().split("T")[0];
  return { data: { date: dateParam } };
}
