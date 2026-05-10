"use client";

import { useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  profileId: string;
}

const REASONS = [
  "Spam or scam",
  "Impersonation",
  "Harassment or hateful content",
  "Adult content",
  "Copyright violation",
  "Other",
];

export default function ReportModal({ open, onOpenChange, username, profileId }: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please pick a reason");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, username, reason, details }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not submit report");
      }
      toast.success("Report submitted. Thank you.");
      onOpenChange(false);
      setReason("");
      setDetails("");
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
      title={`Report @${username}`}
      description="Reports are reviewed by our moderation team. False reports may result in action against your account."
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
            disabled={submitting || !reason}
            className="px-4 py-2.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-soft"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Details (optional)</label>
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
