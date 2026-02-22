import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

export function useAnalysisFlags(analysisId: string | undefined) {
  const { user } = useAuth();
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

  const submitFlag = useMutation({
    mutationFn: async (reason: string) => {
      if (!user || !analysisId) throw new Error("Not authenticated");
      const { error } = await supabase.from("analysis_flags").insert({
        analysis_id: analysisId,
        user_id: user.id,
        reason,
      } as any);
      if (error) throw error;
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

  return { flags, activeFlags, userHasFlagged, flagCount, showWarning, submitFlag, dismissFlag, dismissAllFlags };
}
