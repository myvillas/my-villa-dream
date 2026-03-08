import { useState, useEffect } from "react";
import { X, Trash2, Users, BedDouble, Receipt, CreditCard, FileText, Clock, Mail, Plus } from "lucide-react";
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

const invoiceColors: Record<string, string> = {
  "not-invoiced": "bg-destructive/10 text-destructive",
  invoiced: "bg-success/10 text-success",
  "partially-invoiced": "bg-warning/10 text-warning",
};

const statusOptions = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];
const invoiceOptions = ["not-invoiced", "invoiced", "partially-invoiced"];
const detailTabs = ["Accommodations", "Guests", "Charges", "Payments", "Log"];

export default function ReservationDetailDialog({ reservation, onClose }: Props) {
  const { data: suites } = useSuites();
  const { data: payments = [] } = usePayments(reservation?.id);
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const [activeTab, setActiveTab] = useState("Accommodations");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash", reference: "", notes: "" });

  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "", guest_country_flag: "",
    suite_name: "", check_in: "", check_out: "", source: "", notes: "",
    status: "", custom_total: "", balance: "", invoice_status: "",
    occupants_adults: "2", occupants_children: "0",
    check_in_time: "15:00", check_out_time: "11:00", rate_name: "Standard Rate",
  });

  useEffect(() => {
    if (reservation) {
      setForm({
        guest_name: reservation.guest_name,
        guest_email: reservation.guest_email,
        guest_phone: reservation.guest_phone || "",
        guest_country_flag: reservation.guest_country_flag || "",
        suite_name: reservation.suite_name,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        source: reservation.source || "Direct",
        notes: reservation.notes || "",
        status: reservation.status,
        custom_total: String(reservation.total_amount),
        balance: String(reservation.balance || 0),
        invoice_status: reservation.invoice_status || "not-invoiced",
        occupants_adults: String(reservation.occupants_adults || 2),
        occupants_children: String(reservation.occupants_children || 0),
        check_in_time: reservation.check_in_time || "15:00",
        check_out_time: reservation.check_out_time || "11:00",
        rate_name: reservation.rate_name || "Standard Rate",
      });
      setEditing(false);
      setConfirmDelete(false);
      setActiveTab("Accommodations");
    }
  }, [reservation]);

  if (!reservation) return null;

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
    : reservation.nights;

  const totalAmount = form.custom_total ? parseFloat(form.custom_total) : Number(reservation.total_amount);
  const balance = form.balance ? parseFloat(form.balance) : Number(reservation.balance || 0);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateReservation.mutateAsync({ id: reservation.id, status: newStatus });
      setForm(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
  };

  const handleInvoiceUpdate = async (newInvoice: string) => {
    try {
      await updateReservation.mutateAsync({ id: reservation.id, invoice_status: newInvoice });
      setForm(prev => ({ ...prev, invoice_status: newInvoice }));
      toast.success("Invoice status updated");
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
  };

  const handleSaveEdit = async () => {
    if (!form.guest_name || !form.guest_email || !form.suite_name || !form.check_in || !form.check_out) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        guest_name: form.guest_name, guest_email: form.guest_email,
        guest_phone: form.guest_phone || null, guest_country_flag: form.guest_country_flag || null,
        suite_name: form.suite_name, check_in: form.check_in, check_out: form.check_out,
        nights, total_amount: totalAmount, balance: parseFloat(form.balance) || 0,
        source: form.source, notes: form.notes || null, status: form.status,
        invoice_status: form.invoice_status,
        occupants_adults: parseInt(form.occupants_adults) || 2,
        occupants_children: parseInt(form.occupants_children) || 0,
        check_in_time: form.check_in_time, check_out_time: form.check_out_time,
        rate_name: form.rate_name,
      });
      toast.success("Reservation updated!");
      setEditing(false);
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
  };

  const handleDelete = async () => {
    try {
      await deleteReservation.mutateAsync(reservation.id);
      toast.success("Reservation deleted"); onClose();
    } catch (err: any) { toast.error(err.message || "Failed to delete"); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header bar like Hotelizer */}
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">{reservation.guest_name}</h2>
                <p className="text-xs text-muted-foreground">
                  # {reservation.reservation_code} 📅 {reservation.booking_date ? new Date(reservation.booking_date).toLocaleDateString("en-GB") : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[form.status || reservation.status]}`}>
                {(form.status || reservation.status).charAt(0).toUpperCase() + (form.status || reservation.status).slice(1)}
              </span>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${invoiceColors[form.invoice_status || "not-invoiced"]}`}>
                {form.invoice_status === "not-invoiced" ? "Not invoiced" : form.invoice_status === "invoiced" ? "Invoiced" : "Partial"}
              </span>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Booking Code</p>
              <p className="font-semibold text-foreground">{reservation.reservation_code}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Source</p>
              <p className="font-medium text-foreground">{reservation.source}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Phone</p>
              <p className="font-medium text-foreground">{reservation.guest_phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Email</p>
              <p className="font-medium text-foreground truncate">{reservation.guest_email}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Total</p>
              <p className="font-bold text-foreground text-base">€{Number(reservation.total_amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Balance Due</p>
              <p className={`font-bold text-base ${Number(reservation.balance) > 0 ? "text-destructive" : "text-success"}`}>
                €{Number(reservation.balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center">
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  Edit
                </button>
              ) : (
                <button onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card px-4 flex gap-0 overflow-x-auto">
          {detailTabs.map(tab => {
            const icons: Record<string, any> = { Accommodations: BedDouble, Guests: Users, Charges: Receipt, Payments: CreditCard, Log: Clock };
            const Icon = icons[tab] || FileText;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "Accommodations" && !editing && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                      <th className="p-3">Guest</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Check-in / Out</th>
                      <th className="p-3">Occupants</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50">
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {reservation.guest_country_flag && <span>{reservation.guest_country_flag}</span>}
                          <span className="font-medium text-foreground">{reservation.guest_name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-foreground">{reservation.suite_name}</td>
                      <td className="p-3 text-muted-foreground">
                        <div>
                          {reservation.check_in} <span className="text-[10px]">⏰ {reservation.check_in_time || "15:00"}</span>
                        </div>
                        <div>
                          {reservation.check_out} <span className="text-[10px]">⏰ {reservation.check_out_time || "11:00"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          {reservation.occupants_adults || 2}
                          {(reservation.occupants_children || 0) > 0 && (
                            <span>+{reservation.occupants_children} child</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{reservation.rate_name || "Standard Rate"}</td>
                      <td className="p-3 text-right font-bold text-foreground">€{Number(reservation.total_amount).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[reservation.status]}`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center bg-muted/30 rounded-lg p-3 text-xs">
                <div className="flex gap-6">
                  <div><span className="text-muted-foreground uppercase">Nights</span><p className="font-bold text-foreground">{reservation.nights}</p></div>
                  <div><span className="text-muted-foreground uppercase">Occupants</span><p className="font-bold text-foreground">{reservation.occupants_adults || 2}{(reservation.occupants_children || 0) > 0 ? `+${reservation.occupants_children}` : ""}</p></div>
                </div>
                <div><span className="text-muted-foreground uppercase">Price</span><p className="font-bold text-foreground text-base">€{Number(reservation.total_amount).toLocaleString()}</p></div>
              </div>

              {/* Status + Invoice controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map(s => (
                      <button key={s} onClick={() => handleStatusUpdate(s)} disabled={updateReservation.isPending}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${
                          (form.status || reservation.status) === s ? statusColors[s] + " ring-2 ring-offset-1 ring-border" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Invoice Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {invoiceOptions.map(s => (
                      <button key={s} onClick={() => handleInvoiceUpdate(s)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${
                          (form.invoice_status || "not-invoiced") === s ? invoiceColors[s] + " ring-2 ring-offset-1 ring-border" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}>
                        {s === "not-invoiced" ? "Not invoiced" : s === "invoiced" ? "Invoiced" : "Partial"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground bg-muted/50 rounded-lg p-2">{reservation.notes}</p>
                </div>
              )}

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
                      className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Accommodations" && editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guest Name *</label>
                  <input value={form.guest_name} onChange={e => update("guest_name", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Guest Email *</label>
                  <input type="email" value={form.guest_email} onChange={e => update("guest_email", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <input value={form.guest_phone} onChange={e => update("guest_phone", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Country Flag</label>
                  <input value={form.guest_country_flag} onChange={e => update("guest_country_flag", e.target.value)} placeholder="🇬🇷" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Suite *</label>
                  <select value={form.suite_name} onChange={e => update("suite_name", e.target.value)} className={inputCls}>
                    {suites?.map(s => <option key={s.id} value={s.name}>{s.name} — €{s.price_per_night}/night</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Rate Name</label>
                  <input value={form.rate_name} onChange={e => update("rate_name", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in *</label>
                  <input type="date" value={form.check_in} onChange={e => update("check_in", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                  <input type="time" value={form.check_in_time} onChange={e => update("check_in_time", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out *</label>
                  <input type="date" value={form.check_out} onChange={e => update("check_out", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                  <input type="time" value={form.check_out_time} onChange={e => update("check_out_time", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Adults</label>
                  <input type="number" min="1" value={form.occupants_adults} onChange={e => update("occupants_adults", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Children</label>
                  <input type="number" min="0" value={form.occupants_children} onChange={e => update("occupants_children", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Total (€) *</label>
                  <input type="number" step="0.01" value={form.custom_total} onChange={e => update("custom_total", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Balance (€)</label>
                  <input type="number" step="0.01" value={form.balance} onChange={e => update("balance", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
                  <select value={form.source} onChange={e => update("source", e.target.value)} className={inputCls}>
                    <option>Direct</option><option>Booking.com</option><option>Airbnb</option><option>Expedia</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Invoice Status</label>
                  <select value={form.invoice_status} onChange={e => update("invoice_status", e.target.value)} className={inputCls}>
                    <option value="not-invoiced">Not Invoiced</option><option value="invoiced">Invoiced</option><option value="partially-invoiced">Partially Invoiced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={updateReservation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {updateReservation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Guests" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                      <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50">
                      <td className="p-3 font-medium text-foreground">{reservation.guest_name}</td>
                      <td className="p-3 text-muted-foreground">{reservation.guest_email}</td>
                      <td className="p-3 text-muted-foreground">{reservation.guest_phone || "—"}</td>
                      <td className="p-3 text-muted-foreground">{reservation.guest_country_flag} {reservation.guest_country || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Charges" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                      <th className="p-3">Description</th><th className="p-3">Qty</th><th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50">
                      <td className="p-3 text-foreground">Accommodation — {reservation.suite_name} ({reservation.rate_name || "Standard Rate"})</td>
                      <td className="p-3 text-muted-foreground">{reservation.nights} night{reservation.nights > 1 ? "s" : ""}</td>
                      <td className="p-3 text-right font-semibold text-foreground">€{Number(reservation.total_amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-semibold">
                      <td className="p-3 text-foreground" colSpan={2}>Total</td>
                      <td className="p-3 text-right text-foreground">€{Number(reservation.total_amount).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment History</p>
                <button onClick={() => { setShowPaymentForm(true); setPaymentForm({ amount: "", method: "cash", reference: "", notes: "" }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg accent-gradient text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                  <Plus className="w-3 h-3" /> Add Payment
                </button>
              </div>

              {showPaymentForm && (
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (€) *</label>
                      <input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                        placeholder={String(Number(reservation.balance || 0))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Method</label>
                      <select value={paymentForm.method} onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent">
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="online">Online (Stripe/PayPal)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference</label>
                      <input value={paymentForm.reference} onChange={e => setPaymentForm(p => ({ ...p, reference: e.target.value }))}
                        placeholder="Transaction ID..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                      <input value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPaymentForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button disabled={createPayment.isPending || !paymentForm.amount}
                      onClick={async () => {
                        const amount = parseFloat(paymentForm.amount);
                        if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
                        try {
                          await createPayment.mutateAsync({
                            reservation_id: reservation.id,
                            amount,
                            method: paymentForm.method,
                            reference: paymentForm.reference || undefined,
                            notes: paymentForm.notes || undefined,
                          });
                          // Update balance on reservation
                          const newBalance = Math.max(0, Number(reservation.balance || 0) - amount);
                          await updateReservation.mutateAsync({ id: reservation.id, balance: newBalance });
                          toast.success(`Payment of €${amount.toLocaleString()} recorded`);
                          setShowPaymentForm(false);
                        } catch (err: any) { toast.error(err.message || "Failed to record payment"); }
                      }}
                      className="px-3 py-1.5 rounded-lg accent-gradient text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                      {createPayment.isPending ? "Saving..." : "Record Payment"}
                    </button>
                  </div>
                </div>
              )}

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                        <th className="p-3">Date</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Reference</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-t border-border/50">
                          <td className="p-3 text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("en-GB")}</td>
                          <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground capitalize">{p.method.replace("_", " ")}</span></td>
                          <td className="p-3 text-muted-foreground text-xs">{p.reference || "—"}</td>
                          <td className="p-3 text-right font-semibold text-success">€{Number(p.amount).toLocaleString()}</td>
                          <td className="p-3">
                            <button onClick={async () => {
                              try {
                                await deletePayment.mutateAsync({ id: p.id, reservationId: reservation.id });
                                const newBalance = Number(reservation.balance || 0) + Number(p.amount);
                                await updateReservation.mutateAsync({ id: reservation.id, balance: newBalance });
                                toast.success("Payment removed");
                              } catch (err: any) { toast.error("Failed to delete payment"); }
                            }} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border font-semibold">
                        <td className="p-3 text-foreground" colSpan={3}>Total Paid</td>
                        <td className="p-3 text-right text-success">€{payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : !showPaymentForm && (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No payments recorded yet</p>
                </div>
              )}

              {/* Balance summary */}
              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider">Total Charged</span>
                  <p className="font-bold text-foreground text-base">€{Number(reservation.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider">Paid</span>
                  <p className="font-bold text-success text-base">€{payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider">Balance Due</span>
                  <p className={`font-bold text-base ${Number(reservation.balance) > 0 ? "text-destructive" : "text-success"}`}>
                    €{Number(reservation.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Log" && (
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                <div>
                  <p className="text-sm text-foreground">Reservation created</p>
                  <p className="text-xs text-muted-foreground">{reservation.booking_date ? new Date(reservation.booking_date).toLocaleString("en-GB") : new Date(reservation.created_at).toLocaleString("en-GB")}</p>
                </div>
              </div>
              {reservation.updated_at !== reservation.created_at && (
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-info mt-1.5" />
                  <div>
                    <p className="text-sm text-foreground">Last modified</p>
                    <p className="text-xs text-muted-foreground">{new Date(reservation.updated_at).toLocaleString("en-GB")}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
