import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateReservation } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import { useGuests } from "@/hooks/use-guests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewReservationDialog({ open, onClose }: Props) {
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
    occupants_adults: "2",
    occupants_children: "0",
    source: "Direct",
    notes: "",
    custom_total: "",
    deposit: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        guest_name: "", guest_email: "", guest_phone: "", guest_country: "",
        suite_name: "", check_in: "", check_out: "",
        occupants_adults: "2", occupants_children: "0",
        source: "Direct", notes: "", custom_total: "", deposit: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const selectedSuite = suites?.find(s => s.name === form.suite_name);
  const suggestedTotal = selectedSuite ? nights * selectedSuite.price_per_night : 0;
  const totalAmount = form.custom_total ? parseFloat(form.custom_total) : suggestedTotal;
  const deposit = form.deposit ? parseFloat(form.deposit) : 0;
  const balance = Math.max(0, totalAmount - deposit);

  const generateCode = () => `R-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !form.suite_name || !form.check_in || !form.check_out) {
      toast.error("Συμπλήρωσε: Όνομα, Δωμάτιο, Check-in, Check-out");
      return;
    }
    if (nights <= 0) {
      toast.error("Το check-out πρέπει να είναι μετά το check-in");
      return;
    }
    if (totalAmount <= 0) {
      toast.error("Εισήγαγε έγκυρο συνολικό ποσό");
      return;
    }

    try {
      const email = form.guest_email || `${form.guest_name.toLowerCase().replace(/\s+/g, ".")}@guest.local`;

      const existingGuest = guests?.find(g => g.email.toLowerCase() === email.toLowerCase());
      if (existingGuest) {
        await supabase.from("guests").update({
          name: form.guest_name,
          total_stays: (existingGuest.total_stays || 0) + 1,
          total_spent: (existingGuest.total_spent || 0) + totalAmount,
          last_suite: form.suite_name,
          last_visit: new Date(form.check_in).toLocaleDateString("el-GR", { month: "short", year: "numeric" }),
          ...(form.guest_phone ? { phone: form.guest_phone } : {}),
          ...(form.guest_country ? { country: form.guest_country } : {}),
        }).eq("id", existingGuest.id);
      } else {
        await supabase.from("guests").insert({
          name: form.guest_name,
          email,
          phone: form.guest_phone || null,
          country: form.guest_country || null,
          total_stays: 1,
          total_spent: totalAmount,
          last_suite: form.suite_name,
          last_visit: new Date(form.check_in).toLocaleDateString("el-GR", { month: "short", year: "numeric" }),
          rating: 4,
          vip: false,
        });
      }

      const reservationCode = generateCode();
      await createReservation.mutateAsync({
        reservation_code: reservationCode,
        guest_name: form.guest_name,
        guest_email: email,
        guest_phone: form.guest_phone || null,
        guest_country: form.guest_country || null,
        guest_country_flag: null,
        suite_name: form.suite_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights,
        total_amount: totalAmount,
        balance,
        source: form.source,
        notes: form.notes || null,
        status: "pending",
        occupants_adults: parseInt(form.occupants_adults) || 2,
        occupants_children: parseInt(form.occupants_children) || 0,
      });

      // Record deposit as payment if provided
      if (deposit > 0) {
        const { data: newRes } = await supabase
          .from("reservations")
          .select("id")
          .eq("reservation_code", reservationCode)
          .single();
        if (newRes) {
          await supabase.from("payments").insert({
            reservation_id: newRes.id,
            amount: deposit,
            method: "cash",
            notes: "Προκαταβολή",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success(`Η κράτηση δημιουργήθηκε! (${reservationCode})`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Σφάλμα δημιουργίας κράτησης");
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">Νέα Κράτηση</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Guest Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Στοιχεία Πελάτη</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Όνομα *</label>
                <input
                  value={form.guest_name}
                  onChange={e => update("guest_name", e.target.value)}
                  placeholder="Γιώργης Παπαδόπουλος"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Τηλέφωνο</label>
                <input
                  value={form.guest_phone}
                  onChange={e => update("guest_phone", e.target.value)}
                  placeholder="+30 6900000000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={form.guest_email}
                  onChange={e => update("guest_email", e.target.value)}
                  placeholder="email@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Χώρα</label>
                <input
                  value={form.guest_country}
                  onChange={e => update("guest_country", e.target.value)}
                  placeholder="π.χ. Ελλάδα"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Reservation Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Στοιχεία Κράτησης</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Δωμάτιο *</label>
                <select value={form.suite_name} onChange={e => update("suite_name", e.target.value)} className={inputCls}>
                  <option value="">Επιλογή δωματίου...</option>
                  {suites?.map(s => (
                    <option key={s.id} value={s.name}>{s.name} — €{s.price_per_night}/βράδυ</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Check-in *</label>
                  <input type="date" value={form.check_in} onChange={e => update("check_in", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Check-out *</label>
                  <input type="date" value={form.check_out} onChange={e => update("check_out", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ενήλικες</label>
                  <input type="number" min="1" max="20" value={form.occupants_adults} onChange={e => update("occupants_adults", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Παιδιά</label>
                  <input type="number" min="0" max="20" value={form.occupants_children} onChange={e => update("occupants_children", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Πηγή κράτησης</label>
                  <select value={form.source} onChange={e => update("source", e.target.value)} className={inputCls}>
                    <option>Direct</option>
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Expedia</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Συνολικό ποσό (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.custom_total || (suggestedTotal > 0 ? suggestedTotal : "")}
                    onChange={e => update("custom_total", e.target.value)}
                    placeholder={suggestedTotal > 0 ? String(suggestedTotal) : "0"}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Προκαταβολή (€) — προαιρετικό</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.deposit}
                  onChange={e => update("deposit", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Σημειώσεις</label>
                <textarea
                  value={form.notes}
                  onChange={e => update("notes", e.target.value)}
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {nights > 0 && totalAmount > 0 && (
            <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{nights} {nights === 1 ? "βράδυ" : "βράδια"}</span>
                <span className="font-semibold text-foreground">€{totalAmount.toLocaleString()}</span>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between text-success">
                  <span>Προκαταβολή</span>
                  <span className="font-semibold">−€{deposit.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground font-medium">Υπόλοιπο</span>
                <span className={`font-bold ${balance > 0 ? "text-destructive" : "text-success"}`}>
                  €{balance.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Ακύρωση
            </button>
            <button type="submit" disabled={createReservation.isPending}
              className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {createReservation.isPending ? "Δημιουργία..." : "Δημιουργία Κράτησης"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
