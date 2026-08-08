"use client";

import { CategoryDTO, PRIORITY_COLOR, TaskDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  category,
  onClick,
}: {
  task: TaskDTO;
  category?: CategoryDTO;
  onClick: () => void;
}) {
  const color = category?.color ?? "#8A8F7A";

  return (
    <button
      type="button"
      onClick={onClick}
      className="fc-draggable-task flex w-full cursor-grab items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
      data-task-id={task.id}
      data-title={task.title}
      data-duration="01:00"
      title={task.title}
    >
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ backgroundColor: `${color}22`, color }}
      >
        ●
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold text-foreground",
            task.type === "ACTIVITY" &&
              task.done &&
              "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {category && (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${category.color}18`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              PRIORITY_COLOR[task.priority]
            )}
          >
            {task.priority === "HIGH"
              ? "Alta"
              : task.priority === "MEDIUM"
                ? "Média"
                : "Baixa"}
          </span>
        </div>
      </div>
    </button>
  );
}
