import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateCondition } from "@/lib/condition";
import ComponentCard from "@/components/ComponentCard";
import AddComponentForm from "@/components/AddComponentForm";

export const dynamic = "force-dynamic";

export default async function ZonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const zone = await prisma.zone.findUnique({
    where: { id },
    include: { components: true },
  });

  if (!zone) notFound();

  const components = zone.components
    .map((c) => ({
      ...c,
      currentCondition: calculateCondition(
        c.lastCondition,
        c.lastServicedAt,
        c.decayRate
      ),
    }))
    .sort((a, b) => a.currentCondition - b.currentCondition);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
        >
          ← Dashboard
        </Link>
        <h1 className="text-zinc-100 text-2xl font-semibold mt-3">{zone.name}</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {components.length} component{components.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {components.map((c) => (
          <ComponentCard
            key={c.id}
            id={c.id}
            name={c.name}
            currentCondition={c.currentCondition}
            lastServicedAt={c.lastServicedAt}
          />
        ))}
        <AddComponentForm zoneId={zone.id} />
      </div>
    </div>
  );
}
