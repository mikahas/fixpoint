import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    maintenanceAction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/actions/route";
import { prisma } from "@/lib/prisma";

const mockAction = { id: "a1", name: "Clean", componentId: "c1", conditionEffect: 20 };

describe("GET /api/actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all actions", async () => {
    vi.mocked(prisma.maintenanceAction.findMany).mockResolvedValue([mockAction] as never);

    const res = await GET(new Request("http://localhost/api/actions"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Clean");
  });

  it("filters by componentId when provided", async () => {
    vi.mocked(prisma.maintenanceAction.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/actions?componentId=c1"));
    expect(vi.mocked(prisma.maintenanceAction.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { componentId: "c1" } })
    );
  });

  it("passes no where clause when componentId is absent", async () => {
    vi.mocked(prisma.maintenanceAction.findMany).mockResolvedValue([]);

    await GET(new Request("http://localhost/api/actions"));
    expect(vi.mocked(prisma.maintenanceAction.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    );
  });
});

describe("POST /api/actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an action and returns 201", async () => {
    vi.mocked(prisma.maintenanceAction.create).mockResolvedValue(mockAction as never);

    const req = new Request("http://localhost/api/actions", {
      method: "POST",
      body: JSON.stringify({ name: "Clean", componentId: "c1", conditionEffect: 20 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Clean");
    expect(vi.mocked(prisma.maintenanceAction.create)).toHaveBeenCalledWith({
      data: { name: "Clean", componentId: "c1", conditionEffect: 20 },
    });
  });

  it("trims whitespace from action name", async () => {
    vi.mocked(prisma.maintenanceAction.create).mockResolvedValue(mockAction as never);

    const req = new Request("http://localhost/api/actions", {
      method: "POST",
      body: JSON.stringify({ name: "  Clean  ", componentId: "c1", conditionEffect: 20 }),
    });
    await POST(req);
    expect(vi.mocked(prisma.maintenanceAction.create)).toHaveBeenCalledWith({
      data: { name: "Clean", componentId: "c1", conditionEffect: 20 },
    });
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/actions", {
      method: "POST",
      body: JSON.stringify({ componentId: "c1", conditionEffect: 20 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.maintenanceAction.create)).not.toHaveBeenCalled();
  });

  it("returns 400 when componentId is missing", async () => {
    const req = new Request("http://localhost/api/actions", {
      method: "POST",
      body: JSON.stringify({ name: "Clean", conditionEffect: 20 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when conditionEffect is missing", async () => {
    const req = new Request("http://localhost/api/actions", {
      method: "POST",
      body: JSON.stringify({ name: "Clean", componentId: "c1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
