"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado.");
  return session.user.id;
}

export async function createCategory(name: string, color: string) {
  const userId = await requireUserId();
  const category = await prisma.category.create({
    data: { name, color, userId },
  });
  revalidatePath("/");
  return category;
}

export async function deleteCategory(id: string) {
  const userId = await requireUserId();
  await prisma.category.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}
