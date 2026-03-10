import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();

  if (!userId) return null;

  const id = Number(workoutId);
  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(id, userId);
  if (!workout) notFound();

  const defaultDate = workout.startedAt.toISOString().split("T")[0];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Edit workout
      </h1>
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name}
        defaultDate={defaultDate}
      />
    </main>
  );
}
