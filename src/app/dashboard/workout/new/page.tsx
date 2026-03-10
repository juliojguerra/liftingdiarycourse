import { NewWorkoutForm } from "./NewWorkoutForm";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewWorkoutPage({ searchParams }: Props) {
  const { date } = await searchParams;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Log a workout
      </h1>
      <NewWorkoutForm defaultDate={date} />
    </main>
  );
}
