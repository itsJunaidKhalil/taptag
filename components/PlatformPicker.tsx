"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PLATFORMS,
  PLATFORMS_BY_CATEGORY,
  Platform,
  PlatformCategory,
  searchPlatforms,
} from "@/lib/platforms";
import { PlatformBadge } from "./PlatformIcon";

interface PlatformPickerProps {
  value: string | null;
  onChange: (platformId: string) => void;
}

export default function PlatformPicker({ value, onChange }: PlatformPickerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlatformCategory | "all">("all");

  const visible = useMemo<Platform[]>(() => {
    if (query.trim()) return searchPlatforms(query);
    if (activeCategory === "all") return PLATFORMS;
    return PLATFORMS_BY_CATEGORY[activeCategory] || [];
  }, [query, activeCategory]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 25+ platforms..."
        className="w-full px-4 py-2.5 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white text-sm transition-all"
      />

      {!query.trim() && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <CategoryChip
            label="All"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {CATEGORY_ORDER.map((cat) => (
            <CategoryChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No platforms match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto p-1">
          {visible.map((p) => {
            const selected = value === p.id || value?.toLowerCase() === p.name.toLowerCase();
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${
                  selected
                    ? "border-primary-500 bg-primary-50/60 dark:bg-primary-900/30"
                    : "border-transparent hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:bg-white/40 dark:hover:bg-white/5"
                }`}
                title={p.name}
              >
                <PlatformBadge platform={p.id} size="md" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-gradient-primary text-white shadow-soft"
          : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50"
      }`}
    >
      {label}
    </button>
  );
}
