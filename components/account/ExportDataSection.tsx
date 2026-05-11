"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ExportDataSection() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again to export your data.");
        return;
      }
      const res = await fetch("/api/account/export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Could not export data");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] || `taptag-export-${Date.now()}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded.");
    } catch (e: any) {
      toast.error(e?.message || "Could not export data");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
      <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-2">
        Export your data
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-5 max-w-xl">
        Download a JSON file with every piece of personal data TapTag stores about
        your account: profile, social links, recent analytics, and username history.
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-primary text-white font-semibold text-sm shadow-soft hover:shadow-glow hover:opacity-95 disabled:opacity-60 transition-all"
      >
        {downloading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Preparing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download my data (JSON)
          </>
        )}
      </button>
    </section>
  );
}
