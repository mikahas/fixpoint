import Link from "next/link";
import { conditionStatus, conditionTextColor } from "@/lib/condition";

interface Props {
  id: string;
  name: string;
  worstCondition: number;
  componentCount: number;
}

const STATUS_LABEL: Record<string, string> = {
  good: "Good",
  warning: "Warning",
  critical: "Needs attention",
};

export default function ZoneCard({
  id,
  name,
  worstCondition,
  componentCount,
}: Props) {
  const status = conditionStatus(worstCondition);
  const textColor = conditionTextColor(status);

  return (
    <Link href={`/zones/${id}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-zinc-100 font-semibold text-lg">{name}</h2>
          <span className={`text-xs font-mono uppercase tracking-wider ${textColor}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
        <p className="text-zinc-500 text-sm">
          {componentCount} component{componentCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
