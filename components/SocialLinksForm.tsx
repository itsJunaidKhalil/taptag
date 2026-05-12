"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";
import { getPlatform } from "@/lib/platforms";
import PlatformPicker from "./PlatformPicker";
import { PlatformBadge } from "./PlatformIcon";
import { confirmDialog } from "./ui/ConfirmDialog";
import { toast } from "sonner";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order_index: number;
  title?: string | null;
}

interface SocialLinksFormProps {
  userId: string;
  initialLinks?: SocialLink[];
  onLinkAdded?: () => void;
  onLinksChange?: (links: SocialLink[]) => void;
}

export default function SocialLinksForm({
  userId,
  initialLinks = [],
  onLinkAdded,
  onLinksChange,
}: SocialLinksFormProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [newPlatform, setNewPlatform] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pasting, setPasting] = useState(false);

  // We keep refs to the URL input + the wrapping field so we can
  // (a) auto-focus the input the moment a platform is picked
  // (b) scroll the field into view on small screens where the picker grid
  //     pushes the URL field below the fold.
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const urlFieldRef = useRef<HTMLDivElement | null>(null);
  // Track whether we've recently opened the platform's "get link" tab so we
  // can offer a one-click clipboard paste when the user comes back.
  const awaitingClipboardRef = useRef(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  // Whenever a platform is freshly picked, smoothly scroll the URL field
  // into view and focus the input. Honors `prefers-reduced-motion` so users
  // with that setting don't get jolted around.
  useEffect(() => {
    if (!newPlatform) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      urlFieldRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      urlInputRef.current?.focus({ preventScroll: true });
    });
  }, [newPlatform]);

  // When the user comes back from the "Open <Platform>" tab, try to read
  // their clipboard. If it's a URL that matches the chosen platform's host,
  // offer a one-tap apply via the toast action.
  useEffect(() => {
    if (!showAddForm || !newPlatform) return;
    const handler = async () => {
      if (!awaitingClipboardRef.current) return;
      awaitingClipboardRef.current = false;
      try {
        const text = (await navigator.clipboard.readText()).trim();
        if (!text || text === newUrl) return;
        const looksLikeUrlOrHandle =
          /^https?:\/\//i.test(text) ||
          /^@?[\w.\-]{1,40}$/.test(text) ||
          /^[+\d][\d\s().\-]{4,20}$/.test(text);
        if (!looksLikeUrlOrHandle) return;
        toast("Use clipboard content?", {
          description: text.length > 60 ? text.slice(0, 60) + "…" : text,
          action: {
            label: "Paste",
            onClick: () => setNewUrl(text),
          },
        });
      } catch {
        /* clipboard permission denied — silently ignore */
      }
    };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [showAddForm, newPlatform, newUrl]);

  const updateLinks = (next: SocialLink[]) => {
    setLinks(next);
    onLinksChange?.(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAddLink = async () => {
    if (!newPlatform || !newUrl.trim()) {
      toast.error("Please pick a platform and enter a URL or handle");
      return;
    }

    const platformData = getPlatform(newPlatform);

    let processedUrl = newUrl.trim();
    if (platformData.buildUrl) {
      processedUrl = platformData.buildUrl(processedUrl);
    } else if (!/^https?:\/\//i.test(processedUrl) && !/^(mailto|tel|sms):/i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }

    try {
      new URL(processedUrl);
    } catch {
      toast.error("That doesn't look like a valid URL");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error("Please refresh the page and log in again");
        return;
      }

      const response = await fetch("/api/social/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          platform: platformData.id,
          url: processedUrl,
          order_index: links.length,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to add link");
      }

      const created = Array.isArray(result.data) ? result.data[0] : result.data;
      updateLinks([...links, created]);
      setNewPlatform(null);
      setNewUrl("");
      setShowAddForm(false);
      toast.success(`${platformData.name} link added`);
      onLinkAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Could not add link");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    const ok = await confirmDialog({
      title: "Delete this link?",
      description: link
        ? `${getPlatform(link.platform).name} will no longer appear on your public profile.`
        : "This link will be removed from your profile.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please refresh the page and log in again");
        return;
      }

      const response = await fetch("/api/social/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to delete link");
      }
      updateLinks(links.filter((l) => l.id !== id));
      toast.success("Link deleted");
    } catch (error: any) {
      toast.error(error.message || "Could not delete link");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order_index: i,
    }));
    updateLinks(reordered);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please refresh and try again");
        return;
      }

      const response = await fetch("/api/social/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderedIds: reordered.map((l) => l.id) }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to save new order");
      }
    } catch (error: any) {
      toast.error(error.message || "Could not save new order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Social Links
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag to reorder. They appear on your public profile in this order.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-200 font-semibold shadow-soft hover:shadow-glow text-sm"
          >
            + Add Link
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="glass p-5 sm:p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-soft">
          <h3 className="text-lg font-heading font-semibold mb-4 text-gray-900 dark:text-white">
            Pick a platform
          </h3>

          <PlatformPicker value={newPlatform} onChange={setNewPlatform} />

          {newPlatform && (
            <div ref={urlFieldRef} className="mt-5 space-y-3 scroll-mt-24">
              <label
                htmlFor="new-link-url"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {getPlatform(newPlatform).name} URL or handle
              </label>
              <input
                id="new-link-url"
                ref={urlInputRef}
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={getPlatform(newPlatform).placeholderUrl}
                className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white transition-all"
                inputMode={
                  getPlatform(newPlatform).id === "phone" ||
                  getPlatform(newPlatform).id === "whatsapp" ||
                  getPlatform(newPlatform).id === "sms"
                    ? "tel"
                    : getPlatform(newPlatform).id === "email"
                      ? "email"
                      : "url"
                }
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              {getPlatform(newPlatform).urlHint && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getPlatform(newPlatform).urlHint}
                </p>
              )}
              <GetLinkRow
                platformId={newPlatform}
                onOpenedExternalTab={() => {
                  awaitingClipboardRef.current = true;
                }}
                onPaste={async () => {
                  if (pasting) return;
                  setPasting(true);
                  try {
                    const text = (await navigator.clipboard.readText()).trim();
                    if (!text) {
                      toast.error("Clipboard is empty");
                      return;
                    }
                    setNewUrl(text);
                    toast.success("Pasted from clipboard");
                    urlInputRef.current?.focus();
                  } catch {
                    toast.error(
                      "Clipboard access blocked. Paste with Ctrl/⌘+V instead.",
                    );
                  } finally {
                    setPasting(false);
                  }
                }}
                pasting={pasting}
              />
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleAddLink}
              disabled={saving || !newPlatform || !newUrl.trim()}
              className="flex-1 px-6 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-soft"
            >
              {saving ? "Adding..." : "Add Link"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPlatform(null);
                setNewUrl("");
              }}
              className="px-6 py-2.5 glass border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-white/30 dark:hover:bg-white/5 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <EmptyState onAdd={() => setShowAddForm(true)} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.map((link) => (
                <SortableLinkRow key={link.id} link={link} onDelete={handleDeleteLink} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableLinkRow({
  link,
  onDelete,
}: {
  link: SocialLink;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const p = getPlatform(link.platform);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 sm:p-4 glass border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-shadow ${
        isDragging ? "shadow-glow" : "hover:shadow-soft-lg"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1 touch-none"
        aria-label="Drag to reorder"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="7" cy="5" r="1.5" />
          <circle cx="13" cy="5" r="1.5" />
          <circle cx="7" cy="10" r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="7" cy="15" r="1.5" />
          <circle cx="13" cy="15" r="1.5" />
        </svg>
      </button>
      <PlatformBadge platform={link.platform} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{link.title || p.name}</p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
      </div>
      <button
        onClick={() => onDelete(link.id)}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        title="Delete"
        aria-label={`Delete ${p.name} link`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
          />
        </svg>
      </button>
    </div>
  );
}

function GetLinkRow({
  platformId,
  onOpenedExternalTab,
  onPaste,
  pasting,
}: {
  platformId: string;
  onOpenedExternalTab: () => void;
  onPaste: () => void;
  pasting: boolean;
}) {
  const p = getPlatform(platformId);
  const canOpen = !!p.getLinkUrl;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {canOpen && (
        <a
          href={p.getLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpenedExternalTab}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/80 dark:bg-gray-800/80 border border-gray-300/60 dark:border-gray-600/60 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all"
          title={`Open ${p.name} so you can copy your profile link`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Open {p.name}
        </a>
      )}
      <button
        type="button"
        onClick={onPaste}
        disabled={pasting}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/80 dark:bg-gray-800/80 border border-gray-300/60 dark:border-gray-600/60 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all disabled:opacity-60"
        title="Paste from clipboard"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        {pasting ? "Pasting…" : "Paste from clipboard"}
      </button>
      {canOpen && (
        <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">
          Tip: copy your profile URL in the new tab, then come back here.
        </span>
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass border-2 border-dashed border-gray-300/60 dark:border-gray-700/60 rounded-3xl p-8 sm:p-10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </div>
      <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
        No links yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">
        Add Instagram, LinkedIn, WhatsApp, or any of 25+ platforms — they appear on your public
        profile.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all font-semibold shadow-soft hover:shadow-glow"
      >
        + Add your first link
      </button>
    </div>
  );
}
