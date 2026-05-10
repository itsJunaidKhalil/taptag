"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner";

interface Step2Props {
  userId: string;
  username: string;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Profile({ userId, username, onNext, onBack }: Step2Props) {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired — please refresh");
        return;
      }
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: userId,
          username,
          full_name: fullName || null,
          company: company || null,
          profile_image_url: photoUrl || null,
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Could not save profile");
      onNext();
    } catch (e: any) {
      toast.error(e.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
          Add your basics
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          A photo and your name help people recognize you instantly.
        </p>
      </div>

      <ImageUploader
        userId={userId}
        bucket="profile-images"
        currentUrl={photoUrl}
        onUploadComplete={setPhotoUrl}
        label="Profile photo (optional)"
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Company / role <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Senior Designer at Acme"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all font-semibold shadow-soft"
        >
          {saving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}
