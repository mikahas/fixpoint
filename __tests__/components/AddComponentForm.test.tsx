// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddComponentForm from "@/components/AddComponentForm";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("AddComponentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("renders 'Add component' button initially", () => {
    render(<AddComponentForm zoneId="z1" />);
    expect(screen.getByText("+ Add component")).toBeInTheDocument();
  });

  it("does not show the form initially", () => {
    render(<AddComponentForm zoneId="z1" />);
    expect(screen.queryByPlaceholderText(/balcony floor/i)).not.toBeInTheDocument();
  });

  it("opens the form when clicked", () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    expect(screen.getByPlaceholderText(/balcony floor/i)).toBeInTheDocument();
  });

  it("shows a default decay rate of 2", () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });

  it("closes on Cancel", () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("+ Add component")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/balcony floor/i)).not.toBeInTheDocument();
  });

  it("disables the submit button when name is empty", () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    expect(screen.getByRole("button", { name: /add component/i })).toBeDisabled();
  });

  it("submits with name, zoneId, and decayRate", async () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    const input = screen.getByPlaceholderText(/balcony floor/i);
    fireEvent.change(input, { target: { value: "Front door" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/components",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Front door", zoneId: "z1", decayRate: 2 }),
        })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("uses the edited decay rate in the request", async () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    const nameInput = screen.getByPlaceholderText(/balcony floor/i);
    const decayInput = screen.getByDisplayValue("2");
    fireEvent.change(nameInput, { target: { value: "Roof" } });
    fireEvent.change(decayInput, { target: { value: "5" } });
    fireEvent.submit(nameInput.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/components",
        expect.objectContaining({
          body: JSON.stringify({ name: "Roof", zoneId: "z1", decayRate: 5 }),
        })
      );
    });
  });

  it("closes the form after a successful submission", async () => {
    render(<AddComponentForm zoneId="z1" />);
    fireEvent.click(screen.getByText("+ Add component"));
    const input = screen.getByPlaceholderText(/balcony floor/i);
    fireEvent.change(input, { target: { value: "Front door" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("+ Add component")).toBeInTheDocument();
    });
  });
});
