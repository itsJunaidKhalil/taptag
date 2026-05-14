"use client";

import { create } from "zustand";
import type { ProfileCardData, ProfileCardLink } from "@/components/profile/ProfileCard";
import type { ThemeName } from "@/utils/themes";

export interface ProfileDraft {
  username: string;
  full_name: string;
  company: string;
  about: string;
  phone: string;
  email: string;
  website: string;
  profile_image_url: string;
  banner_image_url: string;
  company_logo_url: string;
  theme: ThemeName;
}

interface EditorState {
  userId: string | null;
  draft: ProfileDraft;
  saved: ProfileDraft;
  links: ProfileCardLink[];
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  initialize: (userId: string, profile: any, links: ProfileCardLink[]) => void;
  updateField: <K extends keyof ProfileDraft>(field: K, value: ProfileDraft[K]) => void;
  setLinks: (links: ProfileCardLink[]) => void;
  setSaving: (b: boolean) => void;
  markSaved: () => void;
  resetDirty: () => void;
}

const emptyDraft: ProfileDraft = {
  username: "",
  full_name: "",
  company: "",
  about: "",
  phone: "",
  email: "",
  website: "",
  profile_image_url: "",
  banner_image_url: "",
  company_logo_url: "",
  theme: "default",
};

function profileToDraft(profile: any): ProfileDraft {
  if (!profile) return { ...emptyDraft };
  return {
    username: profile.username || "",
    full_name: profile.full_name || "",
    company: profile.company || "",
    about: profile.about || "",
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    profile_image_url: profile.profile_image_url || "",
    banner_image_url: profile.banner_image_url || "",
    company_logo_url: profile.company_logo_url || "",
    theme: (profile.theme as ThemeName) || "default",
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  userId: null,
  draft: { ...emptyDraft },
  saved: { ...emptyDraft },
  links: [],
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  initialize: (userId, profile, links) => {
    const d = profileToDraft(profile);
    set({
      userId,
      draft: d,
      saved: d,
      links: links || [],
      isDirty: false,
      isSaving: false,
      lastSavedAt: profile?.updated_at ? new Date(profile.updated_at).getTime() : null,
    });
  },

  updateField: (field, value) =>
    set((state) => {
      const nextDraft = { ...state.draft, [field]: value };
      return {
        draft: nextDraft,
        isDirty: JSON.stringify(nextDraft) !== JSON.stringify(state.saved),
      };
    }),

  setLinks: (links) => set({ links }),
  setSaving: (b) => set({ isSaving: b }),
  markSaved: () =>
    set((state) => ({
      saved: { ...state.draft },
      isDirty: false,
      isSaving: false,
      lastSavedAt: Date.now(),
    })),
  resetDirty: () => set({ isDirty: false }),
}));

export function draftToProfileCard(draft: ProfileDraft, userId: string | null): ProfileCardData {
  return {
    id: userId || undefined,
    username: draft.username || null,
    full_name: draft.full_name || null,
    company: draft.company || null,
    about: draft.about || null,
    phone: draft.phone || null,
    email: draft.email || null,
    website: draft.website || null,
    profile_image_url: draft.profile_image_url || null,
    banner_image_url: draft.banner_image_url || null,
    company_logo_url: draft.company_logo_url || null,
    theme: draft.theme || null,
  };
}
