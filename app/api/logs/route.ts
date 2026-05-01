import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCondition } from "@/lib/condition";

export async function POST(request: Request) {
  const { componentId, actionId, note, resultingCondition } =
    await request.json();

  if (!componentId || !actionId || resultingCondition == null) {
    return NextResponse.json(
      { error: "componentId, actionId, and resultingCondition are required" },
      { status: 400 }
    );
  }

  const [logEntry] = await prisma.$transaction([
    prisma.logEntry.create({
      data: {
        componentId,
        actionId,
        note: note?.trim() || null,
        resultingCondition: Number(resultingCondition),
      },
      include: { action: true },
    }),
    prisma.component.update({
      where: { id: componentId },
      data: {
        lastCondition: Number(resultingCondition),
        lastServicedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json(logEntry, { status: 201 });
}
