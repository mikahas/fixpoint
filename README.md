# Fixpoint

A home maintenance tracking app that models your house as a collection of components that degrade over time. Log maintenance to restore condition and see what needs attention at a glance.

## How it works

Components have a **condition score (0–100)** that decays at a configurable rate (points per day). When you log a maintenance action, the condition is restored and the decay clock resets. The dashboard surfaces components that need attention rather than presenting a static to-do list.

**Condition status:**
- Green (≥ 70) — good
- Yellow (≥ 40) — warning
- Red (< 40) — critical

## Data model

```
Zone              — area of the home (e.g. Kitchen, Balcony, Hallway)
Component         — physical element within a zone (e.g. Door hinges, Floor tiles)
MaintenanceAction — action that can be applied to a component (e.g. Oil hinges, Reseal grout)
LogEntry          — recorded maintenance event with resulting condition and optional note
```

## Tech stack

- **Next.js 16** (App Router) with React Server Components
- **Prisma 7** + SQLite via `@prisma/adapter-better-sqlite3`
- **Tailwind CSS v4**
- **TypeScript** (strict)

## Getting started

```bash
npm install
npm run db:seed      # populate sample zones, components, and history
npm run dev          # start dev server at http://localhost:3000
```

## Common commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run db:seed      # seed database with sample data
npx prisma migrate dev --name <name>   # apply schema changes
npx prisma generate                    # regenerate client after schema changes
```

## Project structure

```
app/
  page.tsx                      # Dashboard — zone grid + needs-attention list
  zones/[id]/page.tsx           # Zone view — component cards
  components/[id]/page.tsx      # Component detail — condition, actions, log history
  api/                          # REST API routes (zones, components, actions, logs)
  generated/prisma/             # Prisma-generated client (do not edit)

components/                     # React components (Server + Client)
lib/
  prisma.ts                     # Prisma singleton with SQLite adapter
  condition.ts                  # calculateCondition, status helpers, color helpers
types/
  index.ts                      # TypeScript interfaces
prisma/
  schema.prisma                 # Database schema
  seed.ts                       # Sample data
  dev.db                        # SQLite database file
```
