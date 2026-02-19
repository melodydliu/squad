"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Studio {
  id: string;
  adminId: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  visibility: "open" | "private";
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useStudio() {
  const { user } = useAuth();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudio = useCallback(async () => {
    if (!user) {
      setStudio(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("studios")
        .select("*")
        .eq("admin_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching studio:", error);
        setStudio(null);
        return;
      }
      if (!data) {
        setStudio(null);
        return;
      }
      setStudio({
        id: data.id,
        adminId: data.admin_id,
        name: data.name,
        logoUrl: data.logo_url ?? null,
        description: data.description ?? null,
        visibility: data.visibility as "open" | "private",
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudio();
  }, [fetchStudio]);

  const updateStudio = useCallback(
    async (updates: Partial<Pick<Studio, "name" | "logoUrl" | "description" | "visibility" | "onboardingCompleted">>) => {
      if (!user) return { error: "Not authenticated" };
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.visibility !== undefined) dbUpdates.visibility = updates.visibility;
      if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

      const { error } = await (supabase as any)
        .from("studios")
        .update(dbUpdates)
        .eq("admin_id", user.id);

      if (!error) {
        await fetchStudio();
      }
      return { error };
    },
    [user, fetchStudio]
  );

  return { studio, loading, updateStudio, refetch: fetchStudio };
}
