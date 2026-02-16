import AppLayout from "@/components/AppLayout";
import { mockNotifications } from "@/data/mockData";
import { Bell, Flower2, CheckCircle2, Package, Camera, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  project: Flower2,
  approval: CheckCircle2,
  inventory: Package,
  design: Camera,
  comment: MessageCircle,
};

const NotificationsPage = () => {
  return (
    <AppLayout role="freelancer" title="Notifications">
      <div className="space-y-2">
        {mockNotifications.map((n) => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
              )}
            >
              <div className={cn(
                "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                n.read ? "bg-muted" : "bg-primary/10"
              )}>
                <Icon className={cn("w-4 h-4", n.read ? "text-muted-foreground" : "text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm leading-snug", n.read ? "text-muted-foreground" : "text-foreground font-medium")}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
