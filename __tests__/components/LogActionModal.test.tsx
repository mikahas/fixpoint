// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LogActionModal from "@/components/LogActionModal";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const now = new Date().toISOString();
const actions = [
  { id: "a1", name: "Clean", conditionEffect: 20 },
  { id: "a2", name: "Replace", conditionEffect: 40 },
];
const baseProps = {
  componentId: "c1",
  componentName: "Balcony floor",
  lastCondition: 60,
  lastServicedAt: now,
  decayRate: 0,
  actions,
  onClose: vi.fn(),
};

describe("LogActionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    baseProps.onClose = vi.fn();
  });

  it("renders the component name", () => {
    render(<LogActionModal {...baseProps} />);
    expect(screen.getByText("Balcony floor")).toBeInTheDocument();
  });

  it("lists all available actions in the select", () => {
    render(<LogActionModal {...baseProps} />);
    expect(screen.getByRole("option", { name: /clean/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /replace/i })).toBeInTheDocument();
  });

  it("shows condition preview for the default selected action", () => {
    // lastCondition=60, decayRate=0 (no decay), conditionEffect=20 → preview=80
    render(<LogActionModal {...baseProps} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("updates the condition preview when a different action is selected", () => {
    render(<LogActionModal {...baseProps} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "a2" } });
    // conditionEffect=40, 60+40=100
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("calls onClose when the × button is clicked", () => {
    render(<LogActionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(<LogActionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("submits POST to /api/logs with componentId and actionId", async () => {
    render(<LogActionModal {...baseProps} />);
    const form = screen.getByRole("button", { name: /save log entry/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/logs",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"componentId":"c1"'),
        })
      );
    });
  });

  it("calls onClose and router.refresh after a successful submission", async () => {
    render(<LogActionModal {...baseProps} />);
    fireEvent.submit(
      screen.getByRole("button", { name: /save log entry/i }).closest("form")!
    );

    await waitFor(() => {
      expect(baseProps.onClose).toHaveBeenCalled();
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("includes an optional note in the request body", async () => {
    render(<LogActionModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/any observations/i), {
      target: { value: "Looks good" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /save log entry/i }).closest("form")!
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/logs",
        expect.objectContaining({
          body: expect.stringContaining('"note":"Looks good"'),
        })
      );
    });
  });

  it("shows 'No actions defined yet' when actions array is empty", () => {
    render(<LogActionModal {...baseProps} actions={[]} />);
    expect(screen.getByText(/no actions defined yet/i)).toBeInTheDocument();
  });

  it("disables the Save button when no action is selected", () => {
    render(<LogActionModal {...baseProps} actions={[]} />);
    expect(screen.getByRole("button", { name: /save log entry/i })).toBeDisabled();
  });
});
