import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

export async function getWorkoutById(
  workoutId: number,
  userId: string
): Promise<WorkoutWithExercises | null> {
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
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order);

  if (rows.length === 0) return null;

  const workout: WorkoutWithExercises = {
    id: rows[0].id,
    name: rows[0].name,
    startedAt: rows[0].startedAt,
    completedAt: rows[0].completedAt,
    exercises: [],
  };
  for (const row of rows) {
    if (row.exerciseName) workout.exercises.push(row.exerciseName);
  }
  return workout;
}

export async function updateWorkoutRecord(
  workoutId: number,
  userId: string,
  input: { name: string; startedAt: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set({ name: input.name, startedAt: input.startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout ?? null;
}

export async function createWorkoutRecord(input: {
  name: string;
  startedAt: Date;
  notes?: string;
  userId: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: input.userId,
      name: input.name,
      startedAt: input.startedAt,
    })
    .returning();
  return workout;
}
