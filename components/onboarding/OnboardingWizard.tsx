"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import Modal from "@/components/ui/Modal";
import Step1Username from "./Step1Username";
import Step2Profile from "./Step2Profile";
import Step3Links from "./Step3Links";
import Step4Complete from "./Step4Complete";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(true);

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4A3AFF", "#00C4B4", "#FFB800", "#ffffff"],
    });
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
    }, 250);
  };

  const handleSkip = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: userId,
          onboarding_completed_at: new Date().toISOString(),
        }),
      });
    } catch {
      /* ignore */
    } finally {
      setOpen(false);
      setTimeout(onComplete, 200);
    }
  };

  const completeAndClose = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch("/api/profile/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: userId,
            onboarding_completed_at: new Date().toISOString(),
          }),
        });
      }
    } catch (e: any) {
      toast.error("Could not mark onboarding complete");
    }
    setOpen(false);
    setTimeout(onComplete, 200);
  };

  return (
    <Modal open={open} onOpenChange={() => {}} hideClose size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <ProgressDots current={step} />
          <button
            onClick={handleSkip}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>

        {step === 1 && (
          <Step1Username
            initialUsername={username}
            onNext={(u) => {
              setUsername(u);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2Profile
            userId={userId}
            username={username}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Links
            userId={userId}
            onNext={() => {
              fireConfetti();
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4Complete username={username} onClose={completeAndClose} />
        )}
      </div>
    </Modal>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current
              ? "w-8 bg-gradient-primary"
              : i < current
                ? "w-2 bg-primary-400"
                : "w-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
