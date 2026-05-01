import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const componentId = searchParams.get("componentId");

  const actions = await prisma.maintenanceAction.findMany({
    where: componentId ? { componentId } : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(actions);
}

export async function POST(request: Request) {
  const { name, componentId, conditionEffect } = await request.json();
  if (!name?.trim() || !componentId || conditionEffect == null) {
    return NextResponse.json(
      { error: "name, componentId, and conditionEffect are required" },
      { status: 400 }
    );
  }
  const action = await prisma.maintenanceAction.create({
    data: {
      name: name.trim(),
      componentId,
      conditionEffect: Number(conditionEffect),
    },
  });
  return NextResponse.json(action, { status: 201 });
}
