"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  userId: string;
  bucket: "profile-images" | "banners";
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  label: string;
  /** When set to company_logo, file is stored as company-logo-{userId}.ext in the bucket (banners only). */
  uploadSlot?: "default" | "company_logo";
}

export default function ImageUploader({
  userId,
  bucket,
  currentUrl,
  onUploadComplete,
  label,
  uploadSlot = "default",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputId = `${bucket}-${uploadSlot}-${userId}-upload`;

  const withCacheBust = (url: string) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  };

  // Update preview when currentUrl changes
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      // Get current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("You must be logged in to upload images");
      }

      // Try API route first (more secure)
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        formData.append("userId", userId);
        if (uploadSlot !== "default") {
          formData.append("uploadSlot", uploadSlot);
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to upload image");
        }

        const freshUrl = withCacheBust(result.url);
        setPreview(freshUrl);
        onUploadComplete(freshUrl);
        e.target.value = "";
        return;
      } catch (apiError: any) {
        // Fallback to direct client upload if API route fails
        console.warn("API upload failed, trying direct upload:", apiError);
        
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName =
          uploadSlot === "company_logo"
            ? `company-logo-${userId}.${fileExt}`
            : `${userId}.${fileExt}`;
        const filePath = `${fileName}`;

        // Remove old file if exists (ignore errors if file doesn't exist)
        await supabase.storage.from(bucket).remove([fileName]).catch(() => {
          // Ignore errors when removing non-existent files
        });
        if (uploadSlot === "company_logo") {
          const exts = ["jpg", "jpeg", "png", "webp", "gif"];
          const stale = exts
            .filter((e) => e !== fileExt)
            .map((e) => `company-logo-${userId}.${e}`);
          await supabase.storage.from(bucket).remove(stale).catch(() => {});
        }

        // Upload new file
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { 
            upsert: true,
            contentType: file.type
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(uploadError.message || "Failed to upload image");
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        const freshUrl = withCacheBust(publicUrl);
        setPreview(freshUrl);
        onUploadComplete(freshUrl);
        e.target.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const errorMessage = error.message || "Error uploading image. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {preview && (
          <img
            src={preview}
            alt={label}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border flex-shrink-0"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
        <div className="flex-1 w-full">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor={inputId}
            className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              uploading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {uploading ? "Uploading..." : `Choose ${label}`}
          </label>
          {uploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploading...</p>}
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

