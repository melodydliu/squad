"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { useNotificationPreferences, NotificationEvent, Channel } from "@/hooks/useNotificationPreferences";
import { useStudio } from "@/hooks/useStudio";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Mail, MessageSquare, Smartphone, Users, Link, Copy, X, UserRound, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SettingsPageProps {
  role: "admin" | "freelancer";
}

const CHANNEL_META: { key: Channel; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: Smartphone },
  { key: "in_app", label: "In-App", icon: MessageSquare },
];

function groupByCategory(events: NotificationEvent[]) {
  const groups: { category: string; events: NotificationEvent[] }[] = [];
  const map = new Map<string, NotificationEvent[]>();
  for (const ev of events) {
    if (!map.has(ev.category)) {
      const arr: NotificationEvent[] = [];
      map.set(ev.category, arr);
      groups.push({ category: ev.category, events: arr });
    }
    map.get(ev.category)!.push(ev);
  }
  return groups;
}

interface RosterMember {
  id: string;
  freelancerId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  token: string;
  status: string;
  invitedAt: string;
}

const TeamSection = ({ studioId }: { studioId: string }) => {
  const { user } = useAuth();
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchTeam = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const [{ data: rosterData }, { data: inviteData }] = await Promise.all([
        (supabase as any)
          .from("studio_roster")
          .select("id, freelancer_id, joined_at")
          .eq("studio_id", studioId),
        (supabase as any)
          .from("studio_invites")
          .select("id, email, token, status, invited_at")
          .eq("studio_id", studioId)
          .order("invited_at", { ascending: false }),
      ]);

      if (rosterData && rosterData.length > 0) {
        const freelancerIds = rosterData.map((r: any) => r.freelancer_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email, avatar_url")
          .in("user_id", freelancerIds);

        const profileMap = new Map(
          (profilesData || []).map((p) => [p.user_id, p])
        );

        setRoster(
          rosterData.map((r: any) => {
            const p = profileMap.get(r.freelancer_id);
            return {
              id: r.id,
              freelancerId: r.freelancer_id,
              firstName: p?.first_name ?? "",
              lastName: p?.last_name ?? "",
              email: p?.email ?? "",
              avatarUrl: p?.avatar_url ?? "",
              joinedAt: r.joined_at,
            };
          })
        );
      } else {
        setRoster([]);
      }

      setInvites(
        (inviteData || []).map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          token: inv.token,
          status: inv.status,
          invitedAt: inv.invited_at,
        }))
      );
    } finally {
      setLoadingTeam(false);
    }
  }, [studioId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleGenerateLink = async () => {
    if (!inviteEmail.trim()) { toast.error("Enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      toast.error("Enter a valid email.");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await (supabase as any)
        .from("studio_invites")
        .upsert(
          { studio_id: studioId, email: inviteEmail.trim(), invited_by: user?.id },
          { onConflict: "studio_id,email", ignoreDuplicates: false }
        )
        .select("token")
        .single();

      if (error || !data) {
        toast.error("Failed to create invite.");
        return;
      }
      const link = `${window.location.origin}/invite?token=${data.token}`;
      setGeneratedLink(link);
      navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
      await fetchTeam();
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const handleRevoke = async (inviteId: string) => {
    await (supabase as any)
      .from("studio_invites")
      .update({ status: "declined" })
      .eq("id", inviteId);
    await fetchTeam();
    toast.success("Invite revoked.");
  };

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Team</h2>
        <button
          onClick={() => { setShowInviteSheet(true); setGeneratedLink(null); setInviteEmail(""); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Link className="w-3.5 h-3.5" />
          Invite Freelancer
        </button>
      </div>

      {/* Roster */}
      {loadingTeam ? (
        <div className="bg-card rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Loading team…
        </div>
      ) : roster.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-5 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No freelancers on your roster yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate an invite link to bring someone on board.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          {roster.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <UserRound className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Invites</h3>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(inv.invitedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopyLink(inv.token)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Copy link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    title="Revoke"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite sheet */}
      {showInviteSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowInviteSheet(false)}>
          <div
            className="w-full max-w-[512px] bg-card rounded-t-2xl shadow-elevated p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Invite a Freelancer</h3>
              <button onClick={() => setShowInviteSheet(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="freelancer@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            {generatedLink && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground flex-1 truncate">{generatedLink}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Copied!"); }}
                  className="shrink-0 p-1.5 rounded-lg bg-card border border-border hover:bg-primary/5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            )}
            <button
              onClick={handleGenerateLink}
              disabled={generating}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Link className="w-4 h-4" />
              {generatedLink ? "Generate New Link" : "Generate Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPage = ({ role }: SettingsPageProps) => {
  const { preferences, toggle, events } = useNotificationPreferences(role);
  const { studio, loading: studioLoading } = useStudio();
  const groups = groupByCategory(events);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set()
  );

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleToggle = (eventId: string, channel: Channel) => {
    toggle(eventId, channel);
    toast.success("Preference saved", { duration: 1500 });
  };

  return (
    <AppLayout role={role} title="Settings" showBack>
      <div className="space-y-5">
        {/* Team section — admin only */}
        {role === "admin" && !studioLoading && studio && (
          <TeamSection studioId={studio.id} />
        )}

        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how you'd like to be notified for each event.</p>
        </div>

        {groups.map((group) => {
          const isOpen = openCategories.has(group.category);
          return (
            <Collapsible key={group.category} open={isOpen} onOpenChange={() => toggleCategory(group.category)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full bg-card rounded-lg border border-border px-4 py-3 text-left">
                <span className="font-display text-sm font-semibold text-foreground">{group.category}</span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-1 bg-card rounded-lg border border-border divide-y divide-border">
                  {group.events.map((ev) => (
                    <div key={ev.id} className="px-4 py-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ev.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                      </div>
                      <div className="flex items-center gap-5">
                        {CHANNEL_META.map((ch) => {
                          const enabled = preferences[ev.id]?.[ch.key] ?? false;
                          return (
                            <label key={ch.key} className="flex items-center gap-2 cursor-pointer min-w-0">
                              <Switch
                                checked={enabled}
                                onCheckedChange={() => handleToggle(ev.id, ch.key)}
                                className="scale-90"
                              />
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ch.icon className="w-3.5 h-3.5" />
                                <span>{ch.label}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
