import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

export interface AnalysisFlag {
  id: string;
  analysis_id: string;
  user_id: string;
  reason: string;
  dismissed: boolean;
  dismissed_by: string | null;
  created_at: string;
}

interface FlagNotifyParams {
  action: "flag" | "unflag";
  companyName: string;
  reason?: string;
  uploaderUserId: string;
  analysisUrl: string;
}

export function useAnalysisFlags(analysisId: string | undefined) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();

  const { data: flags = [] } = useQuery({
    queryKey: ["analysis-flags", analysisId],
    queryFn: async () => {
      if (!analysisId) return [];
      const { data, error } = await supabase
        .from("analysis_flags")
        .select("*")
        .eq("analysis_id", analysisId)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data as AnalysisFlag[];
    },
    enabled: !!analysisId && !!user,
  });

  const activeFlags = flags.filter(f => !f.dismissed);
  const userHasFlagged = flags.some(f => f.user_id === user?.id && !f.dismissed);
  const flagCount = activeFlags.length;
  const showWarning = flagCount >= 2;

  const sendFlagNotification = async (params: FlagNotifyParams) => {
    try {
      await supabase.functions.invoke("notify-flag-status", {
        body: {
          action: params.action,
          analysis_id: analysisId,
          company_name: params.companyName,
          reason: params.reason || "",
          analysis_url: params.analysisUrl,
          uploader_user_id: params.uploaderUserId,
        },
      });
    } catch (err) {
      console.error("Failed to send flag notification:", err);
    }
  };

  const submitFlag = useMutation({
    mutationFn: async (reason: string) => {
      if (!user || !analysisId) throw new Error("Not authenticated");
      const { error } = await supabase.from("analysis_flags").insert({
        analysis_id: analysisId,
        user_id: user.id,
        reason,
      } as any);
      if (error) throw error;
      return reason;
    },
    onSuccess: () => {
      toast.success("Analysis flagged as suspicious");
      queryClient.invalidateQueries({ queryKey: ["analysis-flags", analysisId] });
    },
    onError: (err: any) => {
      if (err.message?.includes("unique")) {
        toast.error("You have already flagged this analysis");
      } else {
        toast.error("Failed to submit flag");
      }
    },
  });

  const unflagAnalysis = useMutation({
    mutationFn: async () => {
      if (!user || !analysisId) throw new Error("Not authenticated");
      // Dismiss all active flags for this analysis (admin action)
      const { error } = await supabase
        .from("analysis_flags")
        .update({ dismissed: true, dismissed_by: user.id } as any)
        .eq("analysis_id", analysisId)
        .eq("dismissed", false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Analysis unflagged");
      queryClient.invalidateQueries({ queryKey: ["analysis-flags", analysisId] });
    },
    onError: () => toast.error("Failed to unflag analysis"),
  });

  const dismissFlag = useMutation({
    mutationFn: async (flagId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("analysis_flags")
        .update({ dismissed: true, dismissed_by: user.id } as any)
        .eq("id", flagId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Flag dismissed");
      queryClient.invalidateQueries({ queryKey: ["analysis-flags", analysisId] });
    },
    onError: () => toast.error("Failed to dismiss flag"),
  });

  const dismissAllFlags = useMutation({
    mutationFn: async () => {
      if (!user || !analysisId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("analysis_flags")
        .update({ dismissed: true, dismissed_by: user.id } as any)
        .eq("analysis_id", analysisId)
        .eq("dismissed", false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All flags dismissed");
      queryClient.invalidateQueries({ queryKey: ["analysis-flags", analysisId] });
    },
    onError: () => toast.error("Failed to dismiss flags"),
  });

  return { flags, activeFlags, userHasFlagged, flagCount, showWarning, submitFlag, dismissFlag, dismissAllFlags, unflagAnalysis, sendFlagNotification, isAdmin };
}
