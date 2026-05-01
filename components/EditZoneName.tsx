"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditZoneName({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setValue(name);
      setEditing(false);
      return;
    }
    setSaving(true);
    await fetch(`/api/zones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setValue(name);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          disabled={saving}
          className="bg-zinc-800 border border-zinc-600 text-zinc-100 text-2xl font-semibold rounded-lg px-2 py-0.5 focus:outline-none focus:border-zinc-400 w-64"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3 group">
      <h1 className="text-zinc-100 text-2xl font-semibold">{name}</h1>
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit zone name"
        className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  );
}
