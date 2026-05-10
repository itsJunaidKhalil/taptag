"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Tab = { id: string; label: string; icon: React.ReactNode };

const TABS: Tab[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: "links",
    label: "Links",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343"
        />
      </svg>
    ),
  },
];

interface EditorTabsProps {
  active: string;
}

export default function EditorTabs({ active }: EditorTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", tabId);
    router.replace(`/dashboard/edit?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-1 p-1 bg-gray-100/70 dark:bg-gray-800/70 rounded-2xl mb-6 max-w-md">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            active === t.id
              ? "bg-white dark:bg-gray-900 shadow-soft text-primary-600 dark:text-primary-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
