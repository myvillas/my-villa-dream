import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Plus, Eye, Phone, Mail } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import NewReservationDialog from "@/components/NewReservationDialog";
import ReservationDetailDialog from "@/components/ReservationDetailDialog";
import type { Reservation } from "@/hooks/use-reservations";

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

const sourceIcons: Record<string, string> = {
  "Booking.com": "🅱️",
  Airbnb: "🏠",
  Direct: "📞",
  Expedia: "🌐",
  Other: "📋",
};

const tabs = ["All", "Confirmed", "Pending", "Checked-in", "Checked-out", "Cancelled"];

export default function ReservationsPage() {
  const { data: reservations = [], isLoading } = useReservations();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const filtered = reservations.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab.toLowerCase();
    const matchSearch =
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.suite_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reservation_code.toLowerCase().includes(search.toLowerCase()) ||
      r.guest_email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.total_amount), 0);
  const totalBalance = reservations.reduce((sum, r) => sum + Number(r.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Reservations</p>
          <h1 className="text-2xl font-bold font-heading text-foreground">Reservations</h1>
        </div>
        <button onClick={() => setNewOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Reservation
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search for reservations..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-48" />
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading reservations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="p-4">Res ID</th>
                  <th className="p-4">Booker Name</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Invoice</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-t border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedReservation(r)}>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{r.reservation_code}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {r.booking_date ? new Date(r.booking_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{r.guest_name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {r.guest_country_flag && <span>{r.guest_country_flag}</span>}
                          {r.guest_phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" /> {r.guest_phone}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Mail className="w-2.5 h-2.5" /> {r.guest_email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground font-medium">{r.check_in}</td>
                    <td className="p-4 text-foreground font-medium">{r.check_out}</td>
                    <td className="p-4 text-right font-medium text-foreground">€{Number(r.total_amount).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className={`font-semibold ${Number(r.balance) > 0 ? "text-destructive" : "text-success"}`}>
                        €{Number(r.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[r.status] || ""}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground">{sourceIcons[r.source || ""] || ""} {r.source}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${invoiceColors[r.invoice_status || "not-invoiced"] || ""}`}>
                        {r.invoice_status === "not-invoiced" ? "Not invoiced" : r.invoice_status === "invoiced" ? "Invoiced" : "Partial"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedReservation(r); }} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-muted-foreground text-sm">No reservations found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        <div className="border-t border-border bg-muted/20 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground uppercase tracking-wider">Total Reservations</span>
              <p className="font-bold text-foreground text-lg">{totalReservations}</p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase tracking-wider">Total</span>
              <p className="font-bold text-foreground text-lg">€{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wider">Balance</span>
            <p className={`font-bold text-lg ${totalBalance > 0 ? "text-destructive" : "text-success"}`}>
              €{totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      <NewReservationDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <ReservationDetailDialog reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
    </div>
  );
}
