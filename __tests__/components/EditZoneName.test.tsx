// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditZoneName from "@/components/EditZoneName";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("EditZoneName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("renders the zone name as a heading", () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    expect(screen.getByRole("heading", { name: "Balcony" })).toBeInTheDocument();
  });

  it("shows an edit button", () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    expect(screen.getByRole("button", { name: /edit zone name/i })).toBeInTheDocument();
  });

  it("switches to an input with the current name when edit button is clicked", () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Balcony");
  });

  it("calls PUT /api/zones/[id] and router.refresh on Enter with a new name", async () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Living Room" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/zones/z1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Living Room" }),
        })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("hides the input and restores the heading after saving", async () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  it("cancels on Escape without calling PUT", () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Something else" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Balcony" })).toBeInTheDocument();
  });

  it("does not call PUT when name is unchanged", async () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not call PUT when name is only whitespace", async () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls PUT on blur with a changed name", async () => {
    render(<EditZoneName id="z1" name="Balcony" />);
    fireEvent.click(screen.getByRole("button", { name: /edit zone name/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Garden" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/zones/z1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Garden" }),
        })
      );
    });
  });
});
