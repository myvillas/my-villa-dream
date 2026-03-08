import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, Plus, Eye, MoreHorizontal } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import NewReservationDialog from "@/components/NewReservationDialog";
import ReservationDetailDialog from "@/components/ReservationDetailDialog";
import type { Reservation } from "@/hooks/use-reservations";

const statusColors: Record<string, string> = {
  confirmed: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-success/10 text-success",
  "checked-out": "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const tabs = ["All", "Confirmed", "Pending", "Checked-in", "Checked-out"];

export default function ReservationsPage() {
  const { data: reservations = [], isLoading } = useReservations();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const filtered = reservations.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab.toLowerCase();
    const matchSearch = r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.suite_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reservation_code.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">{reservations.length} total reservations</p>
        </div>
        <button onClick={() => setNewOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-40" />
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
                  <th className="p-4">Reservation</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Suite</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Check-out</th>
                  <th className="p-4">Nights</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{r.reservation_code}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{r.guest_name}</p>
                        <p className="text-xs text-muted-foreground">{r.guest_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{r.suite_name}</td>
                    <td className="p-4 text-muted-foreground">{r.check_in}</td>
                    <td className="p-4 text-muted-foreground">{r.check_out}</td>
                    <td className="p-4 text-muted-foreground text-center">{r.nights}</td>
                    <td className="p-4 font-semibold text-foreground">€{Number(r.total_amount).toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground text-xs">{r.source}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedReservation(r)} className="p-1.5 rounded hover:bg-muted transition-colors">
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
      </motion.div>

      <NewReservationDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <ReservationDetailDialog reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
    </div>
  );
}
