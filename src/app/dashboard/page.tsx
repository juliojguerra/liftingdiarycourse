"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayButton } from "react-day-picker";

// Placeholder workout data — will be replaced with real data fetching later
const PLACEHOLDER_WORKOUTS = [
  {
    id: 1,
    name: "Upper Body Push",
    startedAt: new Date(2026, 1, 23, 9, 0), // Feb 23 2026
    completedAt: new Date(2026, 1, 23, 10, 15),
    exercises: ["Bench Press", "Overhead Press", "Tricep Pushdown"],
  },
  {
    id: 2,
    name: "Lower Body",
    startedAt: new Date(2026, 1, 23, 17, 30), // Feb 23 2026
    completedAt: new Date(2026, 1, 23, 18, 45),
    exercises: ["Squat", "Romanian Deadlift", "Leg Press"],
  },
];

// Dates that have at least one workout — used to render dots on the calendar
const WORKOUT_DATES = PLACEHOLDER_WORKOUTS.map((w) => w.startedAt);

// Custom DayButton that renders a dot indicator when the day has workout data
function WorkoutDayButton(props: React.ComponentProps<typeof DayButton>) {
  const hasWorkout = props.modifiers?.hasWorkout;
  return (
    <div className="relative">
      <CalendarDayButton {...props} />
      {hasWorkout && (
        <span className="absolute top-1 left-1/2 -translate-x-1/2 block size-1 rounded-full bg-primary" />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const workoutsForDate = getWorkoutsForDate(selectedDate);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* Date Picker */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Viewing workouts for</p>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 sm:w-auto">
              <CalendarIcon className="size-4" />
              {format(selectedDate, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }
              }}
              modifiers={{ hasWorkout: WORKOUT_DATES }}
              components={{ DayButton: WorkoutDayButton }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Workout List */}
      <section>
        <h2 className="mb-4 text-lg font-medium">
          {workoutsForDate.length > 0
            ? `${workoutsForDate.length} workout${workoutsForDate.length > 1 ? "s" : ""} logged`
            : "No workouts logged"}
        </h2>

        {workoutsForDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            <Dumbbell className="mb-3 size-8 opacity-40" />
            <p className="text-sm">No workouts on {format(selectedDate, "do MMM yyyy")}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {workoutsForDate.map((workout) => (
              <li key={workout.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(workout.startedAt, "h:mm a")}
                      {workout.completedAt && (
                        <> &mdash; {format(workout.completedAt, "h:mm a")}</>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {workout.exercises.map((exercise) => (
                        <li key={exercise} className="text-sm text-muted-foreground">
                          · {exercise}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function getWorkoutsForDate(selectedDate: Date) {
  return PLACEHOLDER_WORKOUTS.filter((w) => isSameDay(w.startedAt, selectedDate));
}
