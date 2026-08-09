export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskType = "ACTIVITY" | "COMMITMENT";

export interface CategoryDTO {
  id: string;
  name: string;
  color: string;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  priority: Priority;
  done: boolean;
  start: string | null;
  end: string | null;
  allDay: boolean;
  categoryId: string | null;
  recurringDaysOfWeek: number[];
  recurringUntil: string | null;
  recurringExcludedDates: string[];
}

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  ACTIVITY: "Atividade",
  COMMITMENT: "Compromisso",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
};
