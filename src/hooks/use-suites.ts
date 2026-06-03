import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Suite = Tables<"suites">;

export function useSuites() {
  return useQuery({
    queryKey: ["suites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suites")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Suite[];
    },
  });
}

export function useCreateSuite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (suite: TablesInsert<"suites">) => {
      const { data, error } = await supabase
        .from("suites")
        .insert(suite)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suites"] });
    },
  });
}

export function useUpdateSuite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"suites"> & { id: string }) => {
      const { data, error } = await supabase
        .from("suites")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suites"] });
    },
  });
}
