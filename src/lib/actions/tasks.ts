"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Priority, TaskType } from "@/generated/prisma/client";
import { TaskDTO } from "@/lib/types";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado.");
  return session.user.id;
}

// "yyyy-MM-dd" is parsed as UTC midnight by `new Date()`, which drifts a
// day off in local-time comparisons (e.g. UTC-3). Anchor it to local
// midnight instead so it round-trips correctly.
function localDateOnly(dateStr: string): Date {
  return dateStr.includes("T") ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
}

function toDTO(t: {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  priority: Priority;
  done: boolean;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  categoryId: string | null;
  recurringDaysOfWeek: number[];
  recurringUntil: Date | null;
  recurringExcludedDates: Date[];
}): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type,
    priority: t.priority,
    done: t.done,
    start: t.start ? t.start.toISOString() : null,
    end: t.end ? t.end.toISOString() : null,
    allDay: t.allDay,
    categoryId: t.categoryId,
    recurringDaysOfWeek: t.recurringDaysOfWeek,
    recurringUntil: t.recurringUntil ? t.recurringUntil.toISOString() : null,
    recurringExcludedDates: t.recurringExcludedDates.map((d) => d.toISOString()),
  };
}

export async function createTask(input: {
  title: string;
  description?: string;
  categoryId?: string | null;
  type?: TaskType;
  priority?: Priority;
  start?: string | null;
  end?: string | null;
  allDay?: boolean;
  recurringDaysOfWeek?: number[];
}): Promise<TaskDTO> {
  const userId = await requireUserId();

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      categoryId: input.categoryId || null,
      type: input.type ?? "ACTIVITY",
      priority: input.priority ?? "MEDIUM",
      start: input.start ? new Date(input.start) : null,
      end: input.end ? new Date(input.end) : null,
      allDay: input.allDay ?? false,
      recurringDaysOfWeek: input.recurringDaysOfWeek ?? [],
      userId,
    },
  });

  revalidatePath("/");
  return toDTO(task);
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    categoryId: string | null;
    type: TaskType;
    priority: Priority;
    start: string | null;
    end: string | null;
    allDay: boolean;
    done: boolean;
    recurringDaysOfWeek: number[];
    recurringUntil: string | null;
    recurringExcludedDates: string[];
  }>
): Promise<TaskDTO> {
  const userId = await requireUserId();

  const data: Record<string, unknown> = { ...input };
  if ("start" in input) data.start = input.start ? new Date(input.start) : null;
  if ("end" in input) data.end = input.end ? new Date(input.end) : null;
  if ("recurringUntil" in input) {
    data.recurringUntil = input.recurringUntil ? localDateOnly(input.recurringUntil) : null;
  }
  if ("recurringExcludedDates" in input) {
    data.recurringExcludedDates = (input.recurringExcludedDates ?? []).map(
      localDateOnly
    );
  }
  if ("done" in input) {
    data.completedAt = input.done ? new Date() : null;
  }

  await prisma.task.updateMany({
    where: { id, userId },
    data,
  });

  const task = await prisma.task.findUniqueOrThrow({ where: { id } });

  revalidatePath("/");
  return toDTO(task);
}

export async function scheduleTask(
  id: string,
  start: string,
  end: string,
  allDay = false
) {
  return updateTask(id, { start, end, allDay });
}

export async function unscheduleTask(id: string) {
  return updateTask(id, { start: null, end: null });
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();
  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}

// Skips a single occurrence of a recurring task, leaving every other
// occurrence (past and future) untouched.
export async function deleteTaskOccurrence(
  id: string,
  occurrenceDate: string
): Promise<TaskDTO> {
  const userId = await requireUserId();
  const task = await prisma.task.findFirstOrThrow({ where: { id, userId } });

  await prisma.task.update({
    where: { id },
    data: {
      recurringExcludedDates: [
        ...task.recurringExcludedDates,
        localDateOnly(occurrenceDate),
      ],
    },
  });

  const updated = await prisma.task.findUniqueOrThrow({ where: { id } });
  revalidatePath("/");
  return toDTO(updated);
}

// Stops the series at (and including) the given occurrence, keeping
// everything before it.
export async function deleteFutureOccurrences(
  id: string,
  fromDate: string
): Promise<TaskDTO> {
  return updateTask(id, { recurringUntil: fromDate });
}
