// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddZoneForm from "@/components/AddZoneForm";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("AddZoneForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("renders 'Add zone' button initially", () => {
    render(<AddZoneForm />);
    expect(screen.getByText("+ Add zone")).toBeInTheDocument();
  });

  it("does not show the form initially", () => {
    render(<AddZoneForm />);
    expect(screen.queryByPlaceholderText(/zone name/i)).not.toBeInTheDocument();
  });

  it("opens the form when the button is clicked", () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    expect(screen.getByPlaceholderText(/zone name/i)).toBeInTheDocument();
  });

  it("closes the form when Cancel is clicked", () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("+ Add zone")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/zone name/i)).not.toBeInTheDocument();
  });

  it("disables the Add button when name is empty", () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("enables the Add button once a name is typed", () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    fireEvent.change(screen.getByPlaceholderText(/zone name/i), {
      target: { value: "Garage" },
    });
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("submits a POST to /api/zones with the zone name", async () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    const input = screen.getByPlaceholderText(/zone name/i);
    fireEvent.change(input, { target: { value: "Garage" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/zones",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Garage" }),
        })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("closes the form after a successful submission", async () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    const input = screen.getByPlaceholderText(/zone name/i);
    fireEvent.change(input, { target: { value: "Garage" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("+ Add zone")).toBeInTheDocument();
    });
  });

  it("does not submit when name is only whitespace", async () => {
    render(<AddZoneForm />);
    fireEvent.click(screen.getByText("+ Add zone"));
    const input = screen.getByPlaceholderText(/zone name/i);
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
