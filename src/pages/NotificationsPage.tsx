import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { mockNotifications, Notification } from "@/data/mockData";
import { Bell, Flower2, CheckCircle2, Package, Camera, MessageCircle, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const iconMap = {
  project: Flower2,
  approval: CheckCircle2,
  inventory: Package,
  design: Camera,
  comment: MessageCircle,
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([...mockNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const dismissOne = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <AppLayout role="freelancer" title="Notifications">
      <div className="space-y-3">
        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors relative group",
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
                  <button
                    onClick={() => dismissOne(n.id)}
                    className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
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