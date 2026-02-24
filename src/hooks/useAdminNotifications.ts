import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useEffect } from "react";

export interface AdminNotification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  analysis_id: string | null;
  created_at: string;
}

export function useAdminNotifications() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase
        .from("admin_notifications")
        .select("*") as any)
        .eq("admin_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as AdminNotification[];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Listen for realtime inserts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-notif-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
          filter: `admin_user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-notifications", user.id] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin, queryClient]);

  const markAllRead = async () => {
    if (!user) return;
    await (supabase
      .from("admin_notifications")
      .update({ read: true }) as any)
      .eq("admin_user_id", user.id)
      .eq("read", false);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications", user.id] });
  };

  const unreadCount = (query.data || []).filter((n) => !n.read).length;

  return {
    notifications: query.data || [],
    unreadCount,
    markAllRead,
    isLoading: query.isLoading,
  };
}
