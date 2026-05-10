"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  WHATSAPP_DIAL_COUNTRIES,
  isoToFlagEmoji,
  buildWhatsAppUrlFromDialAndNational,
  guessDefaultCountryIso,
  getDialCountryByIso,
} from "@/lib/whatsappDial";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order_index: number;
}

interface SocialLinksFormProps {
  userId: string;
  initialLinks?: SocialLink[];
  onLinkAdded?: () => void;
}

const PLATFORMS = [
  { 
    name: "Instagram", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ), 
    color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" 
  },
  { 
    name: "Twitter", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ), 
    color: "bg-blue-400" 
  },
  { 
    name: "LinkedIn", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ), 
    color: "bg-blue-600" 
  },
  { 
    name: "Facebook", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ), 
    color: "bg-blue-700" 
  },
  { 
    name: "YouTube", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ), 
    color: "bg-red-600" 
  },
  { 
    name: "GitHub", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ), 
    color: "bg-gray-800" 
  },
  { 
    name: "TikTok", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.65 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ), 
    color: "bg-black" 
  },
  { 
    name: "Website", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ), 
    color: "bg-green-600" 
  },
  { 
    name: "WhatsApp", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ), 
    color: "bg-green-500" 
  },
  { 
    name: "Custom", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ), 
    color: "bg-gray-600" 
  },
];

function isWhatsAppPlatform(platform: string) {
  return platform.toLowerCase() === "whatsapp";
}

export default function SocialLinksForm({ userId, initialLinks = [], onLinkAdded }: SocialLinksFormProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [whatsappCountryIso, setWhatsappCountryIso] = useState(guessDefaultCountryIso);
  const [whatsappNational, setWhatsappNational] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(
      (p) => p.name.toLowerCase() === platform.toLowerCase()
    );
    return platformData?.icon || PLATFORMS[PLATFORMS.length - 1].icon;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = PLATFORMS.find(
      (p) => p.name.toLowerCase() === platform.toLowerCase()
    );
    return platformData?.color || "bg-gray-500";
  };

  const handleAddLink = async () => {
    const whatsappFilled = isWhatsAppPlatform(newPlatform) && whatsappNational.trim();
    const urlFilled = !isWhatsAppPlatform(newPlatform) && newUrl.trim();
    if (!newPlatform || (!whatsappFilled && !urlFilled)) {
      setError(
        isWhatsAppPlatform(newPlatform)
          ? "Please select your country and enter your WhatsApp number"
          : "Please fill in both platform and URL"
      );
      return;
    }

    let processedUrl: string;
    if (isWhatsAppPlatform(newPlatform)) {
      const country = getDialCountryByIso(whatsappCountryIso);
      if (!country) {
        setError("Please select a valid country");
        return;
      }
      const wa = buildWhatsAppUrlFromDialAndNational(country.dialCode, whatsappNational);
      if (!wa.ok) {
        setError(wa.error);
        return;
      }
      processedUrl = wa.url;
    } else {
      processedUrl = newUrl.trim();
      if (processedUrl && !processedUrl.match(/^https?:\/\//i)) {
        processedUrl = `https://${processedUrl}`;
      }
      try {
        new URL(processedUrl);
      } catch {
        setError("Please enter a valid URL (e.g., example.com or https://example.com)");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError("You must be logged in to add links. Please refresh the page.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/social/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          platform: newPlatform,
          url: processedUrl,
          order_index: links.length,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to add link");
      }

      // Add the new link to the list immediately
      setLinks([...links, result.data[0]]);
      setNewPlatform("");
      setNewUrl("");
      setWhatsappNational("");
      setWhatsappCountryIso(guessDefaultCountryIso());
      setShowAddForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Notify parent to reload links
      if (onLinkAdded) {
        onLinkAdded();
      }
    } catch (error: any) {
      console.error("Error adding link:", error);
      setError(error.message || "Error adding link. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert("You must be logged in to delete links.");
        return;
      }

      const response = await fetch("/api/social/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to delete link");
      }

      setLinks(links.filter((link) => link.id !== id));
    } catch (error: any) {
      console.error("Error deleting link:", error);
      alert(error.message || "Error deleting link");
    }
  };

  const handleUpdateOrder = async (linkId: string, direction: "up" | "down") => {
    const linkIndex = links.findIndex((l) => l.id === linkId);
    if (linkIndex === -1) return;

    const newIndex = direction === "up" ? linkIndex - 1 : linkIndex + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert("You must be logged in to reorder links.");
        return;
      }

      // Swap order indices
      const updatedLinks = [...links];
      const currentLink = updatedLinks[linkIndex];
      const targetLink = updatedLinks[newIndex];
      
      const tempOrder = currentLink.order_index;
      currentLink.order_index = targetLink.order_index;
      targetLink.order_index = tempOrder;

      // Update both links
      await Promise.all([
        fetch("/api/social/update", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: linkId, order_index: currentLink.order_index }),
        }),
        fetch("/api/social/update", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ id: targetLink.id, order_index: targetLink.order_index }),
        }),
      ]);

      updatedLinks.sort((a, b) => a.order_index - b.order_index);
      setLinks(updatedLinks);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Social Links</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Link
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            Link added successfully! It will appear on your public profile.
          </p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Add New Link</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={newPlatform}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewPlatform(v);
                  if (isWhatsAppPlatform(v)) setNewUrl("");
                  else setWhatsappNational("");
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a platform</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            {isWhatsAppPlatform(newPlatform) ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country / region
                  </label>
                  <select
                    value={whatsappCountryIso}
                    onChange={(e) => setWhatsappCountryIso(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {WHATSAPP_DIAL_COUNTRIES.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {isoToFlagEmoji(c.iso)} {c.name} (+{c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={whatsappNational}
                    onChange={(e) => setWhatsappNational(e.target.value)}
                    placeholder="0300 1234567 or 300 1234567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your local mobile number only — no country code here. A leading{" "}
                    <span className="font-mono">0</span> is removed automatically. You can also paste a{" "}
                    <span className="font-mono">wa.me</span> link instead.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  autoComplete="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We&apos;ll automatically add https:// if you don&apos;t include it
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddLink}
                disabled={
                  saving ||
                  !newPlatform ||
                  (isWhatsAppPlatform(newPlatform) ? !whatsappNational.trim() : !newUrl.trim())
                }
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "Adding..." : "Add Link"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlatform("");
                  setNewUrl("");
                  setWhatsappNational("");
                  setWhatsappCountryIso(guessDefaultCountryIso());
                  setError(null);
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {links.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No social links yet. Click "Add Link" to get started! Links will appear on your public profile.
          </p>
        ) : (
          links.map((link, index) => (
            <div
              key={link.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${getPlatformColor(link.platform)} flex items-center justify-center text-white flex-shrink-0`}>
                {getPlatformIcon(link.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {link.platform}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.url}
                </p>
              </div>
              <div className="flex gap-2">
                {index > 0 && (
                  <button
                    onClick={() => handleUpdateOrder(link.id, "up")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                )}
                {index < links.length - 1 && (
                  <button
                    onClick={() => handleUpdateOrder(link.id, "down")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
