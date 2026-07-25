import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PlannerApp } from "@/components/planner/planner-app";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [categories, tasks] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const categoryDTOs = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }));

  const taskDTOs = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    done: t.done,
    start: t.start ? t.start.toISOString() : null,
    end: t.end ? t.end.toISOString() : null,
    allDay: t.allDay,
    categoryId: t.categoryId,
  }));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = session.user.name?.split(" ")[0] ?? "";

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/70 bg-card px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-lg text-primary-foreground">
            🌿
          </span>
          <div>
            <h1 className="font-heading text-lg font-semibold leading-tight text-foreground">
              Minha Rotina Organizada
            </h1>
            <p className="text-xs text-muted-foreground">
              {greeting}, {firstName} 🌱
            </p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Sair
          </Button>
        </form>
      </header>
      <PlannerApp initialCategories={categoryDTOs} initialTasks={taskDTOs} />
    </div>
  );
}
