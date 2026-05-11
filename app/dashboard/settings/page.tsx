"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfileById } from "@/lib/getProfile";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";
import EmailVerificationBanner from "@/components/account/EmailVerificationBanner";
import AccountRecoveryBanner from "@/components/account/AccountRecoveryBanner";
import ExportDataSection from "@/components/account/ExportDataSection";
import DeleteAccountSection from "@/components/account/DeleteAccountSection";

interface ProfileLite {
  id: string;
  username: string | null;
  deleted_at: string | null;
  scheduled_deletion_at: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      try {
        const p = await getProfileById(user.id);
        setProfile(p as ProfileLite);
      } catch (e) {
        console.error("Error loading profile:", e);
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  const emailConfirmed = !!(user?.email_confirmed_at || user?.confirmed_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <AccountRecoveryBanner
        profileId={profile?.id}
        deletedAt={profile?.deleted_at}
        scheduledDeletionAt={profile?.scheduled_deletion_at}
        onRestored={() =>
          setProfile((p) => (p ? { ...p, deleted_at: null, scheduled_deletion_at: null } : p))
        }
      />
      <EmailVerificationBanner />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text mb-2">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your email, export your data, or delete your account.
          </p>
        </div>

        {loading ? (
          <>
            <Skeleton className="h-44 w-full" rounded="3xl" />
            <Skeleton className="h-40 w-full" rounded="3xl" />
            <Skeleton className="h-52 w-full" rounded="3xl" />
          </>
        ) : (
          <>
            <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
              <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-2">
                Email
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">
                Signed in as <strong>{user?.email || "—"}</strong>.
              </p>
              <p
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${
                  emailConfirmed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    emailConfirmed ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {emailConfirmed ? "Verified" : "Not verified"}
              </p>
              {!emailConfirmed && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Use the banner at the top of the page to resend the verification email.
                </p>
              )}
            </section>

            <ExportDataSection />

            <DeleteAccountSection
              username={profile?.username}
              onScheduled={() =>
                setProfile((p) =>
                  p
                    ? {
                        ...p,
                        deleted_at: new Date().toISOString(),
                        scheduled_deletion_at: new Date(
                          Date.now() + 30 * 86400000,
                        ).toISOString(),
                      }
                    : p,
                )
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
