"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkoutRecord } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100),
  startedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export type UpdateWorkoutParams = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkout(params: UpdateWorkoutParams) {
  // 1. Validate first
  const validated = UpdateWorkoutSchema.safeParse(params);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  // 2. Get authenticated user from session — never from client input
  const { userId } = await auth();
  if (!userId) {
    return { error: { _root: ["Unauthorized"] } };
  }

  // 3. Mutate via the data helper — userId scopes the update to the owner
  const workout = await updateWorkoutRecord(
    validated.data.workoutId,
    userId,
    { name: validated.data.name, startedAt: validated.data.startedAt }
  );

  if (!workout) {
    return { error: { _root: ["Workout not found"] } };
  }

  const dateParam = validated.data.startedAt.toISOString().split("T")[0];
  return { data: { date: dateParam } };
}
