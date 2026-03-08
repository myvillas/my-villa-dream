import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, Plus, Eye, MoreHorizontal } from "lucide-react";

type Reservation = {
  id: string;
  guest: string;
  email: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: string;
  status: "confirmed" | "pending" | "checked-in" | "checked-out" | "cancelled";
  source: string;
};

const reservations: Reservation[] = [
  { id: "R-1042", guest: "Maria Santos", email: "maria@email.com", villa: "Villa Azure", checkIn: "2026-03-10", checkOut: "2026-03-15", nights: 5, total: "€3,750", status: "confirmed", source: "Booking.com" },
  { id: "R-1041", guest: "James Wilson", email: "james@email.com", villa: "Villa Sunset", checkIn: "2026-03-12", checkOut: "2026-03-19", nights: 7, total: "€5,600", status: "pending", source: "Direct" },
  { id: "R-1040", guest: "Sophie Laurent", email: "sophie@email.com", villa: "Villa Olive", checkIn: "2026-03-08", checkOut: "2026-03-11", nights: 3, total: "€2,100", status: "checked-in", source: "Airbnb" },
  { id: "R-1039", guest: "Hans Mueller", email: "hans@email.com", villa: "Villa Breeze", checkIn: "2026-03-15", checkOut: "2026-03-19", nights: 4, total: "€2,800", status: "confirmed", source: "Expedia" },
  { id: "R-1038", guest: "Elena Rossi", email: "elena@email.com", villa: "Villa Coral", checkIn: "2026-03-09", checkOut: "2026-03-15", nights: 6, total: "€4,200", status: "checked-in", source: "Direct" },
  { id: "R-1037", guest: "Akira Tanaka", email: "akira@email.com", villa: "Villa Flora", checkIn: "2026-03-05", checkOut: "2026-03-08", nights: 3, total: "€1,950", status: "checked-out", source: "Booking.com" },
  { id: "R-1036", guest: "Claire Duval", email: "claire@email.com", villa: "Villa Marina", checkIn: "2026-03-04", checkOut: "2026-03-11", nights: 7, total: "€4,900", status: "checked-in", source: "Direct" },
  { id: "R-1035", guest: "Nikolai Petrov", email: "nikolai@email.com", villa: "Villa Stella", checkIn: "2026-03-06", checkOut: "2026-03-10", nights: 4, total: "€3,200", status: "confirmed", source: "Airbnb" },
  { id: "R-1034", guest: "Liam O'Brien", email: "liam@email.com", villa: "Villa Horizon", checkIn: "2026-03-20", checkOut: "2026-03-27", nights: 7, total: "€5,250", status: "pending", source: "VRBO" },
  { id: "R-1033", guest: "Ana Costa", email: "ana@email.com", villa: "Villa Luna", checkIn: "2026-03-01", checkOut: "2026-03-05", nights: 4, total: "€2,400", status: "checked-out", source: "Direct" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-success/10 text-success",
  "checked-out": "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const tabs = ["All", "Confirmed", "Pending", "Checked-in", "Checked-out"];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = reservations.filter((r) => {
    const matchTab = activeTab === "All" || r.status === activeTab.toLowerCase();
    const matchSearch = r.guest.toLowerCase().includes(search.toLowerCase()) ||
      r.villa.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">{reservations.length} total reservations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-40"
            />
          </div>
          <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="p-4">Reservation</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Villa</th>
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
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-muted-foreground">{r.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{r.guest}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{r.villa}</td>
                  <td className="p-4 text-muted-foreground">{r.checkIn}</td>
                  <td className="p-4 text-muted-foreground">{r.checkOut}</td>
                  <td className="p-4 text-muted-foreground text-center">{r.nights}</td>
                  <td className="p-4 font-semibold text-foreground">{r.total}</td>
                  <td className="p-4 text-muted-foreground text-xs">{r.source}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
