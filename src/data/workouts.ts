import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type WorkoutWithExercises = {
  id: number;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  exercises: string[];
};

/**
 * Returns all workouts (with exercise names) for the given user.
 * Scoped strictly to userId — users cannot access each other's data.
 */
export async function getWorkoutsForUser(
  userId: string
): Promise<WorkoutWithExercises[]> {
  const rows = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt, workoutExercises.order);

  // Group flat rows into workouts with an exercises array
  const map = new Map<number, WorkoutWithExercises>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.id)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}
