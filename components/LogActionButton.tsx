"use client";

import { useState } from "react";
import LogActionModal from "./LogActionModal";

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
}

export default function LogActionButton(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={props.actions.length === 0}
        className="bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 transition-colors"
      >
        Log maintenance
      </button>
      {open && (
        <LogActionModal {...props} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
