import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const balcony = await prisma.zone.create({ data: { name: "Balcony" } });
  const kitchen = await prisma.zone.create({ data: { name: "Kitchen" } });
  const hallway = await prisma.zone.create({ data: { name: "Hallway" } });

  const floor = await prisma.component.create({
    data: {
      name: "Balcony floor",
      zoneId: balcony.id,
      decayRate: 0.5,
      lastCondition: 72,
      lastServicedAt: new Date(Date.now() - 30 * 86_400_000),
    },
  });

  const railing = await prisma.component.create({
    data: {
      name: "Railing",
      zoneId: balcony.id,
      decayRate: 0.3,
      lastCondition: 90,
      lastServicedAt: new Date(Date.now() - 14 * 86_400_000),
    },
  });

  const drain = await prisma.component.create({
    data: {
      name: "Drain",
      zoneId: kitchen.id,
      decayRate: 2,
      lastCondition: 100,
      lastServicedAt: new Date(Date.now() - 20 * 86_400_000),
    },
  });

  const exhaust = await prisma.component.create({
    data: {
      name: "Exhaust filter",
      zoneId: kitchen.id,
      decayRate: 1.5,
      lastCondition: 100,
      lastServicedAt: new Date(Date.now() - 45 * 86_400_000),
    },
  });

  const doorHinges = await prisma.component.create({
    data: {
      name: "Door hinges",
      zoneId: hallway.id,
      decayRate: 0.2,
      lastCondition: 85,
      lastServicedAt: new Date(Date.now() - 60 * 86_400_000),
    },
  });

  const treatFloor = await prisma.maintenanceAction.create({
    data: { name: "Apply wood treatment", componentId: floor.id, conditionEffect: 30 },
  });

  await prisma.maintenanceAction.create({
    data: { name: "Sand and re-oil", componentId: floor.id, conditionEffect: 50 },
  });

  await prisma.maintenanceAction.create({
    data: { name: "Touch up paint", componentId: railing.id, conditionEffect: 20 },
  });

  const cleanDrain = await prisma.maintenanceAction.create({
    data: { name: "Clear drain", componentId: drain.id, conditionEffect: 100 },
  });

  await prisma.maintenanceAction.create({
    data: { name: "Replace filter", componentId: exhaust.id, conditionEffect: 100 },
  });

  await prisma.maintenanceAction.create({
    data: { name: "Oil hinges", componentId: doorHinges.id, conditionEffect: 25 },
  });

  await prisma.logEntry.create({
    data: {
      componentId: floor.id,
      actionId: treatFloor.id,
      note: "Used teak oil, two coats.",
      resultingCondition: 72,
      performedAt: new Date(Date.now() - 30 * 86_400_000),
    },
  });

  await prisma.logEntry.create({
    data: {
      componentId: drain.id,
      actionId: cleanDrain.id,
      note: "Used drain unblocker.",
      resultingCondition: 100,
      performedAt: new Date(Date.now() - 20 * 86_400_000),
    },
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
