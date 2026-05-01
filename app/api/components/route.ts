import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCondition } from "@/lib/condition";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get("zoneId");

  const components = await prisma.component.findMany({
    where: zoneId ? { zoneId } : undefined,
    orderBy: { createdAt: "asc" },
  });

  const result = components.map((c) => ({
    ...c,
    currentCondition: calculateCondition(
      c.lastCondition,
      c.lastServicedAt,
      c.decayRate
    ),
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { name, zoneId, decayRate, initialCondition } = await request.json();
  if (!name?.trim() || !zoneId || decayRate == null) {
    return NextResponse.json(
      { error: "name, zoneId, and decayRate are required" },
      { status: 400 }
    );
  }
  const component = await prisma.component.create({
    data: {
      name: name.trim(),
      zoneId,
      decayRate: Number(decayRate),
      lastCondition: initialCondition != null ? Number(initialCondition) : 100,
    },
  });
  return NextResponse.json(
    {
      ...component,
      currentCondition: calculateCondition(
        component.lastCondition,
        component.lastServicedAt,
        component.decayRate
      ),
    },
    { status: 201 }
  );
}
