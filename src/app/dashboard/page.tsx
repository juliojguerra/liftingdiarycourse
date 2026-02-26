import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForUser } from "@/data/workouts";
import { WorkoutCalendar } from "./WorkoutCalendar";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const workouts = await getWorkoutsForUser(userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <WorkoutCalendar workouts={workouts} />
    </main>
  );
}
