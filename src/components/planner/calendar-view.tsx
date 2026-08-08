"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  type EventReceiveArg,
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import { CategoryDTO, TaskDTO } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

export function CalendarView({
  tasks,
  categories,
  onDropNewTask,
  onEventChange,
  onEventClick,
  onSelectSlot,
}: {
  tasks: TaskDTO[];
  categories: CategoryDTO[];
  onDropNewTask: (taskId: string, start: string, end: string, allDay: boolean) => void;
  onEventChange: (taskId: string, start: string, end: string, allDay: boolean) => void;
  onEventClick: (taskId: string) => void;
  onSelectSlot: (start: string, end: string, allDay: boolean) => void;
}) {
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const calendarRef = useRef<FullCalendar>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const events: EventInput[] = useMemo(
    () =>
      tasks
        .filter((t) => t.start)
        .map((t) => {
          const color = t.categoryId
            ? categoryById.get(t.categoryId)?.color
            : undefined;
          return {
            id: t.id,
            title: t.title,
            start: t.start!,
            end: t.end ?? undefined,
            allDay: t.allDay,
            backgroundColor: color ?? "#94a3b8",
            borderColor: color ?? "#94a3b8",
            extendedProps: { done: t.done },
          };
        }),
    [tasks, categoryById]
  );

  return (
    <div className="h-full rounded-3xl border bg-card p-3 shadow-sm [&_.fc]:h-full">
      <FullCalendar
        key={isMobile ? "mobile" : "desktop"}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: isMobile
            ? "dayGridMonth,timeGridDay"
            : "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{ today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
        locale={ptBrLocale}
        editable
        droppable
        selectable
        nowIndicator
        allDaySlot
        height="100%"
        expandRows
        scrollTime="07:00:00"
        slotMinTime="05:00:00"
        slotMaxTime="24:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        dayMaxEvents
        eventDisplay="block"
        events={events}
        eventContent={renderEventContent}
        eventReceive={(info: EventReceiveArg) => {
          const taskId = info.event.id;
          const start = info.event.start!;
          const end =
            info.event.end ??
            new Date(start.getTime() + 60 * 60 * 1000);
          const allDay = info.event.allDay;
          info.event.remove();
          onDropNewTask(taskId, start.toISOString(), end.toISOString(), allDay);
        }}
        eventDrop={(info: EventDropArg) => {
          const start = info.event.start!;
          const end = info.event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
          onEventChange(info.event.id, start.toISOString(), end.toISOString(), info.event.allDay);
        }}
        eventResize={(info: EventResizeDoneArg) => {
          const start = info.event.start!;
          const end = info.event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
          onEventChange(info.event.id, start.toISOString(), end.toISOString(), info.event.allDay);
        }}
        eventClick={(info: EventClickArg) => {
          onEventClick(info.event.id);
        }}
        select={(info: DateSelectArg) => {
          onSelectSlot(
            info.start.toISOString(),
            info.end.toISOString(),
            info.allDay
          );
          info.view.calendar.unselect();
        }}
      />
    </div>
  );
}

function renderEventContent(arg: EventContentArg) {
  const done = Boolean(arg.event.extendedProps.done);

  // Month cells are too short for a stacked layout, so keep those on one line.
  if (arg.view.type === "dayGridMonth") {
    return (
      <div
        className={`flex items-center gap-1 overflow-hidden px-1 py-0.5 text-xs font-medium ${done ? "opacity-60 line-through" : ""}`}
      >
        {done && <span>🌱</span>}
        <span className="truncate">{arg.event.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-col gap-0.5 overflow-hidden px-1.5 py-1 text-xs leading-tight ${done ? "opacity-60 line-through" : ""}`}
    >
      <span className="truncate font-semibold">
        {done && "🌱 "}
        {arg.event.title}
      </span>
      {arg.timeText && (
        <span className="truncate text-[11px] opacity-90">{arg.timeText}</span>
      )}
    </div>
  );
}
