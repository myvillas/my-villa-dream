import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle, Clock, Wrench, BedDouble, Calendar, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useSuites, useUpdateSuite } from "@/hooks/use-suites";
import { useReservations } from "@/hooks/use-reservations";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: any; cardClass: string; badgeClass: string }> = {
  available: {
    label: "Clean / Ready",
    icon: CheckCircle,
    cardClass: "border-success/40 bg-success/5",
    badgeClass: "bg-success/10 text-success",
  },
  cleaning: {
    label: "Needs Cleaning",
    icon: Clock,
    badgeClass: "bg-warning/10 text-warning",
    cardClass: "border-warning/40 bg-warning/5",
  },
  occupied: {
    label: "Occupied",
    icon: BedDouble,
    cardClass: "border-info/40 bg-info/5",
    badgeClass: "bg-info/10 text-info",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    cardClass: "border-destructive/40 bg-destructive/5",
    badgeClass: "bg-destructive/10 text-destructive",
  },
};

const hkActions: Record<string, { label: string; next: string; class: string }[]> = {
  cleaning: [
    { label: "Mark Clean", next: "available", class: "bg-success/10 text-success hover:bg-success/20" },
    { label: "Maintenance", next: "maintenance", class: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  ],
  available: [
    { label: "Mark Dirty", next: "cleaning", class: "bg-warning/10 text-warning hover:bg-warning/20" },
    { label: "Maintenance", next: "maintenance", class: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  ],
  occupied: [
    { label: "Maintenance", next: "maintenance", class: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  ],
  maintenance: [
    { label: "Mark Clean", next: "available", class: "bg-success/10 text-success hover:bg-success/20" },
    { label: "Mark Dirty", next: "cleaning", class: "bg-warning/10 text-warning hover:bg-warning/20" },
  ],
};

export default function HousekeepingPage() {
  const { data: suites = [], isLoading } = useSuites();
  const { data: reservations = [] } = useReservations();
  const updateSuite = useUpdateSuite();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const todayDepartures = reservations.filter(
    r => r.check_out === todayStr && r.status !== "cancelled"
  );
  const todayArrivals = reservations.filter(
    r => r.check_in === todayStr && r.status !== "cancelled"
  );

  const stats = {
    available: suites.filter(s => s.status === "available").length,
    cleaning: suites.filter(s => s.status === "cleaning").length,
    occupied: suites.filter(s => s.status === "occupied").length,
    maintenance: suites.filter(s => s.status === "maintenance").length,
  };

  const handleStatusChange = async (suiteId: string, newStatus: string, label: string) => {
    setUpdatingId(suiteId);
    try {
      await updateSuite.mutateAsync({ id: suiteId, status: newStatus });
      toast.success(`Room marked as ${label}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Housekeeping</p>
          <h1 className="text-2xl font-bold font-heading text-foreground">Housekeeping Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, count]) => {
          const cfg = statusConfig[key];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-xl p-4 border ${cfg.cardClass}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.badgeClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Today's tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departures today - rooms to clean */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="w-4 h-4 text-warning" />
            <h3 className="font-heading font-semibold text-foreground">Today's Departures</h3>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
              {todayDepartures.length}
            </span>
          </div>
          {todayDepartures.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No departures today</p>
          ) : (
            <div className="space-y-2">
              {todayDepartures.map(r => {
                const suite = suites.find(s => s.name === r.suite_name);
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.suite_name}</p>
                      <p className="text-xs text-muted-foreground">{r.guest_name} · out {r.check_out_time || "11:00"}</p>
                    </div>
                    {suite && (
                      <button
                        disabled={updatingId === suite.id}
                        onClick={() => handleStatusChange(suite.id, "cleaning", "Needs Cleaning")}
                        className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                      >
                        Mark Dirty
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Arrivals today - rooms to prepare */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-4 h-4 text-success" />
            <h3 className="font-heading font-semibold text-foreground">Today's Arrivals</h3>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
              {todayArrivals.length}
            </span>
          </div>
          {todayArrivals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No arrivals today</p>
          ) : (
            <div className="space-y-2">
              {todayArrivals.map(r => {
                const suite = suites.find(s => s.name === r.suite_name);
                const isReady = suite?.status === "available";
                return (
                  <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isReady ? "border-success/30 bg-success/5" : "border-border bg-muted/20"}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.suite_name}</p>
                      <p className="text-xs text-muted-foreground">{r.guest_name} · in {r.check_in_time || "15:00"}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${isReady ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {isReady ? "Ready ✓" : "Not Ready"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* All suites board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">All Suites</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suites.map((suite, i) => {
            const cfg = statusConfig[suite.status] || statusConfig.available;
            const Icon = cfg.icon;
            const actions = hkActions[suite.status] || [];
            const todayCheckIn = todayArrivals.find(r => r.suite_name === suite.name);
            const todayCheckOut = todayDepartures.find(r => r.suite_name === suite.name);

            return (
              <motion.div
                key={suite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-xl p-4 border ${cfg.cardClass}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{suite.emoji}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{suite.name}</p>
                      <p className="text-[10px] text-muted-foreground">{suite.location}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${cfg.badgeClass}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Today events */}
                {(todayCheckOut || todayCheckIn) && (
                  <div className="mb-3 space-y-1">
                    {todayCheckOut && (
                      <div className="flex items-center gap-1.5 text-[10px] text-warning bg-warning/10 rounded px-2 py-1">
                        <ArrowDownRight className="w-3 h-3" /> Out: {todayCheckOut.guest_name} @ {todayCheckOut.check_out_time || "11:00"}
                      </div>
                    )}
                    {todayCheckIn && (
                      <div className="flex items-center gap-1.5 text-[10px] text-success bg-success/10 rounded px-2 py-1">
                        <ArrowUpRight className="w-3 h-3" /> In: {todayCheckIn.guest_name} @ {todayCheckIn.check_in_time || "15:00"}
                      </div>
                    )}
                  </div>
                )}

                {suite.current_guest && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Guest: <span className="text-foreground font-medium">{suite.current_guest}</span>
                  </p>
                )}

                {/* Action buttons */}
                {actions.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {actions.map(action => (
                      <button
                        key={action.next}
                        disabled={updatingId === suite.id}
                        onClick={() => handleStatusChange(suite.id, action.next, action.label)}
                        className={`text-[10px] px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50 ${action.class}`}
                      >
                        {updatingId === suite.id ? "..." : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
