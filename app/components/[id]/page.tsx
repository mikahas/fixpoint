import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateCondition, conditionStatus, conditionTextColor } from "@/lib/condition";
import ConditionBar from "@/components/ConditionBar";
import LogActionButton from "@/components/LogActionButton";
import AddActionForm from "@/components/AddActionForm";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const component = await prisma.component.findUnique({
    where: { id },
    include: {
      zone: true,
      actions: { orderBy: { name: "asc" } },
      logs: {
        include: { action: true },
        orderBy: { performedAt: "desc" },
      },
    },
  });

  if (!component) notFound();

  const currentCondition = calculateCondition(
    component.lastCondition,
    component.lastServicedAt,
    component.decayRate
  );
  const status = conditionStatus(currentCondition);
  const textColor = conditionTextColor(status);

  return (
    <div className="space-y-10">
      <div>
        <Link
          href={`/zones/${component.zoneId}`}
          className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
        >
          ← {component.zone.name}
        </Link>
        <div className="flex items-start justify-between mt-3">
          <h1 className="text-zinc-100 text-2xl font-semibold">
            {component.name}
          </h1>
          <LogActionButton
            componentId={component.id}
            componentName={component.name}
            lastCondition={component.lastCondition}
            lastServicedAt={component.lastServicedAt.toISOString()}
            decayRate={component.decayRate}
            actions={component.actions}
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Condition</span>
          <span className={`font-mono text-3xl font-semibold ${textColor}`}>
            {Math.round(currentCondition)}%
          </span>
        </div>
        <ConditionBar condition={currentCondition} showLabel={false} />
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-zinc-600">
            Last serviced {timeAgo(component.lastServicedAt)}
          </span>
          <span className="text-zinc-600 font-mono">
            −{component.decayRate} pts/day
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
          Actions
        </h2>
        {component.actions.length === 0 ? (
          <p className="text-zinc-600 text-sm">
            No actions defined yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {component.actions.map((action) => (
              <div
                key={action.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <span className="text-zinc-100 text-sm">{action.name}</span>
                <span className="font-mono text-green-400 text-sm">
                  +{action.conditionEffect}
                </span>
              </div>
            ))}
          </div>
        )}
        <AddActionForm componentId={component.id} />
      </div>

      <div className="space-y-3">
        <h2 className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
          History
        </h2>
        {component.logs.length === 0 ? (
          <p className="text-zinc-600 text-sm">No maintenance logged yet.</p>
        ) : (
          <div className="space-y-2">
            {component.logs.map((log) => (
              <div
                key={log.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-100 text-sm">
                    {log.action.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 text-sm">
                      {Math.round(log.resultingCondition)}%
                    </span>
                    <span className="text-zinc-600 text-xs">
                      {formatDate(log.performedAt)}
                    </span>
                  </div>
                </div>
                {log.note && (
                  <p className="text-zinc-500 text-xs mt-1">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
