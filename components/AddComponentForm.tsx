"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  zoneId: string;
}

export default function AddComponentForm({ zoneId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [decayRate, setDecayRate] = useState("2");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !decayRate) return;
    setSaving(true);
    await fetch("/api/components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, zoneId, decayRate: Number(decayRate) }),
    });
    setName("");
    setDecayRate("2");
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 rounded-lg p-4 w-full text-sm transition-colors"
      >
        + Add component
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 space-y-4"
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-zinc-500 text-xs block mb-1">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Balcony floor"
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
        </div>
        <div className="w-36">
          <label className="text-zinc-500 text-xs block mb-1">
            Decay rate (pts/day)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={decayRate}
            onChange={(e) => setDecayRate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 transition-colors"
        >
          {saving ? "Adding…" : "Add component"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
