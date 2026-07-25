# Minha Rotina Organizada

Sistema pessoal para organizar tarefas e a rotina do dia a dia: lista de
tarefas + calendário com horários (dia/semana/mês), onde você arrasta as
tarefas da lista para os horários do seu dia.

🔗 **Demo online:** https://sistema-organizacao-jade.vercel.app

> ⚠️ O deploy está no ar, mas **login e cadastro ainda não funcionam** nele:
> o app hoje usa um banco SQLite local, que não existe no ambiente da
> Vercel. Veja a seção [Banco de dados](#banco-de-dados) abaixo para o
> próximo passo.

## O que já está pronto

- Login/criar conta (só você acessa seus dados)
- Lista de tarefas (backlog) com categorias coloridas e prioridade
- Calendário com visão de Dia / Semana / Mês e horários (estilo Google
  Calendar)
- Arrastar tarefa da lista para o calendário para agendar
- Editar, mover, redimensionar e marcar tarefas como concluídas
- Criar novas categorias na hora

## Tecnologias

- [Next.js](https://nextjs.org/) 16 (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Prisma ORM](https://www.prisma.io/) (SQLite em desenvolvimento)
- [NextAuth](https://authjs.dev/) para autenticação
- [FullCalendar](https://fullcalendar.io/) para o calendário arrastável

## Como baixar o projeto

Clonando com Git:

```bash
git clone https://github.com/lhuanalee/sistema-organizacao.git
cd sistema-organizacao
```

Ou, se preferir sem usar Git: acesse o repositório em
[github.com/lhuanalee/sistema-organizacao](https://github.com/lhuanalee/sistema-organizacao),
clique em **Code → Download ZIP** e extraia o arquivo no seu computador.

## Como rodar localmente

```bash
npm install
npx prisma migrate dev   # cria o banco local (dev.db) e as tabelas
npm run dev
```

Depois abra [http://localhost:3000](http://localhost:3000) no navegador.
Na primeira vez, crie sua conta em "Criar conta".

Você também vai precisar de um arquivo `.env` na raiz do projeto com:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="qualquer-string-secreta-aleatoria"
```

## Banco de dados

Por enquanto os dados ficam num banco local (SQLite, arquivo `dev.db`) só
para desenvolvimento. Antes de publicar o sistema na internet de forma
totalmente funcional (login e tarefas realmente salvando, acesso também pelo
celular), precisamos:

1. Criar um banco de dados na nuvem (gratuito) via Vercel Marketplace
2. Trocar a configuração do Prisma para apontar pra esse banco
3. Fazer o deploy do site na Vercel

Isso é rápido de fazer quando você estiver pronta — é só avisar.

## Comandos úteis

```bash
npm run dev       # roda o site localmente
npm run build     # gera a versão de produção
npx prisma studio # abre uma interface visual pra ver os dados salvos
```
