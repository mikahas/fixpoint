import { describe, it, expect } from "vitest";
import {
  calculateCondition,
  conditionStatus,
  conditionColor,
  conditionTextColor,
} from "@/lib/condition";

describe("calculateCondition", () => {
  it("returns close to lastCondition when serviced just now", () => {
    expect(calculateCondition(80, new Date(), 1)).toBeCloseTo(80, 0);
  });

  it("decays by decayRate per day", () => {
    const oneDayAgo = new Date(Date.now() - 86_400_000);
    expect(calculateCondition(80, oneDayAgo, 5)).toBeCloseTo(75, 0);
  });

  it("clamps at 0 when fully decayed", () => {
    const longAgo = new Date(Date.now() - 100 * 86_400_000);
    expect(calculateCondition(50, longAgo, 10)).toBe(0);
  });

  it("never exceeds 100", () => {
    expect(calculateCondition(100, new Date(), 0)).toBeCloseTo(100, 0);
  });
});

describe("conditionStatus", () => {
  it("returns good at 70 and above", () => {
    expect(conditionStatus(70)).toBe("good");
    expect(conditionStatus(100)).toBe("good");
  });

  it("returns warning between 40 and 69", () => {
    expect(conditionStatus(40)).toBe("warning");
    expect(conditionStatus(69)).toBe("warning");
  });

  it("returns critical below 40", () => {
    expect(conditionStatus(39)).toBe("critical");
    expect(conditionStatus(0)).toBe("critical");
  });
});

describe("conditionColor", () => {
  it("maps each status to the correct Tailwind bg class", () => {
    expect(conditionColor("good")).toBe("bg-green-500");
    expect(conditionColor("warning")).toBe("bg-yellow-500");
    expect(conditionColor("critical")).toBe("bg-red-500");
  });
});

describe("conditionTextColor", () => {
  it("maps each status to the correct Tailwind text class", () => {
    expect(conditionTextColor("good")).toBe("text-green-400");
    expect(conditionTextColor("warning")).toBe("text-yellow-400");
    expect(conditionTextColor("critical")).toBe("text-red-400");
  });
});
