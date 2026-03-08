import { X, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteGuest, useUpdateGuest, type Guest } from "@/hooks/use-guests";
import { toast } from "sonner";

interface Props {
  guest: Guest | null;
  onClose: () => void;
}

export default function GuestDetailDialog({ guest, onClose }: Props) {
  const deleteGuest = useDeleteGuest();
  const updateGuest = useUpdateGuest();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!guest) return null;

  const handleToggleVip = async () => {
    try {
      await updateGuest.mutateAsync({ id: guest.id, vip: !guest.vip });
      toast.success(guest.vip ? "VIP status removed" : "Guest marked as VIP");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGuest.mutateAsync(guest.id);
      toast.success("Guest deleted");
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">{guest.name}</h2>
            {guest.vip && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">VIP</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{guest.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{guest.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-medium text-foreground">{guest.country_flag} {guest.country}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Stays</p>
              <p className="font-medium text-foreground">{guest.total_stays}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="font-semibold text-foreground">€{Number(guest.total_spent).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Suite</p>
              <p className="font-medium text-foreground">{guest.last_suite || "—"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`w-4 h-4 ${j < (guest.rating || 0) ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <button onClick={handleToggleVip} disabled={updateGuest.isPending}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
              {guest.vip ? "Remove VIP" : "Mark as VIP"}
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} disabled={deleteGuest.isPending}
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
