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
  const [mobileView, setMobileView] = useState<"tasks" | "calendar">("tasks");

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
    <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex shrink-0 gap-2 border-b border-border/70 bg-card p-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileView("tasks")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            mobileView === "tasks"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
        >
          Tarefas
        </button>
        <button
          type="button"
          onClick={() => setMobileView("calendar")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            mobileView === "calendar"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
        >
          Calendário
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden md:shrink-0 md:transition-[width] md:duration-300 md:ease-in-out",
          mobileView === "tasks" ? "flex-1" : "hidden",
          "md:flex md:flex-none",
          sidebarOpen ? "md:w-80" : "md:w-0"
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
        className="absolute top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-[left] duration-300 ease-in-out hover:text-foreground md:flex"
        style={{ left: sidebarOpen ? "312px" : "8px" }}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-3.5" />
        ) : (
          <PanelLeftOpen className="size-3.5" />
        )}
      </button>

      <div
        className={cn(
          "flex-1 overflow-hidden p-4",
          mobileView === "calendar" ? "block" : "hidden",
          "md:block"
        )}
      >
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
