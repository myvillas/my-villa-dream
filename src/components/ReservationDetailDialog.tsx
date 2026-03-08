import { X, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useUpdateReservation, useDeleteReservation, type Reservation } from "@/hooks/use-reservations";
import { toast } from "sonner";

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
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(reservation?.status || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!reservation) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateReservation.mutateAsync({ id: reservation.id, status: newStatus });
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
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
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">{reservation.reservation_code}</h2>
            <p className="text-xs text-muted-foreground">{reservation.suite_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Guest</p>
              <p className="font-medium text-foreground">{reservation.guest_name}</p>
              <p className="text-xs text-muted-foreground">{reservation.guest_email}</p>
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

          {/* Status changer */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updateReservation.isPending}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    (status || reservation.status) === s
                      ? statusColors[s] + " ring-2 ring-offset-1 ring-border"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
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
        </div>
      </div>
    </div>
  );
}
