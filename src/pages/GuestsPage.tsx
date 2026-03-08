import { motion } from "framer-motion";
import { Search, Mail, Star, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useGuests, type Guest } from "@/hooks/use-guests";
import GuestDetailDialog from "@/components/GuestDetailDialog";

export default function GuestsPage() {
  const { data: guests = [], isLoading } = useGuests();
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Guests</h1>
          <p className="text-sm text-muted-foreground mt-1">{guests.length} registered guests</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-full" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading guests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                  <th className="p-4">Guest</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Last Suite</th>
                  <th className="p-4">Stays</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Last Visit</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((g, i) => (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{g.name}</span>
                        {g.vip && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">VIP</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{g.country_flag} {g.country}</td>
                    <td className="p-4 text-foreground">{g.last_suite}</td>
                    <td className="p-4 text-foreground font-medium">{g.total_stays}</td>
                    <td className="p-4 font-semibold text-foreground">€{Number(g.total_spent).toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground">{g.last_visit}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < (g.rating || 0) ? "fill-accent text-accent" : "text-muted"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedGuest(g)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">No guests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <GuestDetailDialog guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
    </div>
  );
}
