"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Priority } from "@/generated/prisma/client";
import { TaskDTO } from "@/lib/types";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado.");
  return session.user.id;
}

function toDTO(t: {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  done: boolean;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  categoryId: string | null;
}): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    done: t.done,
    start: t.start ? t.start.toISOString() : null,
    end: t.end ? t.end.toISOString() : null,
    allDay: t.allDay,
    categoryId: t.categoryId,
  };
}

export async function createTask(input: {
  title: string;
  description?: string;
  categoryId?: string | null;
  priority?: Priority;
  start?: string | null;
  end?: string | null;
  allDay?: boolean;
}): Promise<TaskDTO> {
  const userId = await requireUserId();

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      categoryId: input.categoryId || null,
      priority: input.priority ?? "MEDIUM",
      start: input.start ? new Date(input.start) : null,
      end: input.end ? new Date(input.end) : null,
      allDay: input.allDay ?? false,
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
    priority: Priority;
    start: string | null;
    end: string | null;
    allDay: boolean;
    done: boolean;
  }>
): Promise<TaskDTO> {
  const userId = await requireUserId();

  const data: Record<string, unknown> = { ...input };
  if ("start" in input) data.start = input.start ? new Date(input.start) : null;
  if ("end" in input) data.end = input.end ? new Date(input.end) : null;
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
