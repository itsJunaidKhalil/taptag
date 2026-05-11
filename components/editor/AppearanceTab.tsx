"use client";

import { themes, ThemeName } from "@/utils/themes";
import { useEditorStore } from "@/lib/store/editorStore";
import ProfileCard from "@/components/profile/ProfileCard";

export default function AppearanceTab() {
  const draft = useEditorStore((s) => s.draft);
  const updateField = useEditorStore((s) => s.updateField);
  const links = useEditorStore((s) => s.links);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Appearance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pick a theme. Each one previews using your real card content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {(Object.keys(themes) as ThemeName[]).map((themeName) => {
          const isSelected = draft.theme === themeName;
          const previewProfile = {
            ...draft,
            id: undefined,
            // Truncate to keep preview small
            about: draft.about ? draft.about.slice(0, 80) : null,
          };

          return (
            <button
              key={themeName}
              type="button"
              onClick={() => updateField("theme", themeName)}
              className={`p-2 border-2 rounded-3xl text-left transition-all hover:shadow-soft-lg ${
                isSelected
                  ? "border-primary-500 shadow-glow"
                  : "border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300"
              }`}
            >
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <span className="font-heading font-semibold text-base capitalize text-gray-900 dark:text-white">
                  {themeName}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-soft">
                    ✓
                  </span>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden h-72 relative pointer-events-none">
                <div
                  className="absolute inset-0 origin-top-left"
                  style={{ transform: "scale(0.6)", width: "166.67%", height: "166.67%" }}
                >
                  <ProfileCard
                    profile={
                      {
                        ...(previewProfile as any),
                        // override theme so each preview uses its own
                        theme: themeName,
                      } as any
                    }
                    links={links.slice(0, 2)}
                    theme={themeName}
                    compact
                    embedded={false}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
