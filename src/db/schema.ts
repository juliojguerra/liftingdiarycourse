import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  real,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const setTypeEnum = pgEnum('set_type', [
  'warmup',
  'working',
  'drop',
  'failure',
]);

// TODO(human): Define setFormatEnum and add the setFormat column to the sets table below.
// The enum should support: 'reps', 'time', and 'distance' formats.
// Then add the column to the sets table (look for the TODO(human) comment there).

// ─── Tables ───────────────────────────────────────────────────────────────────

export const exercises = pgTable('exercises', {
  id:        serial('id').primaryKey(),
  name:      text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workouts = pgTable(
  'workouts',
  {
    id:          serial('id').primaryKey(),
    userId:      text('user_id').notNull(),
    name:        text('name').notNull(),
    startedAt:   timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt:   timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('workouts_user_id_idx').on(t.userId),
  ]
);

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id:         serial('id').primaryKey(),
    workoutId:  integer('workout_id')
                  .notNull()
                  .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id')
                  .notNull()
                  .references(() => exercises.id, { onDelete: 'restrict' }),
    order:      integer('order').notNull().default(0),
    createdAt:  timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('workout_exercises_workout_id_idx').on(t.workoutId),
  ]
);

export const sets = pgTable(
  'sets',
  {
    id:               serial('id').primaryKey(),
    workoutExerciseId: integer('workout_exercise_id')
                        .notNull()
                        .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber:        integer('set_number').notNull(),
    reps:             integer('reps'),
    weightKg:         real('weight_kg'),
    setType:          setTypeEnum('set_type').notNull().default('working'),
    // TODO(human): Add the setFormat column here using your setFormatEnum.
    // It should be notNull with a default of 'reps'.
    createdAt:        timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout:  one(workouts,   { fields: [workoutExercises.workoutId],  references: [workouts.id] }),
  exercise: one(exercises,  { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets:     many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields:     [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Exercise           = InferSelectModel<typeof exercises>;
export type NewExercise        = InferInsertModel<typeof exercises>;

export type Workout            = InferSelectModel<typeof workouts>;
export type NewWorkout         = InferInsertModel<typeof workouts>;

export type WorkoutExercise    = InferSelectModel<typeof workoutExercises>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;

export type Set                = InferSelectModel<typeof sets>;
export type NewSet             = InferInsertModel<typeof sets>;
