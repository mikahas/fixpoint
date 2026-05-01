import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    component: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/components/route";
import { prisma } from "@/lib/prisma";

const now = new Date();
const makeComponent = (overrides: Record<string, unknown> = {}) => ({
  id: "c1",
  name: "Balcony floor",
  zoneId: "z1",
  decayRate: 2,
  lastCondition: 80,
  lastServicedAt: now,
  createdAt: now,
  ...overrides,
});

describe("GET /api/components", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all components with currentCondition attached", async () => {
    vi.mocked(prisma.component.findMany).mockResolvedValue([makeComponent()] as never);

    const res = await GET(new Request("http://localhost/api/components"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toHaveProperty("currentCondition");
  });

  it("filters by zoneId when provided", async () => {
    vi.mocked(prisma.component.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/components?zoneId=z1"));
    expect(vi.mocked(prisma.component.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { zoneId: "z1" } })
    );
  });

  it("passes no where clause when zoneId is absent", async () => {
    vi.mocked(prisma.component.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/components"));
    expect(vi.mocked(prisma.component.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    );
  });
});

describe("POST /api/components", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a component and returns 201", async () => {
    vi.mocked(prisma.component.create).mockResolvedValue(makeComponent() as never);

    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ name: "Balcony floor", zoneId: "z1", decayRate: 2 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Balcony floor");
    expect(body).toHaveProperty("currentCondition");
  });

  it("uses 100 as default initialCondition", async () => {
    vi.mocked(prisma.component.create).mockResolvedValue(makeComponent({ lastCondition: 100 }) as never);

    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ name: "Floor", zoneId: "z1", decayRate: 1 }),
    });
    await POST(req);
    expect(vi.mocked(prisma.component.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastCondition: 100 }) })
    );
  });

  it("uses provided initialCondition when given", async () => {
    vi.mocked(prisma.component.create).mockResolvedValue(makeComponent({ lastCondition: 75 }) as never);

    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ name: "Floor", zoneId: "z1", decayRate: 1, initialCondition: 75 }),
    });
    await POST(req);
    expect(vi.mocked(prisma.component.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastCondition: 75 }) })
    );
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ zoneId: "z1", decayRate: 2 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.component.create)).not.toHaveBeenCalled();
  });

  it("returns 400 when zoneId is missing", async () => {
    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ name: "Floor", decayRate: 2 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when decayRate is missing", async () => {
    const req = new Request("http://localhost/api/components", {
      method: "POST",
      body: JSON.stringify({ name: "Floor", zoneId: "z1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
