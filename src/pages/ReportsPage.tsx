import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";
import { useReservations } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import { TrendingUp, BedDouble, CreditCard, BarChart3 } from "lucide-react";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sourceColors: Record<string, string> = {
  "Direct": "hsl(220, 60%, 20%)",
  "Booking.com": "hsl(38, 80%, 55%)",
  "Airbnb": "hsl(152, 60%, 42%)",
  "Expedia": "hsl(210, 80%, 55%)",
  "Other": "hsl(220, 10%, 50%)",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function ReportsPage() {
  const { data: reservations = [] } = useReservations();
  const { data: suites = [] } = useSuites();

  const now = new Date();
  const totalSuites = suites.length || 1;

  // Build last 12 months of monthly stats
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const ym = d.toISOString().substring(0, 7);
    const daysInMonth = getDaysInMonth(d.getFullYear(), d.getMonth());

    const monthReservations = reservations.filter(
      r => r.check_in?.startsWith(ym) && r.status !== "cancelled"
    );

    const revenue = monthReservations.reduce((s, r) => s + Number(r.total_amount), 0);
    const totalNights = monthReservations.reduce((s, r) => s + Number(r.nights), 0);
    const adr = monthReservations.length > 0 ? Math.round(revenue / totalNights) || 0 : 0;
    const occupancyRate = Math.min(100, Math.round((totalNights / (daysInMonth * totalSuites)) * 100));

    return {
      month: monthNames[d.getMonth()],
      revenue,
      nights: totalNights,
      reservations: monthReservations.length,
      adr,
      occupancyRate,
    };
  });

  // Booking source distribution
  const sourceCounts: Record<string, number> = {};
  reservations.filter(r => r.status !== "cancelled").forEach(r => {
    const src = r.source || "Other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;
  const sourceData = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      value: count,
      pct: Math.round((count / total) * 100),
      color: sourceColors[name] || "hsl(220, 10%, 60%)",
    }));

  // Summary KPIs
  const totalRevenue = reservations
    .filter(r => r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.total_amount), 0);
  const totalBookings = reservations.filter(r => r.status !== "cancelled").length;
  const totalNightsAll = reservations
    .filter(r => r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.nights), 0);
  const overallAdr = totalNightsAll > 0 ? Math.round(totalRevenue / totalNightsAll) : 0;
  const currentMonthOccupancy = monthlyStats[11]?.occupancyRate ?? 0;

  const tooltipStyle = {
    background: "hsl(0,0%,100%)",
    border: "1px solid hsl(220,15%,90%)",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance analytics — last 12 months
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `€${totalRevenue.toLocaleString()}`, icon: CreditCard, sub: "All time (non-cancelled)" },
          { label: "Total Bookings", value: totalBookings, icon: BarChart3, sub: "Non-cancelled" },
          { label: "Avg Daily Rate", value: `€${overallAdr}`, icon: TrendingUp, sub: "Revenue / nights" },
          { label: "Current Occupancy", value: `${currentMonthOccupancy}%`, icon: BedDouble, sub: "This month" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Monthly Revenue</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 12 months</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyStats}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`€${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(220, 60%, 20%)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Booking sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Booking Sources</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution of bookings by channel</p>
          {sourceData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No booking data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, _n, props) => [`${v} bookings (${props.payload.pct}%)`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {sourceData.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground truncate">{s.name}</span>
                    <span className="font-semibold text-foreground ml-auto">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Monthly Occupancy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Monthly Occupancy Rate</h3>
          <p className="text-xs text-muted-foreground mb-4">% of available room-nights occupied</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Occupancy"]} />
              <Bar dataKey="occupancyRate" fill="hsl(38, 80%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ADR Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Average Daily Rate (ADR)</h3>
          <p className="text-xs text-muted-foreground mb-4">Revenue per occupied night</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`€${v}`, "ADR"]} />
              <Line type="monotone" dataKey="adr" stroke="hsl(152, 60%, 42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(152, 60%, 42%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
