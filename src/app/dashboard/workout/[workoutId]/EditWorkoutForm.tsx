"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWorkout } from "./actions";

type Props = {
  workoutId: number;
  defaultName: string;
  defaultDate: string;
};

export function EditWorkoutForm({ workoutId, defaultName, defaultDate }: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  // TODO(human): Implement handleSubmit.
  // This async function should:
  //   1. Prevent default form submission with e.preventDefault()
  //   2. Set isPending to true
  //   3. Read "name", "startedAt", and "notes" from FormData
  //   4. Call updateWorkout({ workoutId, name, startedAt: new Date(`${startedAt}T00:00:00`), notes })
  //   5. If result.error → setErrors and setIsPending(false)
  //   6. If result.data → navigate to `/dashboard?date=${result.data.date}`
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // your implementation here
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Workout name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Upper body push"
              defaultValue={defaultName}
              required
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startedAt">Date</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              defaultValue={defaultDate}
              required
            />
            {errors.startedAt && (
              <p className="text-sm text-destructive">{errors.startedAt[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="How did it go?"
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes[0]}</p>
            )}
          </div>

          {errors._root && (
            <p className="text-sm text-destructive">{errors._root[0]}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
