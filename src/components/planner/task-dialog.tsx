"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryDTO,
  Priority,
  PRIORITY_LABEL,
  TaskDTO,
  TaskType,
  TASK_TYPE_LABEL,
} from "@/lib/types";
import {
  createTask,
  deleteFutureOccurrences,
  deleteTask,
  deleteTaskOccurrence,
  updateTask,
} from "@/lib/actions/tasks";
import { createCategory } from "@/lib/actions/categories";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6B93B0",
  "#C97D5D",
  "#D6A73B",
  "#6B9B6E",
  "#9E86B4",
  "#B5765F",
  "#5B9C8F",
];

// Index = JS Date.getDay() / FullCalendar daysOfWeek (0 = Domingo).
const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function TaskDialog({
  open,
  onOpenChange,
  task,
  occurrenceDate,
  initialSchedule,
  categories,
  demo = false,
  onCreated,
  onUpdated,
  onDeleted,
  onCategoryCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDTO | null;
  occurrenceDate?: string | null;
  initialSchedule?: { start: string; end: string } | null;
  categories: CategoryDTO[];
  demo?: boolean;
  onCreated: (task: TaskDTO) => void;
  onUpdated: (task: TaskDTO) => void;
  onDeleted: (id: string) => void;
  onCategoryCreated: (category: CategoryDTO) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TaskDialogForm
            key={task?.id ?? "new"}
            task={task}
            occurrenceDate={occurrenceDate ?? null}
            initialSchedule={initialSchedule ?? null}
            categories={categories}
            demo={demo}
            onOpenChange={onOpenChange}
            onCreated={onCreated}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
            onCategoryCreated={onCategoryCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskDialogForm({
  task,
  occurrenceDate,
  initialSchedule,
  categories,
  demo,
  onOpenChange,
  onCreated,
  onUpdated,
  onDeleted,
  onCategoryCreated,
}: {
  task: TaskDTO | null;
  occurrenceDate: string | null;
  initialSchedule: { start: string; end: string } | null;
  categories: CategoryDTO[];
  demo: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (task: TaskDTO) => void;
  onUpdated: (task: TaskDTO) => void;
  onDeleted: (id: string) => void;
  onCategoryCreated: (category: CategoryDTO) => void;
}) {
  const scheduledStart = task?.start
    ? new Date(task.start)
    : initialSchedule
      ? new Date(initialSchedule.start)
      : null;
  const scheduledEnd = task?.end
    ? new Date(task.end)
    : initialSchedule
      ? new Date(initialSchedule.end)
      : scheduledStart;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [type, setType] = useState<TaskType>(task?.type ?? "ACTIVITY");
  const [categoryId, setCategoryId] = useState<string>(
    task?.categoryId ?? "none"
  );
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "MEDIUM");
  const [scheduled, setScheduled] = useState(Boolean(scheduledStart));
  const [date, setDate] = useState(
    format(scheduledStart ?? new Date(), "yyyy-MM-dd")
  );
  const [startTime, setStartTime] = useState(
    scheduledStart ? format(scheduledStart, "HH:mm") : "09:00"
  );
  const [endTime, setEndTime] = useState(
    scheduledEnd ? format(scheduledEnd, "HH:mm") : "10:00"
  );
  const [recurring, setRecurring] = useState(
    (task?.recurringDaysOfWeek.length ?? 0) > 0
  );
  const [recurringDays, setRecurringDays] = useState<number[]>(
    task?.recurringDaysOfWeek ?? []
  );
  const [done, setDone] = useState(task?.done ?? false);
  const [saving, setSaving] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);
  const [deleteMode, setDeleteMode] = useState(false);

  const isRecurring = (task?.recurringDaysOfWeek.length ?? 0) > 0;
  const occurrenceDateStr = format(
    occurrenceDate ? new Date(occurrenceDate) : (scheduledStart ?? new Date()),
    "yyyy-MM-dd"
  );

  function toggleRecurringDay(day: number) {
    setRecurringDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort()
    );
  }

  const canSave = title.trim().length > 0 && (!recurring || recurringDays.length > 0);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const start = scheduled ? new Date(`${date}T${startTime}:00`) : null;
      const end = scheduled ? new Date(`${date}T${endTime}:00`) : null;

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId === "none" ? null : categoryId,
        type,
        priority,
        start: start ? start.toISOString() : null,
        end: end ? end.toISOString() : null,
        allDay: false,
        recurringDaysOfWeek: scheduled && recurring ? recurringDays : [],
      };

      const effectiveDone = type === "ACTIVITY" ? done : false;

      if (task) {
        const updated = demo
          ? {
              ...task,
              ...payload,
              description: payload.description ?? null,
              done: effectiveDone,
            }
          : await updateTask(task.id, { ...payload, done: effectiveDone });
        onUpdated(updated);
      } else {
        const created = demo
          ? {
              ...payload,
              id: crypto.randomUUID(),
              description: payload.description ?? null,
              done: false,
              recurringUntil: null,
              recurringExcludedDates: [],
            }
          : await createTask(payload);
        onCreated(created);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAll() {
    if (!task) return;
    setSaving(true);
    try {
      if (!demo) await deleteTask(task.id);
      onDeleted(task.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOccurrence() {
    if (!task) return;
    setSaving(true);
    try {
      const updated = demo
        ? {
            ...task,
            recurringExcludedDates: [
              ...task.recurringExcludedDates,
              `${occurrenceDateStr}T00:00:00`,
            ],
          }
        : await deleteTaskOccurrence(task.id, occurrenceDateStr);
      onUpdated(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFuture() {
    if (!task) return;
    setSaving(true);
    try {
      const updated = demo
        ? { ...task, recurringUntil: `${occurrenceDateStr}T00:00:00` }
        : await deleteFutureOccurrences(task.id, occurrenceDateStr);
      onUpdated(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const category = demo
      ? { id: crypto.randomUUID(), name: newCategoryName.trim(), color: newCategoryColor }
      : await createCategory(newCategoryName.trim(), newCategoryColor);
    onCategoryCreated(category);
    setCategoryId(category.id);
    setNewCategoryName("");
    setAddingCategory(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Tipo</Label>
          <div className="flex gap-1.5">
            {(Object.keys(TASK_TYPE_LABEL) as TaskType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  if (t === "COMMITMENT") setDone(false);
                }}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {TASK_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {type === "ACTIVITY"
              ? "Uma tarefa para fazer — pode marcar como concluída."
              : "Um compromisso fixo (aula, evento, festa, ida a um lugar)."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "none")}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string | null) =>
                    !value || value === "none"
                      ? "Sem categoria"
                      : (categories.find((c) => c.id === value)?.name ??
                        "Sem categoria")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              className="text-left text-xs text-muted-foreground underline underline-offset-2"
              onClick={() => setAddingCategory((v) => !v)}
            >
              + nova categoria
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Prioridade</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority((v as Priority) ?? "MEDIUM")}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string | null) =>
                    PRIORITY_LABEL[(value as Priority) ?? "MEDIUM"]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {addingCategory && (
          <div className="flex items-end gap-2 rounded-lg border p-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Nome da categoria</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Saúde"
              />
            </div>
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategoryColor(c)}
                  className="size-6 rounded-full border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: newCategoryColor === c ? "#000" : "transparent",
                  }}
                />
              ))}
            </div>
            <Button type="button" size="sm" onClick={handleAddCategory}>
              Add
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="scheduled"
            checked={scheduled}
            onCheckedChange={(v) => setScheduled(Boolean(v))}
          />
          <Label htmlFor="scheduled">Agendar no calendário</Label>
        </div>

        {scheduled && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={recurring}
                onCheckedChange={(v) => setRecurring(Boolean(v))}
              />
              <Label htmlFor="recurring">Repete semanalmente</Label>
            </div>

            {recurring && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Dias da semana</Label>
                <div className="flex gap-1.5">
                  {WEEKDAY_LABELS.map((label, day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleRecurringDay(day)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        recurringDays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">
                  {recurring ? "A partir de" : "Data"}
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Início</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Fim</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {task && type === "ACTIVITY" && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="done"
              checked={done}
              onCheckedChange={(v) => setDone(Boolean(v))}
            />
            <Label htmlFor="done">Concluída</Label>
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center sm:justify-between">
        {task ? (
          isRecurring && deleteMode ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={handleDeleteOccurrence}
                disabled={saving}
              >
                Só esta
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={handleDeleteFuture}
                disabled={saving}
              >
                Esta e as próximas
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={handleDeleteAll}
                disabled={saving}
              >
                Todas
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2"
                onClick={() => setDeleteMode(false)}
              >
                cancelar
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => (isRecurring ? setDeleteMode(true) : handleDeleteAll())}
              disabled={saving}
            >
              Excluir
            </Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !canSave}>
            Salvar
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
