import { useState, useEffect } from "react";
import { X, Trash2, Users, BedDouble, CreditCard, Mail, Plus, Phone } from "lucide-react";
import { useUpdateReservation, useDeleteReservation, type Reservation } from "@/hooks/use-reservations";
import { usePayments, useCreatePayment, useDeletePayment } from "@/hooks/use-payments";
import { useSuites } from "@/hooks/use-suites";
import { toast } from "sonner";

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-info/10 text-info",
  "checked-out": "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusOptions = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];
const statusLabels: Record<string, string> = {
  pending: "Σε αναμονή",
  confirmed: "Επιβεβαιωμένη",
  "checked-in": "Check-in",
  "checked-out": "Check-out",
  cancelled: "Ακυρωμένη",
};

const detailTabs = ["Κράτηση", "Πελάτης", "Πληρωμές"];

export default function ReservationDetailDialog({ reservation, onClose }: Props) {
  const { data: suites } = useSuites();
  const { data: payments = [] } = usePayments(reservation?.id);
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const [activeTab, setActiveTab] = useState("Κράτηση");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash", reference: "", notes: "" });

  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "", guest_country: "", guest_country_flag: "",
    suite_name: "", check_in: "", check_out: "",
    source: "", notes: "", status: "",
    custom_total: "", balance: "",
    occupants_adults: "2", occupants_children: "0",
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        guest_name: reservation.guest_name,
        guest_email: reservation.guest_email,
        guest_phone: reservation.guest_phone || "",
        guest_country: reservation.guest_country || "",
        guest_country_flag: reservation.guest_country_flag || "",
        suite_name: reservation.suite_name,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        source: reservation.source || "Direct",
        notes: reservation.notes || "",
        status: reservation.status,
        custom_total: String(reservation.total_amount),
        balance: String(reservation.balance || 0),
        occupants_adults: String(reservation.occupants_adults || 2),
        occupants_children: String(reservation.occupants_children || 0),
      });
      setEditing(false);
      setConfirmDelete(false);
      setActiveTab("Κράτηση");
    }
  }, [reservation]);

  if (!reservation) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : reservation.nights;

  const totalAmount = form.custom_total ? parseFloat(form.custom_total) : Number(reservation.total_amount);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateReservation.mutateAsync({ id: reservation.id, status: newStatus });
      setForm(prev => ({ ...prev, status: newStatus }));
      toast.success(`Κατάσταση: ${statusLabels[newStatus] || newStatus}`);
    } catch (err: any) { toast.error(err.message || "Σφάλμα ενημέρωσης"); }
  };

  const handleSaveEdit = async () => {
    if (!form.guest_name || !form.guest_email || !form.suite_name || !form.check_in || !form.check_out) {
      toast.error("Συμπλήρωσε όλα τα υποχρεωτικά πεδία"); return;
    }
    const newTotal = parseFloat(form.custom_total) || Number(reservation.total_amount);
    const newBalance = parseFloat(form.balance) ?? Number(reservation.balance || 0);
    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone || null,
        guest_country: form.guest_country || null,
        guest_country_flag: form.guest_country_flag || null,
        suite_name: form.suite_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights,
        total_amount: newTotal,
        balance: newBalance,
        source: form.source,
        notes: form.notes || null,
        status: form.status,
        occupants_adults: parseInt(form.occupants_adults) || 2,
        occupants_children: parseInt(form.occupants_children) || 0,
      });
      toast.success("Η κράτηση ενημερώθηκε!");
      setEditing(false);
    } catch (err: any) { toast.error(err.message || "Σφάλμα ενημέρωσης"); }
  };

  const handleDelete = async () => {
    try {
      await deleteReservation.mutateAsync(reservation.id);
      toast.success("Η κράτηση διαγράφηκε");
      onClose();
    } catch (err: any) { toast.error(err.message || "Σφάλμα διαγραφής"); }
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) { toast.error("Εισήγαγε έγκυρο ποσό"); return; }
    try {
      await createPayment.mutateAsync({
        reservation_id: reservation.id,
        amount,
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });
      const newBalance = Math.max(0, Number(reservation.balance || 0) - amount);
      await updateReservation.mutateAsync({ id: reservation.id, balance: newBalance });
      toast.success(`Καταχωρήθηκε πληρωμή €${amount.toLocaleString()}`);
      setShowPaymentForm(false);
      setPaymentForm({ amount: "", method: "cash", reference: "", notes: "" });
    } catch (err: any) { toast.error(err.message || "Σφάλμα καταχώρησης"); }
  };

  const handleDeletePayment = async (paymentId: string, paymentAmount: number) => {
    try {
      await deletePayment.mutateAsync({ id: paymentId, reservationId: reservation.id });
      const newBalance = Number(reservation.balance || 0) + paymentAmount;
      await updateReservation.mutateAsync({ id: reservation.id, balance: newBalance });
      toast.success("Η πληρωμή αφαιρέθηκε");
    } catch (err: any) { toast.error("Σφάλμα διαγραφής πληρωμής"); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  const tabIcons: Record<string, any> = { "Κράτηση": BedDouble, "Πελάτης": Users, "Πληρωμές": CreditCard };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">{reservation.guest_name}</h2>
                <p className="text-xs text-muted-foreground">#{reservation.reservation_code} · {reservation.suite_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[form.status || reservation.status]}`}>
                {statusLabels[form.status || reservation.status] || reservation.status}
              </span>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  Επεξεργασία
                </button>
              ) : (
                <button onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Ακύρωση
                </button>
              )}
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Check-in</p>
              <p className="font-semibold text-foreground">{new Date(reservation.check_in).toLocaleDateString("el-GR")}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Check-out</p>
              <p className="font-semibold text-foreground">{new Date(reservation.check_out).toLocaleDateString("el-GR")}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Σύνολο</p>
              <p className="font-bold text-foreground text-base">€{Number(reservation.total_amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Υπόλοιπο</p>
              <p className={`font-bold text-base ${Number(reservation.balance) > 0 ? "text-destructive" : "text-success"}`}>
                €{Number(reservation.balance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card px-4 flex gap-0">
          {detailTabs.map(tab => {
            const Icon = tabIcons[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {Icon && <Icon className="w-3.5 h-3.5" />} {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ——— ΚΡΑΤΗΣΗ ——— */}
          {activeTab === "Κράτηση" && !editing && (
            <div className="space-y-4">
              {/* Booking summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/30 rounded-xl p-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Δωμάτιο</p>
                  <p className="font-semibold text-foreground">{reservation.suite_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Διάρκεια</p>
                  <p className="font-semibold text-foreground">{reservation.nights} {reservation.nights === 1 ? "βράδυ" : "βράδια"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Άτομα</p>
                  <p className="font-semibold text-foreground">
                    {reservation.occupants_adults || 2} ενήλικες
                    {(reservation.occupants_children || 0) > 0 && ` + ${reservation.occupants_children} παιδιά`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Πηγή</p>
                  <p className="font-semibold text-foreground">{reservation.source || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Check-in</p>
                  <p className="font-semibold text-foreground">{new Date(reservation.check_in).toLocaleDateString("el-GR")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Check-out</p>
                  <p className="font-semibold text-foreground">{new Date(reservation.check_out).toLocaleDateString("el-GR")}</p>
                </div>
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Συνολικό ποσό</p>
                  <p className="font-bold text-foreground text-lg">€{Number(reservation.total_amount).toLocaleString()}</p>
                </div>
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Πληρωμένο</p>
                  <p className="font-bold text-success text-lg">€{totalPaid.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${Number(reservation.balance) > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Υπόλοιπο</p>
                  <p className={`font-bold text-lg ${Number(reservation.balance) > 0 ? "text-destructive" : "text-success"}`}>
                    €{Number(reservation.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Κατάσταση Κράτησης</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(s)} disabled={updateReservation.isPending}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        (form.status || reservation.status) === s
                          ? statusColors[s] + " ring-2 ring-offset-1 ring-border"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}>
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {reservation.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Σημειώσεις</p>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{reservation.notes}</p>
                </div>
              )}

              {/* Delete */}
              <div className="flex gap-3 pt-2 border-t border-border">
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Διαγραφή Κράτησης
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleDelete} disabled={deleteReservation.isPending}
                      className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                      Επιβεβαίωση Διαγραφής
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                      Ακύρωση
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ——— ΚΡΑΤΗΣΗ (ΕΠΕΞΕΡΓΑΣΙΑ) ——— */}
          {activeTab === "Κράτηση" && editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Δωμάτιο *</label>
                  <select value={form.suite_name} onChange={e => update("suite_name", e.target.value)} className={inputCls}>
                    {suites?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Πηγή κράτησης</label>
                  <select value={form.source} onChange={e => update("source", e.target.value)} className={inputCls}>
                    <option>Direct</option>
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Expedia</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in *</label>
                  <input type="date" value={form.check_in} onChange={e => update("check_in", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out *</label>
                  <input type="date" value={form.check_out} onChange={e => update("check_out", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Ενήλικες</label>
                  <input type="number" min="1" value={form.occupants_adults} onChange={e => update("occupants_adults", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Παιδιά</label>
                  <input type="number" min="0" value={form.occupants_children} onChange={e => update("occupants_children", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Σύνολο (€) *</label>
                  <input type="number" step="0.01" value={form.custom_total} onChange={e => update("custom_total", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Υπόλοιπο (€)</label>
                  <input type="number" step="0.01" value={form.balance} onChange={e => update("balance", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Σημειώσεις</label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Ακύρωση
                </button>
                <button onClick={handleSaveEdit} disabled={updateReservation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {updateReservation.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
                </button>
              </div>
            </div>
          )}

          {/* ——— ΠΕΛΑΤΗΣ ——— */}
          {activeTab === "Πελάτης" && !editing && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-accent">
                    {reservation.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{reservation.guest_name}</p>
                    <p className="text-xs text-muted-foreground">{reservation.guest_country_flag} {reservation.guest_country || ""}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground break-all">{reservation.guest_email}</span>
                  </div>
                  {reservation.guest_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">{reservation.guest_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Πελάτης" && editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Όνομα *</label>
                  <input value={form.guest_name} onChange={e => update("guest_name", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <input type="email" value={form.guest_email} onChange={e => update("guest_email", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Τηλέφωνο</label>
                  <input value={form.guest_phone} onChange={e => update("guest_phone", e.target.value)} placeholder="+30 ..." className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Χώρα</label>
                  <input value={form.guest_country} onChange={e => update("guest_country", e.target.value)} placeholder="π.χ. Ελλάδα" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Ακύρωση
                </button>
                <button onClick={handleSaveEdit} disabled={updateReservation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {updateReservation.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
                </button>
              </div>
            </div>
          )}

          {/* ——— ΠΛΗΡΩΜΕΣ ——— */}
          {activeTab === "Πληρωμές" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ιστορικό Πληρωμών</p>
                <button
                  onClick={() => { setShowPaymentForm(true); setPaymentForm({ amount: "", method: "cash", reference: "", notes: "" }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg accent-gradient text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                  <Plus className="w-3 h-3" /> Καταχώρηση Πληρωμής
                </button>
              </div>

              {showPaymentForm && (
                <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
                  <p className="text-sm font-medium text-foreground">Νέα Πληρωμή</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Ποσό (€) *</label>
                      <input
                        type="number" step="0.01"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                        placeholder={String(Number(reservation.balance || 0))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Τρόπος πληρωμής</label>
                      <select
                        value={paymentForm.method}
                        onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent">
                        <option value="cash">Μετρητά</option>
                        <option value="card">Κάρτα</option>
                        <option value="bank_transfer">Τραπεζική μεταφορά</option>
                        <option value="online">Online (Stripe/PayPal)</option>
                        <option value="other">Άλλο</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Αναφορά / Κωδικός</label>
                      <input
                        value={paymentForm.reference}
                        onChange={e => setPaymentForm(p => ({ ...p, reference: e.target.value }))}
                        placeholder="π.χ. ID συναλλαγής..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Σημείωση</label>
                      <input
                        value={paymentForm.notes}
                        onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPaymentForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                      Ακύρωση
                    </button>
                    <button
                      disabled={createPayment.isPending || !paymentForm.amount}
                      onClick={handleAddPayment}
                      className="px-4 py-1.5 rounded-lg accent-gradient text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                      {createPayment.isPending ? "Αποθήκευση..." : "Καταχώρηση"}
                    </button>
                  </div>
                </div>
              )}

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                        <th className="p-3">Ημερομηνία</th>
                        <th className="p-3">Τρόπος</th>
                        <th className="p-3">Αναφορά</th>
                        <th className="p-3 text-right">Ποσό</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => {
                        const methodLabels: Record<string, string> = {
                          cash: "Μετρητά", card: "Κάρτα",
                          bank_transfer: "Τράπεζα", online: "Online", other: "Άλλο"
                        };
                        return (
                          <tr key={p.id} className="border-t border-border/50">
                            <td className="p-3 text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("el-GR")}</td>
                            <td className="p-3">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">
                                {methodLabels[p.method] || p.method}
                              </span>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{p.reference || p.notes || "—"}</td>
                            <td className="p-3 text-right font-semibold text-success">€{Number(p.amount).toLocaleString()}</td>
                            <td className="p-3">
                              <button onClick={() => handleDeletePayment(p.id, Number(p.amount))}
                                className="p-1 rounded hover:bg-destructive/10 transition-colors">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border font-semibold">
                        <td className="p-3 text-foreground" colSpan={3}>Σύνολο πληρωμών</td>
                        <td className="p-3 text-right text-success">€{totalPaid.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : !showPaymentForm && (
                <div className="text-center py-10">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Δεν υπάρχουν καταχωρημένες πληρωμές</p>
                  <p className="text-xs text-muted-foreground mt-1">Πάτησε «Καταχώρηση Πληρωμής» για να προσθέσεις</p>
                </div>
              )}

              {/* Balance summary */}
              <div className="grid grid-cols-3 gap-3 bg-muted/20 rounded-xl p-4 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Συνολικό ποσό</p>
                  <p className="font-bold text-foreground text-lg">€{Number(reservation.total_amount).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Πληρωμένο</p>
                  <p className="font-bold text-success text-lg">€{totalPaid.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Υπόλοιπο</p>
                  <p className={`font-bold text-lg ${Number(reservation.balance) > 0 ? "text-destructive" : "text-success"}`}>
                    €{Number(reservation.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
