import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCondition } from "@/lib/condition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const component = await prisma.component.findUnique({
    where: { id },
    include: { actions: true },
  });
  if (!component) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...component,
    currentCondition: calculateCondition(
      component.lastCondition,
      component.lastServicedAt,
      component.decayRate
    ),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, decayRate } = await request.json();
  const component = await prisma.component.update({
    where: { id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(decayRate != null ? { decayRate: Number(decayRate) } : {}),
    },
  });
  return NextResponse.json(component);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.component.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
