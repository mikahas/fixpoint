"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateCondition } from "@/lib/condition";

interface Action {
  id: string;
  name: string;
  conditionEffect: number;
}

interface Props {
  componentId: string;
  componentName: string;
  lastCondition: number;
  lastServicedAt: string;
  decayRate: number;
  actions: Action[];
  onClose: () => void;
}

export default function LogActionModal({
  componentId,
  componentName,
  lastCondition,
  lastServicedAt,
  decayRate,
  actions,
  onClose,
}: Props) {
  const router = useRouter();
  const currentCondition = calculateCondition(
    lastCondition,
    new Date(lastServicedAt),
    decayRate
  );

  const [selectedActionId, setSelectedActionId] = useState(
    actions[0]?.id ?? ""
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAction = actions.find((a) => a.id === selectedActionId);
  const preview = selectedAction
    ? Math.min(100, Math.max(0, currentCondition + selectedAction.conditionEffect))
    : currentCondition;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedActionId) return;
    setSaving(true);
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        componentId,
        actionId: selectedActionId,
        note,
        resultingCondition: Math.round(preview),
      }),
    });
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-semibold">Log maintenance</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <p className="text-zinc-500 text-sm mb-1">Component</p>
            <p className="text-zinc-100">{componentName}</p>
          </div>

          <div>
            <label className="text-zinc-500 text-sm block mb-2">Action</label>
            {actions.length === 0 ? (
              <p className="text-zinc-600 text-sm">No actions defined yet.</p>
            ) : (
              <select
                value={selectedActionId}
                onChange={(e) => setSelectedActionId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              >
                {actions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.conditionEffect > 0 ? "+" : ""}
                    {a.conditionEffect})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-zinc-500 text-sm block mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any observations..."
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Condition after</span>
            <span className="font-mono text-zinc-100">
              {Math.round(currentCondition)}%{" "}
              <span className="text-zinc-500">→</span>{" "}
              <span className={preview > currentCondition ? "text-green-400" : "text-zinc-300"}>
                {Math.round(preview)}%
              </span>
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedActionId}
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save log entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
