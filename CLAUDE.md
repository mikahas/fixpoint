@AGENTS.md

# Fixpoint — Home Maintenance Tracking System

A web application that models a house as a collection of components that degrade over time. Users log maintenance actions to restore component condition and track the history of work done.

## Core Concept

Components have a numeric condition (0–100) that decreases over time at a configurable decay rate. Logging a maintenance action records the resulting condition and resets the decay clock. The UI surfaces components that need attention rather than presenting a to-do list.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 18 (Server + Client Components) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript (strict) |
| ORM | Prisma 7 |
| Database | SQLite via `@prisma/adapter-better-sqlite3` |
| Runtime | Node.js |

## Critical: Prisma 7 Setup

Prisma 7 uses a WASM-based query compiler and **does not** read `DATABASE_URL` automatically. The client must be instantiated with an explicit driver adapter:

```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter } as never);
```

- The generated client lives at `app/generated/prisma/client` (not `@prisma/client`)
- The `{ url }` config keeps the `file:` prefix — the adapter strips it internally
- The singleton is in `lib/prisma.ts`
- `prisma.config.ts` is only used by the Prisma CLI, not at runtime

## Data Models

```
Zone           — area of the home (Kitchen, Balcony, Hallway)
Component      — physical element (Balcony floor, Door hinges)
                 fields: name, zoneId, decayRate (pts/day), lastCondition, lastServicedAt
MaintenanceAction — action that can be applied to a component
                 fields: name, componentId, conditionEffect (+pts)
LogEntry       — recorded maintenance event
                 fields: componentId, actionId, note?, resultingCondition, performedAt
```

## Condition Logic (`lib/condition.ts`)

```ts
calculateCondition(lastCondition, lastServicedAt, decayRate)
// = clamp(0, 100, lastCondition - daysSince * decayRate)

conditionStatus(n)  // → "good" (≥70) | "warning" (≥40) | "critical" (<40)
conditionColor(status)   // → Tailwind bg-* class
conditionTextColor(status) // → Tailwind text-* class
```

Condition is always **computed dynamically at query time** — never stored as a pre-calculated value. After a log entry is written, `component.lastCondition` and `lastServicedAt` are updated in the same transaction to serve as the new baseline.

## Project Structure

```
app/
  layout.tsx                    # Root layout — dark zinc theme, top nav
  page.tsx                      # Dashboard (RSC) — zone grid + needs-attention list
  zones/[id]/page.tsx           # Zone view (RSC) — component cards
  components/[id]/page.tsx      # Component detail (RSC) — condition, actions, history
  api/
    zones/route.ts              # GET all, POST create
    zones/[id]/route.ts         # GET, PUT, DELETE
    components/route.ts         # GET (filter by zoneId), POST create
    components/[id]/route.ts    # GET, PUT, DELETE
    actions/route.ts            # GET (filter by componentId), POST create
    actions/[id]/route.ts       # DELETE
    logs/route.ts               # POST — creates log entry + updates component in one tx
    logs/[componentId]/route.ts # GET history for one component
  generated/prisma/             # Prisma-generated client (do not edit)

components/
  ConditionBar.tsx       # Server — horizontal bar, color-coded
  ZoneCard.tsx           # Server — zone summary card with worst-condition status
  ComponentCard.tsx      # Server — component card with condition bar
  LogActionButton.tsx    # Client — button that opens LogActionModal
  LogActionModal.tsx     # Client — log maintenance form: action, note, condition preview
  AddZoneForm.tsx        # Client — inline form to create a zone
  AddComponentForm.tsx   # Client — inline form to create a component
  AddActionForm.tsx      # Client — inline form to define a maintenance action

lib/
  prisma.ts              # Prisma singleton (adapter-based, see above)
  condition.ts           # calculateCondition, conditionStatus, color helpers

types/
  index.ts               # TypeScript interfaces for all entities + ComponentWithCondition

prisma/
  schema.prisma          # Schema definition (no url in datasource — provided via adapter)
  seed.ts                # Seed: Balcony, Kitchen, Hallway with components + log history
  dev.db                 # SQLite database file
```

## React Component Pattern

Pages (`app/**/*.tsx`) are **React Server Components** — they call Prisma directly, no `fetch`, no `'use client'`.

Interactive components that mutate state or handle user events are **Client Components** — they have `'use client'` at the top, call `/api/*` routes via `fetch`, and call `router.refresh()` after a successful mutation to re-sync server-rendered data.

## Common Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run db:seed      # Seed database with sample data
npx prisma migrate dev --name <name>   # Apply schema changes
npx prisma generate  # Regenerate client after schema changes
```

## Visual Design

- Background: `bg-zinc-950`, cards: `bg-zinc-900 border border-zinc-800`
- Condition numbers use `font-mono`
- Status colors: green (≥70%), yellow (≥40%), red (<40%)
- "System monitor" aesthetic — data-dense, dark, minimal chrome
