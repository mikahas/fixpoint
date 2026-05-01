import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    component: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from "@/app/api/components/[id]/route";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const now = new Date();
const mockComponent = {
  id: "c1",
  name: "Balcony floor",
  zoneId: "z1",
  decayRate: 2,
  lastCondition: 80,
  lastServicedAt: now,
  createdAt: now,
  actions: [],
};

describe("GET /api/components/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns component with currentCondition", async () => {
    vi.mocked(prisma.component.findUnique).mockResolvedValue(mockComponent as never);

    const res = await GET(new Request("http://localhost/api/components/c1"), params("c1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Balcony floor");
    expect(body).toHaveProperty("currentCondition");
    expect(typeof body.currentCondition).toBe("number");
  });

  it("returns 404 when component not found", async () => {
    vi.mocked(prisma.component.findUnique).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost/api/components/x"), params("x"));
    expect(res.status).toBe(404);
  });

  it("queries with actions included", async () => {
    vi.mocked(prisma.component.findUnique).mockResolvedValue(mockComponent as never);

    await GET(new Request("http://localhost/api/components/c1"), params("c1"));
    expect(vi.mocked(prisma.component.findUnique)).toHaveBeenCalledWith({
      where: { id: "c1" },
      include: { actions: true },
    });
  });
});

describe("PUT /api/components/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates name and decayRate", async () => {
    const updated = { ...mockComponent, name: "New name", decayRate: 3 };
    vi.mocked(prisma.component.update).mockResolvedValue(updated as never);

    const req = new Request("http://localhost/api/components/c1", {
      method: "PUT",
      body: JSON.stringify({ name: "New name", decayRate: 3 }),
    });
    const res = await PUT(req, params("c1"));
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.component.update)).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { name: "New name", decayRate: 3 },
    });
  });

  it("only updates fields that are provided", async () => {
    vi.mocked(prisma.component.update).mockResolvedValue(mockComponent as never);

    const req = new Request("http://localhost/api/components/c1", {
      method: "PUT",
      body: JSON.stringify({ decayRate: 5 }),
    });
    await PUT(req, params("c1"));
    const callData = vi.mocked(prisma.component.update).mock.calls[0][0].data;
    expect(callData).not.toHaveProperty("name");
    expect(callData).toHaveProperty("decayRate", 5);
  });
});

describe("DELETE /api/components/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the component and returns 204", async () => {
    vi.mocked(prisma.component.delete).mockResolvedValue({} as never);

    const res = await DELETE(new Request("http://localhost/api/components/c1"), params("c1"));
    expect(res.status).toBe(204);
    expect(vi.mocked(prisma.component.delete)).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
