import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateReservation } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import { useCreateGuest, useGuests } from "@/hooks/use-guests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
  initialSuite?: string;
  initialCheckIn?: string;
}

export default function NewReservationDialog({ open, onClose, initialSuite = "", initialCheckIn = "" }: Props) {
  const { data: suites } = useSuites();
  const { data: guests } = useGuests();
  const createReservation = useCreateReservation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_country: "",
    suite_name: "",
    check_in: "",
    check_out: "",
    source: "Direct",
    notes: "",
    custom_total: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ guest_name: "", guest_email: "", guest_phone: "", guest_country: "", suite_name: initialSuite, check_in: initialCheckIn, check_out: "", source: "Direct", notes: "", custom_total: "" });
    }
  }, [open, initialSuite, initialCheckIn]);

  if (!open) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const selectedSuite = suites?.find(s => s.name === form.suite_name);
  const suggestedTotal = selectedSuite ? nights * selectedSuite.price_per_night : 0;
  const totalAmount = form.custom_total ? parseFloat(form.custom_total) : suggestedTotal;

  const generateCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `R-${num}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !form.guest_email || !form.suite_name || !form.check_in || !form.check_out) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (totalAmount <= 0) {
      toast.error("Please enter a valid total amount");
      return;
    }

    try {
      // Upsert guest: find existing by email or create new
      const existingGuest = guests?.find(g => g.email.toLowerCase() === form.guest_email.toLowerCase());
      
      if (existingGuest) {
        // Update existing guest stats
        await supabase.from("guests").update({
          name: form.guest_name,
          total_stays: (existingGuest.total_stays || 0) + 1,
          total_spent: (existingGuest.total_spent || 0) + totalAmount,
          last_suite: form.suite_name,
          last_visit: new Date(form.check_in).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          ...(form.guest_phone ? { phone: form.guest_phone } : {}),
          ...(form.guest_country ? { country: form.guest_country } : {}),
        }).eq("id", existingGuest.id);
      } else {
        // Create new guest
        await supabase.from("guests").insert({
          name: form.guest_name,
          email: form.guest_email,
          phone: form.guest_phone || null,
          country: form.guest_country || null,
          total_stays: 1,
          total_spent: totalAmount,
          last_suite: form.suite_name,
          last_visit: new Date(form.check_in).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          rating: 4,
          vip: false,
        });
      }

      await createReservation.mutateAsync({
        reservation_code: generateCode(),
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone || null,
        guest_country: form.guest_country || null,
        guest_country_flag: null,
        suite_name: form.suite_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights,
        total_amount: totalAmount,
        balance: totalAmount,
        source: form.source,
        notes: form.notes || null,
        status: "pending",
        invoice_status: "not-invoiced",
      });

      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Reservation created & guest updated!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create reservation");
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">New Reservation</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Guest Info */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
              <input value={form.guest_name} onChange={e => update("guest_name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
              <input type="email" value={form.guest_email} onChange={e => update("guest_email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <input value={form.guest_phone} onChange={e => update("guest_phone", e.target.value)} placeholder="+30 ..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
              <input value={form.guest_country} onChange={e => update("guest_country", e.target.value)} placeholder="e.g. Greece"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>

          {/* Reservation Info */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Reservation Details</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Suite *</label>
            <select value={form.suite_name} onChange={e => update("suite_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent">
              <option value="">Select a suite...</option>
              {suites?.map(s => (
                <option key={s.id} value={s.name}>{s.name} — €{s.price_per_night}/night</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in *</label>
              <input type="date" value={form.check_in} onChange={e => update("check_in", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out *</label>
              <input type="date" value={form.check_out} onChange={e => update("check_out", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
              <select value={form.source} onChange={e => update("source", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent">
                <option>Direct</option><option>Booking.com</option><option>Airbnb</option><option>Expedia</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Total Price (€) *</label>
              <input
                type="number"
                step="0.01"
                value={form.custom_total || (suggestedTotal > 0 ? suggestedTotal : "")}
                onChange={e => update("custom_total", e.target.value)}
                placeholder="Auto-calculated"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>

          {nights > 0 && selectedSuite && !form.custom_total && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{nights} night{nights > 1 ? "s" : ""} × €{selectedSuite.price_per_night}</span>
              <span className="font-semibold text-foreground">€{suggestedTotal.toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createReservation.isPending}
              className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {createReservation.isPending ? "Creating..." : "Create Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
