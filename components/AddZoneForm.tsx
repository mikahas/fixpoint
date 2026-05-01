"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddZoneForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 rounded-lg p-5 w-full text-sm transition-colors"
      >
        + Add zone
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 flex gap-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Zone name (e.g. Balcony)"
        className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 transition-colors"
      >
        {saving ? "Adding…" : "Add"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-zinc-500 hover:text-zinc-300 px-2 text-sm transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}
