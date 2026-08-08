import Link from "next/link";
import { PlannerApp } from "@/components/planner/planner-app";
import { CategoryDTO, TaskDTO } from "@/lib/types";

// Seed dates are computed relative to "now", so this page must render
// per-request instead of being frozen into a static build-time snapshot.
export const dynamic = "force-dynamic";

function atDay(offsetDays: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const demoCategories: CategoryDTO[] = [
  { id: "cat-trabalho", name: "Trabalho", color: "#6B93B0" },
  { id: "cat-saude", name: "Saúde", color: "#6B9B6E" },
  { id: "cat-casa", name: "Casa", color: "#D6A73B" },
  { id: "cat-pessoal", name: "Pessoal", color: "#9E86B4" },
];

const demoTasks: TaskDTO[] = [
  {
    id: "demo-task-1",
    title: "Reunião de equipe",
    description: "Alinhamento semanal com o time.",
    priority: "HIGH",
    done: false,
    start: atDay(0, 9, 0),
    end: atDay(0, 10, 0),
    allDay: false,
    categoryId: "cat-trabalho",
  },
  {
    id: "demo-task-2",
    title: "Academia",
    description: null,
    priority: "MEDIUM",
    done: false,
    start: atDay(0, 18, 0),
    end: atDay(0, 19, 0),
    allDay: false,
    categoryId: "cat-saude",
  },
  {
    id: "demo-task-3",
    title: "Supermercado",
    description: "Comprar itens da semana.",
    priority: "LOW",
    done: false,
    start: atDay(1, 17, 0),
    end: atDay(1, 18, 0),
    allDay: false,
    categoryId: "cat-casa",
  },
  {
    id: "demo-task-4",
    title: "Consulta médica",
    description: null,
    priority: "HIGH",
    done: false,
    start: atDay(2, 14, 0),
    end: atDay(2, 15, 0),
    allDay: false,
    categoryId: "cat-saude",
  },
  {
    id: "demo-task-5",
    title: "Ler 20 páginas",
    description: null,
    priority: "LOW",
    done: true,
    start: atDay(0, 21, 0),
    end: atDay(0, 21, 30),
    allDay: false,
    categoryId: "cat-pessoal",
  },
  {
    id: "demo-task-6",
    title: "Organizar planilha de gastos",
    description: null,
    priority: "MEDIUM",
    done: false,
    start: null,
    end: null,
    allDay: false,
    categoryId: "cat-casa",
  },
  {
    id: "demo-task-7",
    title: "Ligar para o dentista",
    description: null,
    priority: "LOW",
    done: false,
    start: null,
    end: null,
    allDay: false,
    categoryId: "cat-pessoal",
  },
];

export default function DemoPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-lg text-primary-foreground">
            🌿
          </span>
          <div>
            <h1 className="font-heading text-lg font-semibold leading-tight text-foreground">
              Minha Rotina Organizada
            </h1>
            <p className="text-xs text-muted-foreground">
              Modo demonstração — mexa à vontade, nada aqui é salvo de verdade
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/lhuanalee/sistema-organizacao"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Baixar projeto no GitHub
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Entrar
          </Link>
        </div>
      </header>
      <PlannerApp
        initialCategories={demoCategories}
        initialTasks={demoTasks}
        demo
      />
    </div>
  );
}
