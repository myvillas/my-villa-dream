import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateReservation } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewReservationDialog({ open, onClose }: Props) {
  const { data: suites } = useSuites();
  const createReservation = useCreateReservation();

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    suite_name: "",
    check_in: "",
    check_out: "",
    source: "Direct",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ guest_name: "", guest_email: "", suite_name: "", check_in: "", check_out: "", source: "Direct", notes: "" });
    }
  }, [open]);

  if (!open) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const selectedSuite = suites?.find(s => s.name === form.suite_name);
  const totalAmount = selectedSuite ? nights * selectedSuite.price_per_night : 0;

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

    try {
      await createReservation.mutateAsync({
        reservation_code: generateCode(),
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        suite_name: form.suite_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights,
        total_amount: totalAmount,
        source: form.source,
        notes: form.notes || null,
        status: "pending",
      });
      toast.success("Reservation created successfully!");
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Guest Name *</label>
              <input value={form.guest_name} onChange={e => update("guest_name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Guest Email *</label>
              <input type="email" value={form.guest_email} onChange={e => update("guest_email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
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
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
            <select value={form.source} onChange={e => update("source", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent">
              <option>Direct</option>
              <option>Booking.com</option>
              <option>Airbnb</option>
              <option>Expedia</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>

          {nights > 0 && selectedSuite && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{nights} night{nights > 1 ? "s" : ""} × €{selectedSuite.price_per_night}</span>
              <span className="font-semibold text-foreground">€{totalAmount.toLocaleString()}</span>
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
