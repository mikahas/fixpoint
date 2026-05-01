import Link from "next/link";
import ConditionBar from "./ConditionBar";
import { conditionStatus, conditionTextColor } from "@/lib/condition";

interface Props {
  id: string;
  name: string;
  currentCondition: number;
  lastServicedAt: Date;
}

function daysAgo(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function ComponentCard({
  id,
  name,
  currentCondition,
  lastServicedAt,
}: Props) {
  const status = conditionStatus(currentCondition);
  const textColor = conditionTextColor(status);

  return (
    <Link href={`/components/${id}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-zinc-100 font-medium">{name}</h3>
          <span className={`font-mono text-sm ${textColor}`}>
            {Math.round(currentCondition)}%
          </span>
        </div>
        <ConditionBar condition={currentCondition} showLabel={false} />
        <p className="text-zinc-600 text-xs mt-2">
          Last serviced {daysAgo(lastServicedAt)}
        </p>
      </div>
    </Link>
  );
}
