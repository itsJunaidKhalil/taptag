"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner";

interface ProfileTabProps {
  userId: string;
}

type UsernameStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "invalid"; reason: string; suggestions?: string[] }
  | { state: "taken"; suggestions?: string[] };

const ABOUT_MAX = 300;
const SITE_HOST = "taptag.biz";

const inputClass =
  "w-full px-4 py-3 min-h-[48px] border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white text-base sm:text-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

export default function ProfileTab({ userId }: ProfileTabProps) {
  const draft = useEditorStore((s) => s.draft);
  const saved = useEditorStore((s) => s.saved);
  const updateField = useEditorStore((s) => s.updateField);

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    state: "idle",
  });

  // Live username availability check. Debounced ~400ms so we don't fire on
  // every keystroke. Skips the call when the value is unchanged from the
  // already-saved username (no need to re-check your own).
  const checkTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    const value = draft.username.trim().toLowerCase();
    if (!value) {
      setUsernameStatus({ state: "idle" });
      return;
    }
    if (value === saved.username?.trim().toLowerCase()) {
      setUsernameStatus({ state: "ok" });
      return;
    }
    if (value.length < 3) {
      setUsernameStatus({
        state: "invalid",
        reason: "Must be at least 3 characters",
      });
      return;
    }
    setUsernameStatus({ state: "checking" });
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/username/check?username=${encodeURIComponent(value)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (data.available) {
          setUsernameStatus({ state: "ok" });
        } else if ((data.reason || "").includes("taken")) {
          setUsernameStatus({
            state: "taken",
            suggestions: data.suggestions,
          });
        } else {
          setUsernameStatus({
            state: "invalid",
            reason: data.reason || "Not available",
            suggestions: data.suggestions,
          });
        }
      } catch {
        setUsernameStatus({ state: "idle" });
      }
    }, 400);
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [draft.username, saved.username]);

  const publicUrl = draft.username
    ? `https://${SITE_HOST}/${draft.username}`
    : null;

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public URL copied");
    } catch {
      toast.error("Could not copy. Long-press to copy instead.");
    }
  };

  const aboutPct = Math.min(100, (draft.about.length / ABOUT_MAX) * 100);
  const aboutTone =
    draft.about.length >= ABOUT_MAX
      ? "bg-rose-500"
      : draft.about.length > ABOUT_MAX * 0.85
        ? "bg-amber-500"
        : "bg-gradient-primary";

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* ── Identity ─────────────────────────────────────────────────── */}
      <Section
        title="Identity"
        helper="The photo, banner, and name visitors see first."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <ImageUploader
            userId={userId}
            bucket="profile-images"
            currentUrl={draft.profile_image_url || undefined}
            onUploadComplete={(url) => updateField("profile_image_url", url)}
            label="Profile photo"
          />
          <ImageUploader
            userId={userId}
            bucket="banners"
            currentUrl={draft.banner_image_url || undefined}
            onUploadComplete={(url) => updateField("banner_image_url", url)}
            label="Banner image"
          />
        </div>

        <Field label="Username" required>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400 text-sm select-none">
              {SITE_HOST}/
            </span>
            <input
              type="text"
              value={draft.username}
              onChange={(e) =>
                updateField(
                  "username",
                  e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                )
              }
              className={`${inputClass} pl-[105px]`}
              placeholder="johndoe"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={30}
              required
            />
            <UsernameStatusIcon status={usernameStatus} />
          </div>
          <UsernameStatusLine
            status={usernameStatus}
            onPickSuggestion={(s) => updateField("username", s)}
          />
          {publicUrl && usernameStatus.state !== "taken" && (
            <button
              type="button"
              onClick={copyPublicUrl}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all"
              title="Copy your public profile URL"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {publicUrl}
            </button>
          )}
        </Field>

        <Field label="Full name">
          <input
            type="text"
            value={draft.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            className={inputClass}
            placeholder="John Doe"
            autoComplete="name"
            maxLength={80}
          />
        </Field>

        <Field label="Company / role">
          <input
            type="text"
            value={draft.company}
            onChange={(e) => updateField("company", e.target.value)}
            className={inputClass}
            placeholder="Senior Designer at Acme"
            autoComplete="organization-title"
            maxLength={100}
          />
        </Field>
      </Section>

      {/* ── Bio ──────────────────────────────────────────────────────── */}
      <Section
        title="Bio"
        helper="A short blurb that sits below your name on the card."
      >
        <Field label="About">
          <AutoGrowTextarea
            value={draft.about}
            onChange={(v) => updateField("about", v)}
            maxLength={ABOUT_MAX}
            placeholder="What you do, who you work with, what makes you fun to chat to."
          />
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${aboutTone} transition-all duration-200`}
                style={{ width: `${aboutPct}%` }}
              />
            </div>
            <span
              className={`text-xs font-medium tabular-nums ${
                draft.about.length >= ABOUT_MAX
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {draft.about.length}/{ABOUT_MAX}
            </span>
          </div>
        </Field>
      </Section>

      {/* ── Contact ─────────────────────────────────────────────────── */}
      <Section
        title="Contact"
        helper="These power the Save-to-contacts button on your card."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Phone">
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
              placeholder="+1 555 555 5555"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              placeholder="hello@example.com"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>
        </div>

        <Field label="Website" helper="We&apos;ll auto-add https:// if you forget">
          <input
            type="text"
            value={draft.website}
            onChange={(e) => updateField("website", e.target.value)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && !/^https?:\/\//i.test(v))
                updateField("website", `https://${v}`);
            }}
            className={inputClass}
            placeholder="https://example.com"
            autoComplete="url"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
      </Section>
    </div>
  );
}

function Section({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <header className="border-b border-gray-200/60 dark:border-gray-700/40 pb-2">
        <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {helper && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {helper}
          </p>
        )}
      </header>
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  helper,
  required,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {helper && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          {helper}
        </p>
      )}
    </div>
  );
}

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  if (status.state === "idle") return null;
  const common =
    "absolute inset-y-0 right-4 flex items-center pointer-events-none";
  if (status.state === "checking") {
    return (
      <div className={common}>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status.state === "ok") {
    return (
      <div className={`${common} text-emerald-500`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className={`${common} text-rose-500`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}

function UsernameStatusLine({
  status,
  onPickSuggestion,
}: {
  status: UsernameStatus;
  onPickSuggestion: (v: string) => void;
}) {
  if (status.state === "ok") {
    return (
      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
        Looks good — this username is available.
      </p>
    );
  }
  if (status.state === "checking") {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
        Checking availability…
      </p>
    );
  }
  if (status.state === "taken") {
    return (
      <div className="mt-1.5">
        <p className="text-xs text-rose-600 dark:text-rose-400">
          Already taken. Try one of these:
        </p>
        {status.suggestions && status.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {status.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPickSuggestion(s)}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-gray-700 dark:text-gray-200 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (status.state === "invalid") {
    return (
      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
        {status.reason}
      </p>
    );
  }
  return null;
}

function AutoGrowTextarea({
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(220, el.scrollHeight)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full px-4 py-3 min-h-[110px] border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white text-base sm:text-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
    />
  );
}
