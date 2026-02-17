import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Notification } from "@/data/mockData";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          message: n.message,
          read: n.read,
          createdAt: n.created_at,
          type: n.type,
          projectId: n.project_id ?? undefined,
          targetTab: n.target_tab ?? undefined,
          targetItemId: n.target_item_id ?? undefined,
          projectName: n.project_name ?? undefined,
          contextPreview: n.context_preview ?? undefined,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await (supabase as any).from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = async (id: string) => {
    await (supabase as any).from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    if (!user) return;
    await (supabase as any).from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAsRead, dismiss, clearAll, refetch: fetchNotifications };
}
