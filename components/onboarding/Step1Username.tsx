"use client";

import { useEffect, useRef, useState } from "react";

interface Step1Props {
  initialUsername: string;
  onNext: (username: string) => void;
}

export default function Step1Username({ initialUsername, onNext }: Step1Props) {
  const [value, setValue] = useState(initialUsername);
  const [status, setStatus] = useState<{
    state: "idle" | "checking" | "available" | "taken" | "invalid";
    reason?: string;
    suggestions?: string[];
  }>({ state: "idle" });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const trimmed = value.toLowerCase().trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!trimmed) {
      setStatus({ state: "idle" });
      return;
    }
    setStatus({ state: "checking" });
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.available) {
          setStatus({ state: "available" });
        } else {
          setStatus({
            state: data.reason?.includes("reserved") || data.reason?.includes("taken") ? "taken" : "invalid",
            reason: data.reason,
            suggestions: data.suggestions,
          });
        }
      } catch {
        setStatus({ state: "invalid", reason: "Could not check availability" });
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
          Pick your username
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          This becomes your public link — you can change it later.
        </p>
      </div>

      <div>
        <div className="flex items-center bg-white border-2 border-gray-300 rounded-2xl overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all">
          <span className="px-3 sm:px-4 py-3 text-gray-500 text-sm sm:text-base bg-gray-50 border-r border-gray-200 select-none whitespace-nowrap">
            taptag.biz/
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
            }
            placeholder="yourname"
            autoFocus
            maxLength={30}
            className="flex-1 px-3 py-3 outline-none text-gray-900 text-sm sm:text-base bg-white"
          />
          <div className="px-3 flex-shrink-0">
            {status.state === "checking" && (
              <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  className="opacity-75"
                />
              </svg>
            )}
            {status.state === "available" && (
              <span className="text-green-600 text-xl" aria-label="available">
                ✓
              </span>
            )}
            {(status.state === "taken" || status.state === "invalid") && (
              <span className="text-red-500 text-xl" aria-label="not available">
                ✕
              </span>
            )}
          </div>
        </div>

        {status.state === "available" && (
          <p className="text-xs text-green-600 mt-2 font-semibold">
            ✨ <strong>{value}</strong> is available!
          </p>
        )}
        {(status.state === "taken" || status.state === "invalid") && (
          <div className="mt-2">
            <p className="text-xs text-red-600">{status.reason}</p>
            {status.suggestions && status.suggestions.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {status.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setValue(s)}
                    className="px-2.5 py-1 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    Try {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => onNext(value)}
          disabled={status.state !== "available"}
          className="px-6 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-soft"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
