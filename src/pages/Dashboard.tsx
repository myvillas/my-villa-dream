import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { BedDouble, CalendarCheck, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useReservations } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const statusColors: Record<string, string> = {
  confirmed: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  "checked-out": "bg-muted text-muted-foreground",
};

const activityColors: Record<string, string> = {
  arrival: "bg-success",
  departure: "bg-info",
  housekeeping: "bg-warning",
};

export default function Dashboard() {
  const { data: reservations = [] } = useReservations();
  const { data: suites = [] } = useSuites();

  const todayStr = new Date().toISOString().split("T")[0];
  const currentYearMonth = new Date().toISOString().substring(0, 7);

  const activeReservations = reservations.filter(r => r.status !== "cancelled" && r.status !== "checked-out");
  const occupiedSuites = suites.filter(s => s.status === "occupied").length;
  const occupancyRate = suites.length ? Math.round((occupiedSuites / suites.length) * 100) : 0;
  const revenueMTD = reservations
    .filter(r => r.check_in?.startsWith(currentYearMonth) && r.status !== "cancelled")
    .reduce((sum, r) => sum + Number(r.total_amount), 0);

  const todayArrivals = reservations.filter(r => r.check_in === todayStr && r.status !== "cancelled").length;
  const todayDepartures = reservations.filter(r => r.check_out === todayStr && r.status !== "cancelled").length;

  // Build revenue chart from actual data (last 12 months)
  const now = new Date();
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const ym = d.toISOString().substring(0, 7);
    const revenue = reservations
      .filter(r => r.check_in?.startsWith(ym) && r.status !== "cancelled")
      .reduce((sum, r) => sum + Number(r.total_amount), 0);
    return { month: monthNames[d.getMonth()], revenue };
  });

  const todayActivity = [
    ...reservations.filter(r => r.check_out === todayStr && r.status !== "cancelled")
      .map(r => ({ time: r.check_out_time || "11:00", event: `Check-out: ${r.suite_name} — ${r.guest_name}`, type: "departure" })),
    ...reservations.filter(r => r.check_in === todayStr && r.status !== "cancelled")
      .map(r => ({ time: r.check_in_time || "15:00", event: `Check-in: ${r.suite_name} — ${r.guest_name}`, type: "arrival" })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const recentReservations = reservations.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">3 Waves Paros — {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={<BedDouble className="w-5 h-5 text-primary-foreground" />} variant="primary" />
        <StatCard title="Today's Arrivals" value={todayArrivals} icon={<ArrowUpRight className="w-5 h-5 text-accent-foreground" />} variant="accent" />
        <StatCard title="Today's Departures" value={todayDepartures} icon={<ArrowDownRight className="w-5 h-5 text-muted-foreground" />} />
        <StatCard title="Revenue (MTD)" value={`€${revenueMTD.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue for 2026</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-success"><TrendingUp className="w-3 h-3" /> +18.2%</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 15%, 90%)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`€${value.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(220, 60%, 20%)" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Today's Activity</h3>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {todayActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity today</p>}
            {todayActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${activityColors[item.type] || "bg-muted"}`} />
                  {i < todayActivity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-xs font-medium text-muted-foreground">{item.time}</p>
                  <p className="text-sm text-foreground mt-0.5">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">Recent Reservations</h3>
          <a href="/reservations" className="text-xs font-medium text-accent hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">ID</th><th className="pb-3 pr-4">Guest</th><th className="pb-3 pr-4">Suite</th>
                <th className="pb-3 pr-4">Check-in</th><th className="pb-3 pr-4">Nights</th><th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentReservations.map((r) => (
                <tr key={r.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 font-mono text-muted-foreground">{r.reservation_code}</td>
                  <td className="py-3 pr-4 font-medium text-foreground">{r.guest_name}</td>
                  <td className="py-3 pr-4 text-foreground">{r.suite_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.check_in}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.nights}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status] || ""}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
