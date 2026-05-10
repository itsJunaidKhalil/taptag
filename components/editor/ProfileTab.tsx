"use client";

import { useEditorStore } from "@/lib/store/editorStore";
import ImageUploader from "@/components/ImageUploader";

interface ProfileTabProps {
  userId: string;
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const draft = useEditorStore((s) => s.draft);
  const updateField = useEditorStore((s) => s.updateField);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Changes auto-save as you type. Watch the preview update live.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

      <Field
        label="Username *"
        helper={`Your profile lives at /${draft.username || "username"}`}
      >
        <input
          type="text"
          value={draft.username}
          onChange={(e) => updateField("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
          className="input"
          placeholder="johndoe"
          required
        />
      </Field>

      <Field label="Full name">
        <input
          type="text"
          value={draft.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
          className="input"
          placeholder="John Doe"
        />
      </Field>

      <Field label="Company / role">
        <input
          type="text"
          value={draft.company}
          onChange={(e) => updateField("company", e.target.value)}
          className="input"
          placeholder="Senior Designer at Acme"
        />
      </Field>

      <Field label="About">
        <textarea
          value={draft.about}
          onChange={(e) => updateField("about", e.target.value)}
          rows={4}
          maxLength={300}
          className="input resize-none"
          placeholder="A short bio..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {draft.about.length}/300
        </p>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone">
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="input"
            placeholder="+1 555 555 5555"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={draft.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="input"
            placeholder="hello@example.com"
          />
        </Field>
      </div>

      <Field label="Website" helper="We'll auto-add https:// if you forget">
        <input
          type="text"
          value={draft.website}
          onChange={(e) => updateField("website", e.target.value)}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && !/^https?:\/\//i.test(v)) updateField("website", `https://${v}`);
          }}
          className="input"
          placeholder="https://example.com"
        />
      </Field>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(209, 213, 219, 0.5);
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.7);
          color: rgb(17, 24, 39);
          transition: all 200ms ease;
        }
        .input:focus {
          outline: none;
          border-color: #4a3aff;
          box-shadow: 0 0 0 2px rgba(74, 58, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {children}
      {helper && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{helper}</p>
      )}
    </div>
  );
}
