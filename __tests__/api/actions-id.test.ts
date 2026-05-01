import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    maintenanceAction: {
      delete: vi.fn(),
    },
  },
}));

import { DELETE } from "@/app/api/actions/[id]/route";
import { prisma } from "@/lib/prisma";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("DELETE /api/actions/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the action and returns 204", async () => {
    vi.mocked(prisma.maintenanceAction.delete).mockResolvedValue({} as never);

    const res = await DELETE(new Request("http://localhost/api/actions/a1"), params("a1"));
    expect(res.status).toBe(204);
    expect(vi.mocked(prisma.maintenanceAction.delete)).toHaveBeenCalledWith({
      where: { id: "a1" },
    });
  });
});
