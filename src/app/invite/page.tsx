"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Flower2, Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface InviteData {
  id: string;
  email: string;
  token: string;
  status: string;
  studioId: string;
  studioName: string;
  studioLogoUrl: string | null;
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoadingInvite(false); return; }
    const fetchInvite = async () => {
      const { data, error } = await (supabase as any)
        .from("studio_invites")
        .select("id, email, token, status, studio_id, studios(name, logo_url)")
        .eq("token", token)
        .maybeSingle();

      setLoadingInvite(false);
      if (error || !data) { setNotFound(true); return; }
      setInvite({
        id: data.id,
        email: data.email,
        token: data.token,
        status: data.status,
        studioId: data.studio_id,
        studioName: data.studios?.name ?? "a studio",
        studioLogoUrl: data.studios?.logo_url ?? null,
      });
    };
    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!invite) return;
    if (!user) {
      router.push(`/?returnTo=/invite?token=${token}`);
      return;
    }
    setAccepting(true);
    try {
      // Insert roster entry (ignore if already exists)
      await (supabase as any)
        .from("studio_roster")
        .upsert(
          { studio_id: invite.studioId, freelancer_id: user.id },
          { onConflict: "studio_id,freelancer_id", ignoreDuplicates: true }
        );

      // Update invite status
      await (supabase as any)
        .from("studio_invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      setInvite((prev) => prev ? { ...prev, status: "accepted" } : prev);
      toast.success(`You've joined ${invite.studioName}!`);
      setTimeout(() => router.push("/freelancer"), 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invite) return;
    await (supabase as any)
      .from("studio_invites")
      .update({ status: "declined" })
      .eq("id", invite.id);
    setInvite((prev) => prev ? { ...prev, status: "declined" } : prev);
    toast("Invitation declined.");
  };

  if (authLoading || loadingInvite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-4">
        <XCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-semibold text-foreground">Invite not found</h1>
        <p className="text-sm text-muted-foreground">This link may be invalid or has expired.</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">Go home</Link>
      </div>
    );
  }

  if (!invite) return null;

  if (invite.status === "accepted") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-success" />
        <h1 className="text-xl font-semibold text-foreground">Already a member</h1>
        <p className="text-sm text-muted-foreground">You're already on the roster for {invite.studioName}.</p>
        {user ? (
          <Link href="/freelancer" className="text-primary text-sm font-medium hover:underline">Go to dashboard</Link>
        ) : (
          <Link href="/" className="text-primary text-sm font-medium hover:underline">Sign in</Link>
        )}
      </div>
    );
  }

  if (invite.status === "declined") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-4">
        <XCircle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Invitation declined</h1>
        <p className="text-sm text-muted-foreground">You declined the invitation to {invite.studioName}.</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
            <Flower2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">You're invited!</h1>
        </div>

        {/* Studio card */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
          {invite.studioLogoUrl ? (
            <img
              src={invite.studioLogoUrl}
              alt={invite.studioName}
              className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Invitation from</p>
            <p className="text-base font-semibold text-foreground">{invite.studioName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sent to {invite.email}</p>
          </div>
        </div>

        {/* Not logged in notice */}
        {!user && (
          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground text-center">
            <Link href={`/?returnTo=/invite?token=${token}`} className="text-primary font-medium hover:underline">Sign in</Link>
            {" "}or{" "}
            <Link href={`/signup`} className="text-primary font-medium hover:underline">create an account</Link>
            {" "}to join {invite.studioName}.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={accepting}
            className="flex-1 py-3 rounded-lg border border-input bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {accepting && <Loader2 className="w-4 h-4 animate-spin" />}
            Accept Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
