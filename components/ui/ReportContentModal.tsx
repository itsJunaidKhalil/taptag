"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";

interface ReportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Pre-fill the username field. Leave undefined to let the reporter type
   * which profile they're reporting (used in the global footer where there
   * is no specific profile in context).
   */
  username?: string;
  profileId?: string;
}

const REASONS = [
  "Spam or scam",
  "Impersonation",
  "Harassment or hateful content",
  "Adult content",
  "Copyright violation",
  "Other",
];

/**
 * Like ReportModal but works without a specific profile in context. Used
 * by the global site footer so reports can be submitted from any page,
 * not only public profiles.
 */
export default function ReportContentModal({
  open,
  onOpenChange,
  username: initialUsername,
  profileId,
}: ReportContentModalProps) {
  const [username, setUsername] = useState(initialUsername || "");
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(initialUsername || "");
      setReason("");
      setDetails("");
    }
  }, [open, initialUsername]);

  const handleSubmit = async () => {
    const cleanedUsername = username.trim().replace(/^@|^\//, "");
    if (!cleanedUsername) {
      toast.error("Please tell us which profile to look at");
      return;
    }
    if (!reason) {
      toast.error("Please pick a reason");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          username: cleanedUsername,
          reason,
          details,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not submit report");
      }
      toast.success("Report submitted. Thank you.");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Report content"
      description="Tell us about a profile or link that violates our terms. Our moderation team reviews every report."
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason || !username.trim()}
            className="px-4 py-2.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-soft"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Profile username
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-2xl bg-white">
            <span className="text-gray-400 text-sm select-none">taptag.biz/</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              disabled={!!initialUsername}
              className="flex-1 outline-none bg-transparent text-sm text-gray-900 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 text-sm bg-white"
          >
            <option value="">Select a reason</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Any extra context that helps us investigate..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 text-sm bg-white resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{details.length}/500</p>
        </div>
      </div>
    </Modal>
  );
}
