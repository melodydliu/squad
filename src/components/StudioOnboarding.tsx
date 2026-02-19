"use client";

import { useState } from "react";
import { Building2, Camera, ChevronRight, Globe, Lock, Users } from "lucide-react";
import MobilePhotoUpload from "@/components/MobilePhotoUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Studio } from "@/hooks/useStudio";
import { cn } from "@/lib/utils";

interface StudioOnboardingProps {
  studio: Studio;
  onComplete: () => void;
}

const STEPS = ["Name", "Logo", "Visibility", "Done"] as const;
type Step = 0 | 1 | 2 | 3;

const StudioOnboarding = ({ studio, onComplete }: StudioOnboardingProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState(studio.name || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(studio.logoUrl);
  const [visibility, setVisibility] = useState<"open" | "private">(studio.visibility);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleNameNext = async () => {
    if (!name.trim()) { toast.error("Please enter a studio name."); return; }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("studios")
      .update({ name: name.trim() })
      .eq("admin_id", user?.id);
    setSaving(false);
    if (error) { toast.error("Failed to save name."); return; }
    setStep(1);
  };

  const handleLogoPhoto = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoNext = async () => {
    setSaving(true);
    try {
      if (logoFile && user) {
        const ext = logoFile.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("studio-logos")
          .upload(path, logoFile, { upsert: true });
        if (uploadErr) { toast.error("Failed to upload logo."); setSaving(false); return; }
        const { data: { publicUrl } } = supabase.storage.from("studio-logos").getPublicUrl(path);
        await (supabase as any)
          .from("studios")
          .update({ logo_url: publicUrl })
          .eq("admin_id", user.id);
      }
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityNext = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("studios")
      .update({ visibility })
      .eq("admin_id", user?.id);
    setSaving(false);
    if (error) { toast.error("Failed to save visibility."); return; }
    setStep(3);
  };

  const handleDone = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("studios")
      .update({ onboarding_completed: true })
      .eq("admin_id", user?.id);
    setSaving(false);
    if (error) { toast.error("Something went wrong."); return; }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <div
        className="w-full max-w-[512px] bg-card rounded-t-2xl shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Set Up Your Studio</h2>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Later
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {STEPS.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {Math.min(step + 1, 3)} of 3</p>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Step 0: Name */}
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Studio Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bloom & Co Studio"
                  maxLength={80}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={handleNameNext}
                disabled={saving}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 1: Logo */}
          {step === 1 && (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Studio logo"
                      className="w-24 h-24 rounded-2xl object-cover border border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center border border-border">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <MobilePhotoUpload onPhoto={handleLogoPhoto} className="absolute -bottom-2 -right-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </MobilePhotoUpload>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Add a logo so freelancers recognise your studio
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg border border-input bg-muted text-muted-foreground font-medium text-sm hover:opacity-80 transition-opacity"
                >
                  Skip
                </button>
                <button
                  onClick={handleLogoNext}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Visibility */}
          {step === 2 && (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  How should your studio appear to freelancers?
                </p>
                <button
                  onClick={() => setVisibility("open")}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                    visibility === "open" ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <Globe className={cn("w-5 h-5 mt-0.5 shrink-0", visibility === "open" ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className={cn("text-sm font-semibold", visibility === "open" ? "text-primary" : "text-foreground")}>Open</p>
                    <p className="text-xs text-muted-foreground">Your studio is discoverable; public projects are visible to all freelancers</p>
                  </div>
                </button>
                <button
                  onClick={() => setVisibility("private")}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                    visibility === "private" ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <Lock className={cn("w-5 h-5 mt-0.5 shrink-0", visibility === "private" ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className={cn("text-sm font-semibold", visibility === "private" ? "text-primary" : "text-foreground")}>Private</p>
                    <p className="text-xs text-muted-foreground">Only invited freelancers on your roster can see your projects</p>
                  </div>
                </button>
              </div>
              <button
                onClick={handleVisibilityNext}
                disabled={saving}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <>
              <div className="text-center space-y-3 py-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10">
                  <Building2 className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Studio ready!</h3>
                <p className="text-sm text-muted-foreground">
                  Your studio is set up. Invite your first freelancer to get started.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDone}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={async () => {
                    await handleDone();
                  }}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Invite Freelancer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioOnboarding;
