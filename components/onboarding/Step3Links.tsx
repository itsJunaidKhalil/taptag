"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlatform, PLATFORMS } from "@/lib/platforms";
import { PlatformBadge } from "@/components/PlatformIcon";
import { toast } from "sonner";

interface Step3Props {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

const SUGGESTED = ["instagram", "linkedin", "whatsapp", "email", "website"];

interface DraftLink {
  platformId: string;
  value: string;
}

export default function Step3Links({ userId, onNext, onBack }: Step3Props) {
  const [drafts, setDrafts] = useState<DraftLink[]>([]);
  const [saving, setSaving] = useState(false);

  const togglePlatform = (id: string) => {
    if (drafts.some((d) => d.platformId === id)) {
      setDrafts(drafts.filter((d) => d.platformId !== id));
    } else {
      setDrafts([...drafts, { platformId: id, value: "" }]);
    }
  };

  const updateValue = (id: string, value: string) => {
    setDrafts(drafts.map((d) => (d.platformId === id ? { ...d, value } : d)));
  };

  const handleNext = async () => {
    const validDrafts = drafts.filter((d) => d.value.trim());

    if (validDrafts.length === 0) {
      // Skipping is fine
      onNext();
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired");
        return;
      }

      let createdCount = 0;
      for (let i = 0; i < validDrafts.length; i++) {
        const draft = validDrafts[i];
        const p = getPlatform(draft.platformId);
        let url = draft.value.trim();
        if (p.buildUrl) url = p.buildUrl(url);
        else if (!/^https?:\/\//i.test(url) && !/^(mailto|tel|sms):/i.test(url)) {
          url = `https://${url}`;
        }
        try {
          new URL(url);
        } catch {
          toast.error(`Skipping ${p.name}: invalid URL`);
          continue;
        }
        const res = await fetch("/api/social/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            platform: p.id,
            url,
            order_index: i,
          }),
        });
        if (res.ok) createdCount++;
      }
      if (createdCount > 0) {
        toast.success(`Added ${createdCount} link${createdCount > 1 ? "s" : ""}`);
      }
      onNext();
    } catch (e: any) {
      toast.error(e.message || "Could not save links");
    } finally {
      setSaving(false);
    }
  };

  const suggestedPlatforms = SUGGESTED.map((id) => PLATFORMS.find((p) => p.id === id)).filter(Boolean) as typeof PLATFORMS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
          Add starter links
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Pick a few platforms — you can add more later from the dashboard.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {suggestedPlatforms.map((p) => {
          const active = drafts.some((d) => d.platformId === p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all text-sm font-semibold ${
                active
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-primary-300 text-gray-700"
              }`}
            >
              <PlatformBadge platform={p.id} size="sm" />
              {p.name}
            </button>
          );
        })}
      </div>

      {drafts.length > 0 && (
        <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
          {drafts.map((d) => {
            const p = getPlatform(d.platformId);
            return (
              <div key={d.platformId}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {p.name}
                </label>
                <input
                  type="text"
                  value={d.value}
                  onChange={(e) => updateValue(d.platformId, e.target.value)}
                  placeholder={p.placeholderUrl}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 text-sm"
                />
                {p.urlHint && (
                  <p className="text-xs text-gray-500 mt-1">{p.urlHint}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all font-semibold shadow-soft"
        >
          {saving
            ? "Adding..."
            : drafts.filter((d) => d.value.trim()).length > 0
              ? "Add & finish →"
              : "Skip & finish →"}
        </button>
      </div>
    </div>
  );
}
