export function calculateCondition(
  lastCondition: number,
  lastServicedAt: Date,
  decayRate: number
): number {
  const daysSince = (Date.now() - lastServicedAt.getTime()) / 86_400_000;
  return Math.max(0, Math.min(100, lastCondition - daysSince * decayRate));
}

export function conditionStatus(n: number): "good" | "warning" | "critical" {
  if (n >= 70) return "good";
  if (n >= 40) return "warning";
  return "critical";
}

export function conditionColor(status: "good" | "warning" | "critical"): string {
  if (status === "good") return "bg-green-500";
  if (status === "warning") return "bg-yellow-500";
  return "bg-red-500";
}

export function conditionTextColor(status: "good" | "warning" | "critical"): string {
  if (status === "good") return "text-green-400";
  if (status === "warning") return "text-yellow-400";
  return "text-red-400";
}
