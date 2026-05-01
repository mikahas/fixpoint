import { conditionColor, conditionStatus } from "@/lib/condition";

interface Props {
  condition: number;
  showLabel?: boolean;
}

export default function ConditionBar({ condition, showLabel = true }: Props) {
  const status = conditionStatus(condition);
  const color = conditionColor(status);
  const pct = Math.round(condition);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-sm text-zinc-300 w-10 text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
