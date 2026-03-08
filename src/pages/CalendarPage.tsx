import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";

const sourceColors: Record<string, string> = {
  "Booking.com": "bg-info/70",
  "Direct": "bg-success/70",
  "Airbnb": "bg-accent/70",
  "Expedia": "bg-primary/70",
  "Other": "bg-muted-foreground/50",
};

const daysInMonth = 31;
const monthName = "March 2026";

export default function CalendarPage() {
  const { data: reservations = [] } = useReservations();
  const { data: suites = [] } = useSuites();
  const [startDay, setStartDay] = useState(1);
  const visibleDays = 16;
  const days = Array.from({ length: visibleDays }, (_, i) => startDay + i).filter(d => d <= daysInMonth);

  const suiteNames = suites.map(s => s.name);

  // Map reservations to calendar blocks
  const bookings = reservations
    .filter(r => r.status !== "cancelled" && r.status !== "checked-out")
    .map(r => {
      const checkIn = new Date(r.check_in);
      const checkOut = new Date(r.check_out);
      return {
        suite: r.suite_name,
        guest: r.guest_name.split(" ").map((n, i) => i === 0 ? n[0] + "." : n).join(" "),
        startDay: checkIn.getMonth() === 2 ? checkIn.getDate() : 1,
        endDay: checkOut.getMonth() === 2 ? checkOut.getDate() : daysInMonth + 1,
        color: sourceColors[r.source || "Direct"] || "bg-muted-foreground/50",
        source: r.source || "Direct",
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Suite allocation for {monthName} — 3 Waves Paros</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setStartDay(Math.max(1, startDay - 7))} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground px-3">{monthName}</span>
          <button onClick={() => setStartDay(Math.min(daysInMonth - visibleDays + 1, startDay + 7))} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-3 w-28 bg-muted/30 border-b border-border sticky left-0">Suite</th>
                {days.map((day) => {
                  const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;
                  return (
                    <th key={day} className={`text-center text-xs font-medium p-2 border-b border-l border-border min-w-[50px] ${isWeekend ? "bg-muted/50 text-muted-foreground" : "text-muted-foreground"}`}>
                      <div>{day}</div>
                      <div className="text-[10px] opacity-60">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(2026, 2, day).getDay()]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {suiteNames.map((suite) => {
                const suiteBookings = bookings.filter(b => b.suite === suite);
                return (
                  <tr key={suite} className="hover:bg-muted/20 transition-colors">
                    <td className="text-sm font-medium text-foreground p-3 border-b border-border bg-card sticky left-0">{suite}</td>
                    {days.map((day) => {
                      const booking = suiteBookings.find(b => day >= b.startDay && day < b.endDay);
                      const isStart = booking && day === booking.startDay;
                      const isEnd = booking && day === booking.endDay - 1;
                      const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;
                      return (
                        <td key={day} className={`border-b border-l border-border p-0.5 h-10 relative ${isWeekend ? "bg-muted/30" : ""}`}>
                          {booking && (
                            <div className={`absolute inset-y-1 ${booking.color} ${isStart ? "left-1 rounded-l-md" : "left-0"} ${isEnd ? "right-1 rounded-r-md" : "right-0"} flex items-center`}>
                              {isStart && <span className="text-[10px] font-medium text-foreground px-1.5 truncate">{booking.guest}</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-info/70" /> Booking.com</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-success/70" /> Direct Booking</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent/70" /> Airbnb</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/70" /> Travel Agent</div>
      </div>
    </div>
  );
}
