import { motion } from "framer-motion";
import { Search, Mail, Star, MoreHorizontal } from "lucide-react";
import { useState } from "react";

type Guest = {
  name: string;
  email: string;
  phone: string;
  country: string;
  totalStays: number;
  totalSpent: string;
  lastVisit: string;
  lastSuite: string;
  rating: number;
  vip: boolean;
};

const guests: Guest[] = [
  { name: "Maria Santos", email: "maria@email.com", phone: "+351 912 345 678", country: "🇵🇹 Portugal", totalStays: 3, totalSpent: "€2,700", lastVisit: "Mar 2026", lastSuite: "Wave I", rating: 5, vip: true },
  { name: "James Wilson", email: "james@email.com", phone: "+44 7911 123456", country: "🇬🇧 UK", totalStays: 1, totalSpent: "€1,540", lastVisit: "Mar 2026", lastSuite: "Wave II", rating: 4, vip: false },
  { name: "Sophie Laurent", email: "sophie@email.com", phone: "+33 6 12 34 56 78", country: "🇫🇷 France", totalStays: 2, totalSpent: "€2,080", lastVisit: "Mar 2026", lastSuite: "Wave III", rating: 5, vip: true },
  { name: "Hans Mueller", email: "hans@email.com", phone: "+49 151 12345678", country: "🇩🇪 Germany", totalStays: 1, totalSpent: "€900", lastVisit: "Mar 2026", lastSuite: "Wave I", rating: 4, vip: false },
  { name: "Elena Rossi", email: "elena@email.com", phone: "+39 333 1234567", country: "🇮🇹 Italy", totalStays: 2, totalSpent: "€2,640", lastVisit: "Mar 2026", lastSuite: "Wave II", rating: 5, vip: true },
  { name: "Akira Tanaka", email: "akira@email.com", phone: "+81 90 1234 5678", country: "🇯🇵 Japan", totalStays: 1, totalSpent: "€1,560", lastVisit: "Mar 2026", lastSuite: "Wave III", rating: 4, vip: false },
  { name: "Claire Duval", email: "claire@email.com", phone: "+33 7 12 34 56 78", country: "🇫🇷 France", totalStays: 3, totalSpent: "€3,420", lastVisit: "Mar 2026", lastSuite: "Wave I", rating: 5, vip: true },
  { name: "Nikolai Petrov", email: "nikolai@email.com", phone: "+7 916 123 4567", country: "🇷🇺 Russia", totalStays: 1, totalSpent: "€880", lastVisit: "Mar 2026", lastSuite: "Wave II", rating: 4, vip: false },
];

export default function GuestsPage() {
  const [search, setSearch] = useState("");
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
        <input
          type="text"
          placeholder="Search guests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-full"
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
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
                <motion.tr
                  key={g.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                >
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
                  <td className="p-4 text-muted-foreground">{g.country}</td>
                  <td className="p-4 text-foreground">{g.lastSuite}</td>
                  <td className="p-4 text-foreground font-medium">{g.totalStays}</td>
                  <td className="p-4 font-semibold text-foreground">{g.totalSpent}</td>
                  <td className="p-4 text-muted-foreground">{g.lastVisit}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < g.rating ? "fill-accent text-accent" : "text-muted"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="p-1.5 rounded hover:bg-muted transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
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
