// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ConditionBar from "@/components/ConditionBar";

describe("ConditionBar", () => {
  it("shows the condition percentage label by default", () => {
    render(<ConditionBar condition={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("hides the label when showLabel is false", () => {
    render(<ConditionBar condition={75} showLabel={false} />);
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("applies the green bar class for good condition", () => {
    const { container } = render(<ConditionBar condition={80} />);
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });

  it("applies the yellow bar class for warning condition", () => {
    const { container } = render(<ConditionBar condition={50} />);
    expect(container.querySelector(".bg-yellow-500")).toBeInTheDocument();
  });

  it("applies the red bar class for critical condition", () => {
    const { container } = render(<ConditionBar condition={20} />);
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
  });
});
