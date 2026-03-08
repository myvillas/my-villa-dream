import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateReservation, useDeleteReservation, type Reservation } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-success/10 text-success",
  "checked-out": "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusOptions = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];

export default function ReservationDetailDialog({ reservation, onClose }: Props) {
  const { data: suites } = useSuites();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    suite_name: "",
    check_in: "",
    check_out: "",
    source: "",
    notes: "",
    status: "",
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        guest_name: reservation.guest_name,
        guest_email: reservation.guest_email,
        suite_name: reservation.suite_name,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        source: reservation.source || "Direct",
        notes: reservation.notes || "",
        status: reservation.status,
      });
      setEditing(false);
      setConfirmDelete(false);
    }
  }, [reservation]);

  if (!reservation) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : reservation.nights;

  const selectedSuite = suites?.find(s => s.name === form.suite_name);
  const totalAmount = selectedSuite ? nights * selectedSuite.price_per_night : Number(reservation.total_amount);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateReservation.mutateAsync({ id: reservation.id, status: newStatus });
      setForm(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleSaveEdit = async () => {
    if (!form.guest_name || !form.guest_email || !form.suite_name || !form.check_in || !form.check_out) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        suite_name: form.suite_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights,
        total_amount: totalAmount,
        source: form.source,
        notes: form.notes || null,
        status: form.status,
      });
      toast.success("Reservation updated!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReservation.mutateAsync(reservation.id);
      toast.success("Reservation deleted");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">{reservation.reservation_code}</h2>
            <p className="text-xs text-muted-foreground">{editing ? "Editing reservation" : reservation.suite_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {editing ? (
            /* Edit Mode */
            <>
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
                  <option>Direct</option><option>Booking.com</option><option>Airbnb</option><option>Expedia</option><option>Other</option>
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
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={updateReservation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {updateReservation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Guest</p>
                  <p className="font-medium text-foreground">{form.guest_name || reservation.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{form.guest_email || reservation.guest_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground text-lg">€{Number(reservation.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-medium text-foreground">{reservation.check_in}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-medium text-foreground">{reservation.check_out}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nights</p>
                  <p className="font-medium text-foreground">{reservation.nights}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium text-foreground">{reservation.source}</p>
                </div>
              </div>

              {reservation.notes && (
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground bg-muted/50 rounded-lg p-2">{reservation.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(s)} disabled={updateReservation.isPending}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        (form.status || reservation.status) === s
                          ? statusColors[s] + " ring-2 ring-offset-1 ring-border"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleDelete} disabled={deleteReservation.isPending}
                      className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
