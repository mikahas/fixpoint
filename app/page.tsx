import { prisma } from "@/lib/prisma";
import { calculateCondition, conditionStatus, conditionTextColor } from "@/lib/condition";
import ZoneCard from "@/components/ZoneCard";
import AddZoneForm from "@/components/AddZoneForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const zones = await prisma.zone.findMany({
    include: { components: true },
    orderBy: { createdAt: "asc" },
  });

  const zonesWithCondition = zones.map((zone) => {
    const components = zone.components.map((c) => ({
      ...c,
      currentCondition: calculateCondition(
        c.lastCondition,
        c.lastServicedAt,
        c.decayRate
      ),
    }));
    const worstCondition =
      components.length > 0
        ? Math.min(...components.map((c) => c.currentCondition))
        : 100;
    return { ...zone, components, worstCondition };
  });

  const needsAttention = zonesWithCondition
    .flatMap((z) =>
      z.components.map((c) => ({ ...c, zoneName: z.name }))
    )
    .filter((c) => c.currentCondition < 70)
    .sort((a, b) => a.currentCondition - b.currentCondition)
    .slice(0, 8);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-6">
          Zones
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonesWithCondition.map((zone) => (
            <ZoneCard
              key={zone.id}
              id={zone.id}
              name={zone.name}
              worstCondition={zone.worstCondition}
              componentCount={zone.components.length}
            />
          ))}
          <AddZoneForm />
        </div>
      </div>

      {needsAttention.length > 0 && (
        <div>
          <h2 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-4">
            Needs attention
          </h2>
          <div className="space-y-2">
            {needsAttention.map((c) => {
              const status = conditionStatus(c.currentCondition);
              const textColor = conditionTextColor(status);
              return (
                <Link key={c.id} href={`/components/${c.id}`}>
                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-3 transition-colors">
                    <div>
                      <span className="text-zinc-100 text-sm">{c.name}</span>
                      <span className="text-zinc-600 text-sm ml-2">
                        · {c.zoneName}
                      </span>
                    </div>
                    <span className={`font-mono text-sm ${textColor}`}>
                      {Math.round(c.currentCondition)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {zonesWithCondition.length === 0 && (
        <p className="text-zinc-600 text-sm">
          No zones yet. Add one above to get started.
        </p>
      )}
    </div>
  );
}
