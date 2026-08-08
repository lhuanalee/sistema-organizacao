"use client";

import { useMemo, useState } from "react";
import { TaskSidebar } from "@/components/planner/task-sidebar";
import { CalendarView } from "@/components/planner/calendar-view";
import { TaskDialog } from "@/components/planner/task-dialog";
import { CategoryDTO, TaskDTO } from "@/lib/types";
import { scheduleTask, updateTask } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlannerApp({
  initialTasks,
  initialCategories,
  demo = false,
}: {
  initialTasks: TaskDTO[];
  initialCategories: CategoryDTO[];
  demo?: boolean;
}) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [newTaskSchedule, setNewTaskSchedule] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const backlog = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.start &&
          !t.done &&
          (categoryFilter === "all" || t.categoryId === categoryFilter)
      ),
    [tasks, categoryFilter]
  );

  const calendarTasks = useMemo(
    () =>
      tasks.filter(
        (t) => categoryFilter === "all" || t.categoryId === categoryFilter
      ),
    [tasks, categoryFilter]
  );

  function upsertTask(task: TaskDTO) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task];
    });
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleDropNewTask(
    taskId: string,
    start: string,
    end: string,
    allDay: boolean
  ) {
    try {
      if (demo) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) upsertTask({ ...task, start, end, allDay });
      } else {
        const updated = await scheduleTask(taskId, start, end, allDay);
        upsertTask(updated);
      }
      toast.success("Tarefa agendada!");
    } catch {
      toast.error("Não foi possível agendar a tarefa.");
    }
  }

  async function handleEventChange(
    taskId: string,
    start: string,
    end: string,
    allDay: boolean
  ) {
    try {
      if (demo) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) upsertTask({ ...task, start, end, allDay });
      } else {
        const updated = await updateTask(taskId, { start, end, allDay });
        upsertTask(updated);
      }
    } catch {
      toast.error("Não foi possível mover a tarefa.");
    }
  }

  function handleEventClick(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setNewTaskSchedule(null);
      setEditingTask(task);
      setDialogOpen(true);
    }
  }

  function handleSelectSlot(start: string, end: string, allDay: boolean) {
    const startDate = new Date(start);
    let endDate = new Date(end);

    if (allDay) {
      startDate.setHours(9, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    } else if (endDate.getTime() - startDate.getTime() < 15 * 60 * 1000) {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }

    setEditingTask(null);
    setNewTaskSchedule({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
    setDialogOpen(true);
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div
        className={cn(
          "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        <TaskSidebar
          tasks={backlog}
          categories={categories}
          activeCategoryId={categoryFilter}
          onFilterCategory={setCategoryFilter}
          onNewTask={() => {
            setEditingTask(null);
            setNewTaskSchedule(null);
            setDialogOpen(true);
          }}
          onEditTask={(task) => {
            setNewTaskSchedule(null);
            setEditingTask(task);
            setDialogOpen(true);
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? "Esconder lista de tarefas" : "Mostrar lista de tarefas"}
        className="absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-[left] duration-300 ease-in-out hover:text-foreground"
        style={{ left: sidebarOpen ? "312px" : "8px" }}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-3.5" />
        ) : (
          <PanelLeftOpen className="size-3.5" />
        )}
      </button>

      <div className="flex-1 overflow-hidden p-4">
        <CalendarView
          tasks={calendarTasks}
          categories={categories}
          onDropNewTask={handleDropNewTask}
          onEventChange={handleEventChange}
          onEventClick={handleEventClick}
          onSelectSlot={handleSelectSlot}
        />
      </div>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        demo={demo}
        task={editingTask}
        initialSchedule={newTaskSchedule}
        categories={categories}
        onCreated={upsertTask}
        onUpdated={upsertTask}
        onDeleted={removeTask}
        onCategoryCreated={(c) => setCategories((prev) => [...prev, c])}
      />
    </div>
  );
}
