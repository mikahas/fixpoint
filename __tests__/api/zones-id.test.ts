import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    zone: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { GET, PUT, DELETE } from "@/app/api/zones/[id]/route";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/zones/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the zone", async () => {
    const mockZone = { id: "z1", name: "Kitchen", createdAt: new Date() };
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(mockZone as never);

    const res = await GET(new Request("http://localhost/api/zones/z1"), params("z1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Kitchen");
  });

  it("returns 404 when zone not found", async () => {
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost/api/zones/zX"), params("zX"));
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/zones/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates and returns the zone", async () => {
    const mockZone = { id: "z1", name: "Living Room", createdAt: new Date() };
    vi.mocked(prisma.zone.update).mockResolvedValue(mockZone as never);

    const req = new Request("http://localhost/api/zones/z1", {
      method: "PUT",
      body: JSON.stringify({ name: "Living Room" }),
    });
    const res = await PUT(req, params("z1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Living Room");
    expect(vi.mocked(prisma.zone.update)).toHaveBeenCalledWith({
      where: { id: "z1" },
      data: { name: "Living Room" },
    });
  });

  it("returns 400 for empty name", async () => {
    const req = new Request("http://localhost/api/zones/z1", {
      method: "PUT",
      body: JSON.stringify({ name: "  " }),
    });
    const res = await PUT(req, params("z1"));
    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.zone.update)).not.toHaveBeenCalled();
  });

  it("returns 400 for missing name", async () => {
    const req = new Request("http://localhost/api/zones/z1", {
      method: "PUT",
      body: JSON.stringify({}),
    });
    const res = await PUT(req, params("z1"));
    expect(res.status).toBe(400);
  });

  it("trims whitespace from the name", async () => {
    const mockZone = { id: "z1", name: "Kitchen", createdAt: new Date() };
    vi.mocked(prisma.zone.update).mockResolvedValue(mockZone as never);

    const req = new Request("http://localhost/api/zones/z1", {
      method: "PUT",
      body: JSON.stringify({ name: "  Kitchen  " }),
    });
    await PUT(req, params("z1"));
    expect(vi.mocked(prisma.zone.update)).toHaveBeenCalledWith({
      where: { id: "z1" },
      data: { name: "Kitchen" },
    });
  });
});

describe("DELETE /api/zones/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the zone and returns 204", async () => {
    vi.mocked(prisma.zone.delete).mockResolvedValue({} as never);

    const res = await DELETE(new Request("http://localhost/api/zones/z1"), params("z1"));
    expect(res.status).toBe(204);
    expect(vi.mocked(prisma.zone.delete)).toHaveBeenCalledWith({ where: { id: "z1" } });
  });
});
