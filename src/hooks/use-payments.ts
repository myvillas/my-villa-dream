import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  payment_date: string;
  created_at: string;
}

export function usePayments(reservationId: string | undefined) {
  return useQuery({
    queryKey: ["payments", reservationId],
    enabled: !!reservationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("reservation_id", reservationId!)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: {
      reservation_id: string;
      amount: number;
      method: string;
      reference?: string;
      notes?: string;
      payment_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", variables.reservation_id] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reservationId }: { id: string; reservationId: string }) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
      return reservationId;
    },
    onSuccess: (reservationId) => {
      queryClient.invalidateQueries({ queryKey: ["payments", reservationId] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
