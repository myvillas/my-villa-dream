import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import {
  BedDouble,
  CalendarCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 3200 },
  { month: "Feb", revenue: 4100 },
  { month: "Mar", revenue: 5800 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 9600 },
  { month: "Jun", revenue: 12400 },
  { month: "Jul", revenue: 14800 },
  { month: "Aug", revenue: 15600 },
  { month: "Sep", revenue: 11200 },
  { month: "Oct", revenue: 7800 },
  { month: "Nov", revenue: 4200 },
  { month: "Dec", revenue: 2800 },
];

const recentReservations = [
  { id: "R-1042", guest: "Maria Santos", suite: "Wave I", checkIn: "Mar 10", nights: 5, status: "confirmed" },
  { id: "R-1041", guest: "James Wilson", suite: "Wave II", checkIn: "Mar 12", nights: 7, status: "pending" },
  { id: "R-1040", guest: "Sophie Laurent", suite: "Wave III", checkIn: "Mar 8", nights: 4, status: "checked-in" },
  { id: "R-1039", guest: "Hans Mueller", suite: "Wave I", checkIn: "Mar 18", nights: 5, status: "confirmed" },
  { id: "R-1038", guest: "Elena Rossi", suite: "Wave II", checkIn: "Mar 22", nights: 6, status: "pending" },
];

const todayActivity = [
  { time: "08:00", event: "Check-out: Wave I — Maria Santos", type: "departure" },
  { time: "10:30", event: "Housekeeping: Wave I — Deep clean", type: "housekeeping" },
  { time: "14:00", event: "Check-in: Wave II — James Wilson", type: "arrival" },
  { time: "16:00", event: "Check-in: Wave III — Sophie Laurent", type: "arrival" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  "checked-in": "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const activityColors: Record<string, string> = {
  arrival: "bg-success",
  departure: "bg-info",
  housekeeping: "bg-warning",
  maintenance: "bg-destructive",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          3 Waves Paros — Here's what's happening at your suites today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy Rate"
          value="67%"
          change="+12%"
          icon={<BedDouble className="w-5 h-5 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="Today's Arrivals"
          value={2}
          icon={<ArrowUpRight className="w-5 h-5 text-accent-foreground" />}
          variant="accent"
        />
        <StatCard
          title="Active Reservations"
          value={5}
          change="+2"
          icon={<CalendarCheck className="w-5 h-5 text-muted-foreground" />}
        />
        <StatCard
          title="Revenue (MTD)"
          value="€5,840"
          change="+18%"
          icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue for 2026</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="w-3 h-3" /> +18.2%
            </div>
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
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`€${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(220, 60%, 20%)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Today's Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Today's Activity</h3>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {todayActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${activityColors[item.type]}`} />
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

      {/* Recent Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">Recent Reservations</h3>
          <a href="/reservations" className="text-xs font-medium text-accent hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Suite</th>
                <th className="pb-3 pr-4">Check-in</th>
                <th className="pb-3 pr-4">Nights</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentReservations.map((r) => (
                <tr key={r.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 font-mono text-muted-foreground">{r.id}</td>
                  <td className="py-3 pr-4 font-medium text-foreground">{r.guest}</td>
                  <td className="py-3 pr-4 text-foreground">{r.suite}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.checkIn}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.nights}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
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
