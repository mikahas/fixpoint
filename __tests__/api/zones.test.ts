import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    zone: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/zones/route";
import { prisma } from "@/lib/prisma";

describe("POST /api/zones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a zone and returns 201", async () => {
    const mockZone = { id: "z1", name: "Kitchen", createdAt: new Date() };
    vi.mocked(prisma.zone.create).mockResolvedValue(mockZone as never);

    const req = new Request("http://localhost/api/zones", {
      method: "POST",
      body: JSON.stringify({ name: "Kitchen" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Kitchen");
    expect(vi.mocked(prisma.zone.create)).toHaveBeenCalledWith({
      data: { name: "Kitchen" },
    });
  });

  it("returns 400 when name is an empty string", async () => {
    const req = new Request("http://localhost/api/zones", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.zone.create)).not.toHaveBeenCalled();
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/zones", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
