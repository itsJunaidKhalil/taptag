"use client";

import { useEditorStore } from "@/lib/store/editorStore";

export default function SaveStatus() {
  const isSaving = useEditorStore((s) => s.isSaving);
  const isDirty = useEditorStore((s) => s.isDirty);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);

  let label = "All changes saved";
  let color = "text-green-600 dark:text-green-400";
  let icon: React.ReactNode = (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );

  if (isSaving) {
    label = "Saving...";
    color = "text-gray-500 dark:text-gray-400";
    icon = (
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          className="opacity-75"
        />
      </svg>
    );
  } else if (isDirty) {
    label = "Unsaved changes";
    color = "text-amber-600 dark:text-amber-400";
    icon = (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6" />
      </svg>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${color} px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50`}
      title={lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : undefined}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
