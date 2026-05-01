// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddActionForm from "@/components/AddActionForm";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("AddActionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  it("renders 'Define new action' button initially", () => {
    render(<AddActionForm componentId="c1" />);
    expect(screen.getByText("+ Define new action")).toBeInTheDocument();
  });

  it("does not show the form initially", () => {
    render(<AddActionForm componentId="c1" />);
    expect(screen.queryByPlaceholderText(/apply wood treatment/i)).not.toBeInTheDocument();
  });

  it("opens the form on click", () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    expect(screen.getByPlaceholderText(/apply wood treatment/i)).toBeInTheDocument();
  });

  it("shows a default conditionEffect of 20", () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });

  it("closes on Cancel", () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("+ Define new action")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/apply wood treatment/i)).not.toBeInTheDocument();
  });

  it("disables the submit button when name is empty", () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    expect(screen.getByRole("button", { name: /add action/i })).toBeDisabled();
  });

  it("submits with name, componentId, and conditionEffect", async () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    const input = screen.getByPlaceholderText(/apply wood treatment/i);
    fireEvent.change(input, { target: { value: "Oil treatment" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/actions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Oil treatment", componentId: "c1", conditionEffect: 20 }),
        })
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("uses the edited conditionEffect in the request", async () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    const nameInput = screen.getByPlaceholderText(/apply wood treatment/i);
    const effectInput = screen.getByDisplayValue("20");
    fireEvent.change(nameInput, { target: { value: "Deep clean" } });
    fireEvent.change(effectInput, { target: { value: "35" } });
    fireEvent.submit(nameInput.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/actions",
        expect.objectContaining({
          body: JSON.stringify({ name: "Deep clean", componentId: "c1", conditionEffect: 35 }),
        })
      );
    });
  });

  it("closes the form after a successful submission", async () => {
    render(<AddActionForm componentId="c1" />);
    fireEvent.click(screen.getByText("+ Define new action"));
    const input = screen.getByPlaceholderText(/apply wood treatment/i);
    fireEvent.change(input, { target: { value: "Clean" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("+ Define new action")).toBeInTheDocument();
    });
  });
});
