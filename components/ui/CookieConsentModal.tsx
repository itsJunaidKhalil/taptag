"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getConsent, saveConsent, ConsentSettings, defaultConsent } from "@/lib/consent";

interface CookieConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CookieConsentModal({ open, onOpenChange }: CookieConsentModalProps) {
  const [consent, setConsent] = useState<ConsentSettings>(defaultConsent);

  useEffect(() => {
    if (open) setConsent(getConsent());
  }, [open]);

  const handleSave = () => {
    saveConsent(consent);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    const next: ConsentSettings = { essential: true, analytics: true, marketing: true };
    saveConsent(next);
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    const next: ConsentSettings = { essential: true, analytics: false, marketing: false };
    saveConsent(next);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Cookie preferences"
      description="Choose which cookies you're comfortable with. Essential cookies are required for the site to function."
      footer={
        <>
          <button
            onClick={handleRejectAll}
            className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold"
          >
            Reject all
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold"
          >
            Save choices
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2.5 rounded-2xl bg-gradient-primary text-white hover:opacity-90 transition-all text-sm font-semibold shadow-soft"
          >
            Accept all
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <ConsentRow
          label="Essential"
          description="Required for login, sessions and security. Always on."
          checked
          disabled
          onChange={() => {}}
        />
        <ConsentRow
          label="Analytics"
          description="Helps the profile owner see how many people viewed their card."
          checked={consent.analytics}
          onChange={(v) => setConsent({ ...consent, analytics: v })}
        />
        <ConsentRow
          label="Marketing"
          description="Used for product announcements and improvement surveys."
          checked={consent.marketing}
          onChange={(v) => setConsent({ ...consent, marketing: v })}
        />
      </div>
    </Modal>
  );
}

function ConsentRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-2xl border ${
        disabled
          ? "border-gray-200 bg-gray-50/60"
          : "border-gray-200 hover:bg-gray-50/60 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="mt-1 w-4 h-4 rounded accent-indigo-600 disabled:opacity-60"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </label>
  );
}
