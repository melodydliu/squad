import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@/data/mockData";
import { Bell, Flower2, CheckCircle2, Package, Camera, MessageCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  project: Flower2,
  approval: CheckCircle2,
  inventory: Package,
  design: Camera,
  comment: MessageCircle,
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { notifications, loading, markAsRead, dismiss, clearAll } = useNotifications();

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismiss(id);
  };

  const handleClearAll = () => {
    clearAll();
    toast.success("All notifications cleared");
  };

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    if (!n.projectId) return;

    const params = new URLSearchParams({ role: role || "freelancer" });
    if (n.targetTab && n.targetTab !== "overview") {
      params.set("tab", n.targetTab);
    }
    if (n.targetItemId) {
      params.set("highlight", n.targetItemId);
    }
    navigate(`/project/${n.projectId}?${params.toString()}`);
  };

  return (
    <AppLayout role={role || "freelancer"} title="Notifications">
      <div className="space-y-3">
        {notifications.length > 0 && (
          <div className="flex items-center justify-end">
            <button onClick={handleClearAll} className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
              Clear all
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        )}

        {!loading && (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const Icon = iconMap[n.type] || Bell;
                const isActionable = !!n.projectId;
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                    transition={{ duration: 0.2 }}
                    onClick={() => isActionable && handleClick(n)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors relative group",
                      n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20",
                      isActionable && "cursor-pointer active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0", n.read ? "bg-muted" : "bg-primary/10")}>
                      <Icon className={cn("w-4 h-4", n.read ? "text-muted-foreground" : "text-primary")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.projectName && <p className="text-[11px] font-semibold text-primary mb-0.5 uppercase tracking-wide">{n.projectName}</p>}
                      <p className={cn("text-sm leading-snug", n.read ? "text-muted-foreground" : "text-foreground font-medium")}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[11px] text-muted-foreground/70">
                          {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                        <span className="text-muted-foreground/30">·</span>
                        <button onClick={(e) => handleDismiss(n.id, e)} className="text-[11px] text-muted-foreground/50 hover:text-destructive transition-colors">Dismiss</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-1">
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                      {isActionable && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs mt-1">No notifications to show</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
