import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  const { componentId } = await params;
  const logs = await prisma.logEntry.findMany({
    where: { componentId },
    include: { action: true },
    orderBy: { performedAt: "desc" },
  });
  return NextResponse.json(logs);
}
