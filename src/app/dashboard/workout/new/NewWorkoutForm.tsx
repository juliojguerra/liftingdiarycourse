"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWorkout } from "./actions";

export function NewWorkoutForm({ defaultDate }: { defaultDate?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const data = new FormData(e.currentTarget);
    const result = await createWorkout({
      name: data.get("name") as string,
      startedAt: new Date(`${data.get("startedAt")}T00:00:00`),
      notes: (data.get("notes") as string) || undefined,
    });
    if (result?.error) {
      setErrors(result.error as Record<string, string[]>);
      setIsPending(false);
    } else if (result?.data) {
      router.push(`/dashboard?date=${result.data.date}`);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Workout name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Upper body push"
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
              defaultValue={defaultDate ?? new Date().toISOString().split("T")[0]}
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
              {isPending ? "Saving…" : "Create workout"}
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
