import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    logEntry: { create: vi.fn() },
    component: { update: vi.fn() },
  },
}));

import { POST } from "@/app/api/logs/route";
import { prisma } from "@/lib/prisma";

const mockLogEntry = {
  id: "l1",
  componentId: "c1",
  actionId: "a1",
  note: null,
  resultingCondition: 85,
  performedAt: new Date(),
  action: { id: "a1", name: "Clean", componentId: "c1", conditionEffect: 20 },
};

describe("POST /api/logs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a log entry in a transaction and returns 201", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([mockLogEntry, {}] as never);

    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", actionId: "a1", resultingCondition: 85 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.resultingCondition).toBe(85);
    expect(vi.mocked(prisma.$transaction)).toHaveBeenCalled();
  });

  it("passes note to the log entry create call", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([{ ...mockLogEntry, note: "Looks good" }, {}] as never);

    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", actionId: "a1", resultingCondition: 85, note: "Looks good" }),
    });
    await POST(req);
    expect(vi.mocked(prisma.logEntry.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ note: "Looks good" }) })
    );
  });

  it("trims whitespace-only note to null", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([mockLogEntry, {}] as never);

    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", actionId: "a1", resultingCondition: 85, note: "   " }),
    });
    await POST(req);
    expect(vi.mocked(prisma.logEntry.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ note: null }) })
    );
  });

  it("updates the component baseline in the same transaction", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([mockLogEntry, {}] as never);

    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", actionId: "a1", resultingCondition: 85 }),
    });
    await POST(req);
    expect(vi.mocked(prisma.component.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1" },
        data: expect.objectContaining({ lastCondition: 85 }),
      })
    );
  });

  it("returns 400 when componentId is missing", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ actionId: "a1", resultingCondition: 85 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.$transaction)).not.toHaveBeenCalled();
  });

  it("returns 400 when actionId is missing", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", resultingCondition: 85 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when resultingCondition is missing", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", actionId: "a1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
