"use client";

import Link from "next/link";
import QRCode from "@/components/QRCode";
import { toast } from "sonner";

interface Step4Props {
  username: string;
  onClose: () => void;
}

export default function Step4Complete({ username, onClose }: Step4Props) {
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";
  const profileUrl = `${baseUrl}/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied!");
  };

  return (
    <div className="space-y-5 text-center">
      <div>
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
          You&rsquo;re live! 🎉
        </h2>
        <p className="text-sm text-gray-600 mt-1.5">
          Your card is published at the URL below. Share it anywhere.
        </p>
      </div>

      <div className="flex items-center bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
        <input
          type="text"
          readOnly
          value={profileUrl}
          className="flex-1 px-4 py-3 outline-none text-gray-900 text-sm bg-white"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-3 bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 whitespace-nowrap"
        >
          Copy
        </button>
      </div>

      <div className="flex justify-center pt-2">
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
          <QRCode url={profileUrl} size={140} showTitle={false} showDownload={false} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <Link
          href={`/${username}`}
          target="_blank"
          className="flex-1 px-4 py-3 rounded-2xl bg-gradient-secondary text-white font-semibold text-sm hover:opacity-90 transition-all shadow-soft text-center"
        >
          View your profile ↗
        </Link>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-2xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all shadow-soft"
        >
          Go to dashboard
        </button>
      </div>

      <p className="text-xs text-gray-500 pt-1">
        💡 Tip: Pair your card with a TapTag NFC tag — one tap shares everything.
      </p>
    </div>
  );
}
