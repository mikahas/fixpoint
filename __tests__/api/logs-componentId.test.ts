import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    logEntry: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/logs/[componentId]/route";
import { prisma } from "@/lib/prisma";

const params = (componentId: string) => ({ params: Promise.resolve({ componentId }) });
const mockLog = {
  id: "l1",
  componentId: "c1",
  actionId: "a1",
  note: null,
  resultingCondition: 85,
  performedAt: new Date(),
  action: { id: "a1", name: "Clean", componentId: "c1", conditionEffect: 20 },
};

describe("GET /api/logs/[componentId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns logs for the component", async () => {
    vi.mocked(prisma.logEntry.findMany).mockResolvedValue([mockLog] as never);

    const res = await GET(new Request("http://localhost/api/logs/c1"), params("c1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].resultingCondition).toBe(85);
  });

  it("queries by componentId with action included", async () => {
    vi.mocked(prisma.logEntry.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/logs/c1"), params("c1"));
    expect(vi.mocked(prisma.logEntry.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { componentId: "c1" },
        include: { action: true },
      })
    );
  });

  it("orders logs by performedAt descending", async () => {
    vi.mocked(prisma.logEntry.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/logs/c1"), params("c1"));
    expect(vi.mocked(prisma.logEntry.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { performedAt: "desc" } })
    );
  });

  it("returns empty array when no logs exist", async () => {
    vi.mocked(prisma.logEntry.findMany).mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/logs/c1"), params("c1"));
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
