import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import {
  BedDouble,
  CalendarCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
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
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 15600 },
  { month: "Mar", revenue: 18200 },
  { month: "Apr", revenue: 22800 },
  { month: "May", revenue: 28400 },
  { month: "Jun", revenue: 35200 },
  { month: "Jul", revenue: 42000 },
  { month: "Aug", revenue: 45600 },
  { month: "Sep", revenue: 38200 },
  { month: "Oct", revenue: 29800 },
  { month: "Nov", revenue: 21400 },
  { month: "Dec", revenue: 16800 },
];

const recentReservations = [
  { id: "R-1042", guest: "Maria Santos", villa: "Villa Azure", checkIn: "Mar 10", nights: 5, status: "confirmed" },
  { id: "R-1041", guest: "James Wilson", villa: "Villa Sunset", checkIn: "Mar 12", nights: 7, status: "pending" },
  { id: "R-1040", guest: "Sophie Laurent", villa: "Villa Olive", checkIn: "Mar 8", nights: 3, status: "checked-in" },
  { id: "R-1039", guest: "Hans Mueller", villa: "Villa Breeze", checkIn: "Mar 15", nights: 4, status: "confirmed" },
  { id: "R-1038", guest: "Elena Rossi", villa: "Villa Coral", checkIn: "Mar 9", nights: 6, status: "checked-in" },
];

const todayActivity = [
  { time: "08:00", event: "Check-out: Villa Azure — Maria Santos", type: "departure" },
  { time: "10:30", event: "Housekeeping: Villa Azure — Deep clean", type: "housekeeping" },
  { time: "14:00", event: "Check-in: Villa Sunset — James Wilson", type: "arrival" },
  { time: "15:30", event: "Check-in: Villa Breeze — Hans Mueller", type: "arrival" },
  { time: "18:00", event: "Maintenance: Villa Olive — Pool filter", type: "maintenance" },
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
          Welcome back! Here's what's happening at your properties today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy Rate"
          value="78%"
          change="+12%"
          icon={<BedDouble className="w-5 h-5 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="Today's Arrivals"
          value={4}
          icon={<ArrowUpRight className="w-5 h-5 text-accent-foreground" />}
          variant="accent"
        />
        <StatCard
          title="Active Reservations"
          value={23}
          change="+8%"
          icon={<CalendarCheck className="w-5 h-5 text-muted-foreground" />}
        />
        <StatCard
          title="Revenue (MTD)"
          value="€42,580"
          change="+15%"
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
                <th className="pb-3 pr-4">Villa</th>
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
                  <td className="py-3 pr-4 text-foreground">{r.villa}</td>
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
