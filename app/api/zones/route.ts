import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCondition } from "@/lib/condition";

export async function GET() {
  const zones = await prisma.zone.findMany({
    include: { components: true },
    orderBy: { createdAt: "asc" },
  });

  const result = zones.map((zone) => {
    const components = zone.components.map((c) => ({
      ...c,
      currentCondition: calculateCondition(
        c.lastCondition,
        c.lastServicedAt,
        c.decayRate
      ),
    }));
    const worstCondition =
      components.length > 0
        ? Math.min(...components.map((c) => c.currentCondition))
        : 100;
    return { ...zone, components, worstCondition };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const zone = await prisma.zone.create({ data: { name: name.trim() } });
  return NextResponse.json(zone, { status: 201 });
}
