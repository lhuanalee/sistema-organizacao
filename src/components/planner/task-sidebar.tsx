"use client";

import { useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/planner/task-card";
import { CategoryDTO, TaskDTO } from "@/lib/types";
import { Plus } from "lucide-react";

export function TaskSidebar({
  tasks,
  categories,
  activeCategoryId,
  onFilterCategory,
  onNewTask,
  onEditTask,
}: {
  tasks: TaskDTO[];
  categories: CategoryDTO[];
  activeCategoryId: string | "all";
  onFilterCategory: (id: string | "all") => void;
  onNewTask: () => void;
  onEditTask: (task: TaskDTO) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const draggable = new Draggable(containerRef.current, {
      itemSelector: ".fc-draggable-task",
      eventData: (el) => ({
        id: el.dataset.taskId,
        title: el.dataset.title,
        duration: el.dataset.duration,
        create: true,
      }),
    });
    return () => draggable.destroy();
  }, []);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <aside className="flex h-full w-full shrink-0 flex-col gap-3 overflow-hidden border-border/70 bg-sidebar p-4 md:w-80 md:border-r">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">
          🍃 Lista de tarefas
        </h2>
        <Button
          size="sm"
          onClick={onNewTask}
          className="rounded-full shadow-sm"
        >
          <Plus className="mr-1 size-4" /> Nova
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFilterCategory("all")}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            activeCategoryId === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onFilterCategory(c.id)}
            className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
            style={
              activeCategoryId === c.id
                ? { backgroundColor: c.color, color: "white" }
                : { backgroundColor: `${c.color}20`, color: c.color }
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Arraste uma tarefa para o calendário para agendar, ou clique para
        editar.
      </p>

      <div ref={containerRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto pb-4">
        {tasks.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="text-3xl">🌱</span>
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa pendente.
              <br />
              Clique em &quot;Nova&quot; para começar.
            </p>
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={
              task.categoryId ? categoryById.get(task.categoryId) : undefined
            }
            onClick={() => onEditTask(task)}
          />
        ))}
      </div>
    </aside>
  );
}
