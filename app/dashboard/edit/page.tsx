"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProfileById } from "@/lib/getProfile";
import { useEditorStore } from "@/lib/store/editorStore";
import Navbar from "@/components/Navbar";
import EditorTabs from "@/components/editor/EditorTabs";
import ProfileTab from "@/components/editor/ProfileTab";
import LinksTab from "@/components/editor/LinksTab";
import AppearanceTab from "@/components/editor/AppearanceTab";
import PreviewDrawer from "@/components/editor/PreviewDrawer";
import SaveStatus from "@/components/editor/SaveStatus";
import EmailVerificationBanner from "@/components/account/EmailVerificationBanner";
import { toast } from "sonner";

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "profile";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const initialize = useEditorStore((s) => s.initialize);
  const draft = useEditorStore((s) => s.draft);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setSaving = useEditorStore((s) => s.setSaving);
  const markSaved = useEditorStore((s) => s.markSaved);
  const userId = useEditorStore((s) => s.userId);

  // Load user + profile + links once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        router.push("/auth/login");
        return;
      }
      if (cancelled) return;
      setUser(u);
      try {
        // Profile may not exist yet (legacy signups, OAuth callback that
        // skipped the insert, etc). getProfileById returns null in that case.
        const profile = await getProfileById(u.id).catch(() => null);
        let links: any[] = [];
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            const res = await fetch(`/api/social/list?user_id=${u.id}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
              const result = await res.json();
              links = result.data || [];
            }
          }
        } catch {
          /* ignore */
        }
        // initialize with profile=null still seeds the store with userId
        // and an empty draft, so the editor remains usable.
        if (!cancelled) initialize(u.id, profile, links);
      } catch (e) {
        console.error("Editor load error:", e);
        if (!cancelled) initialize(u.id, null, []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, initialize]);

  const persistDraft = async (silent = true) => {
    if (!userId) return false;
    try {
      setSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired — please refresh");
        setSaving(false);
        return false;
      }
      const payload = {
        id: userId,
        username: draft.username || null,
        full_name: draft.full_name || null,
        company: draft.company || null,
        about: draft.about || null,
        phone: draft.phone || null,
        contact_email: draft.contact_email?.trim() || null,
        website: draft.website || null,
        profile_image_url: draft.profile_image_url || null,
        banner_image_url: draft.banner_image_url || null,
        company_logo_url: draft.company_logo_url || null,
        theme: draft.theme,
      };
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Save failed");
      markSaved();
      if (!silent) toast.success("Saved");
      return true;
    } catch (e: any) {
      setSaving(false);
      toast.error(e.message || "Could not save");
      return false;
    }
  };

  // Debounced auto-save — fires 800ms after last keystroke when dirty
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isDirty || !userId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistDraft(true);
    }, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isDirty, userId]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <EmailVerificationBanner />
      <Navbar />

      <div className="lg:pr-[400px] transition-all pb-10 lg:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text">
                Edit your card
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Auto-saves as you type.{" "}
                {draft.username && (
                  <Link
                    href={`/${draft.username}`}
                    target="_blank"
                    className="text-primary-600 dark:text-primary-400 underline font-semibold"
                  >
                    View public profile ↗
                  </Link>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SaveStatus />
              <button
                onClick={() => persistDraft(false)}
                disabled={!isDirty}
                className="px-4 py-2 rounded-2xl bg-gradient-primary text-white text-xs font-semibold shadow-soft hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Save profile changes now"
              >
                Save now
              </button>
            </div>
          </div>

          <EditorTabs active={tab} />

          <div className="glass p-5 sm:p-7 rounded-3xl shadow-soft-lg">
            {tab === "profile" && user && <ProfileTab userId={user.id} />}
            {tab === "links" && user && <LinksTab userId={user.id} />}
            {tab === "appearance" && <AppearanceTab />}
          </div>
        </div>
      </div>

      <PreviewDrawer />
    </div>
  );
}
