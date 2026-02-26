"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayButton } from "react-day-picker";
import type { WorkoutWithExercises } from "@/data/workouts";

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

type Props = {
  workouts: WorkoutWithExercises[];
};

export function WorkoutCalendar({ workouts }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const workoutDates = workouts.map((w) => w.startedAt);
  const workoutsForDate = workouts.filter((w) =>
    isSameDay(w.startedAt, selectedDate)
  );

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
      {/* Date Picker */}
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Viewing workouts for
        </p>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 sm:w-auto"
            >
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
              modifiers={{ hasWorkout: workoutDates }}
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
            <p className="text-sm">
              No workouts on {format(selectedDate, "do MMM yyyy")}
            </p>
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
                        <li
                          key={exercise}
                          className="text-sm text-muted-foreground"
                        >
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
    </div>
  );
}
