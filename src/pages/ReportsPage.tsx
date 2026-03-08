import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const occupancyData = [
  { month: "Jan", rate: 45 }, { month: "Feb", rate: 52 }, { month: "Mar", rate: 78 },
  { month: "Apr", rate: 82 }, { month: "May", rate: 88 }, { month: "Jun", rate: 95 },
  { month: "Jul", rate: 98 }, { month: "Aug", rate: 97 }, { month: "Sep", rate: 85 },
  { month: "Oct", rate: 70 }, { month: "Nov", rate: 55 }, { month: "Dec", rate: 48 },
];

const sourceData = [
  { name: "Direct", value: 35, color: "hsl(220, 60%, 20%)" },
  { name: "Booking.com", value: 28, color: "hsl(38, 80%, 55%)" },
  { name: "Airbnb", value: 20, color: "hsl(152, 60%, 42%)" },
  { name: "Expedia", value: 10, color: "hsl(210, 80%, 55%)" },
  { name: "Other", value: 7, color: "hsl(220, 10%, 50%)" },
];

const adrData = [
  { month: "Jan", adr: 420 }, { month: "Feb", adr: 450 }, { month: "Mar", adr: 520 },
  { month: "Apr", adr: 580 }, { month: "May", adr: 620 }, { month: "Jun", adr: 750 },
  { month: "Jul", adr: 850 }, { month: "Aug", adr: 880 }, { month: "Sep", adr: 680 },
  { month: "Oct", adr: 550 }, { month: "Nov", adr: 460 }, { month: "Dec", adr: 430 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance analytics for 2026</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Monthly Occupancy Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,90%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="rate" fill="hsl(220, 60%, 20%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Booking Sources</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,90%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-semibold text-foreground ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ADR Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold text-foreground mb-4">Average Daily Rate (ADR)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={adrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,90%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`€${v}`, "ADR"]} />
              <Line type="monotone" dataKey="adr" stroke="hsl(38, 80%, 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(38, 80%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
