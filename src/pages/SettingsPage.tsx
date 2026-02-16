import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useNotificationPreferences, NotificationEvent, Channel } from "@/hooks/useNotificationPreferences";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Mail, MessageSquare, Smartphone } from "lucide-react";
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

const SettingsPage = ({ role }: SettingsPageProps) => {
  const { preferences, toggle, events } = useNotificationPreferences(role);
  const groups = groupByCategory(events);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.category))
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
