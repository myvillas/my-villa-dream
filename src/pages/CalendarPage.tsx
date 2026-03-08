import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";

const sourceColors: Record<string, string> = {
  "Booking.com": "bg-info",
  "Direct": "bg-success",
  "Airbnb": "bg-accent",
  "Expedia": "bg-primary",
  "Other": "bg-muted-foreground",
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
    .filter(r => r.status !== "cancelled")
    .map(r => {
      const checkIn = new Date(r.check_in);
      const checkOut = new Date(r.check_out);
      return {
        suite: r.suite_name,
        guest: r.guest_name,
        guestShort: r.guest_name.length > 14 ? r.guest_name.substring(0, 14) + "…" : r.guest_name,
        flag: r.guest_country_flag || "",
        startDay: checkIn.getMonth() === 2 ? checkIn.getDate() : (checkIn.getMonth() < 2 ? 1 : daysInMonth + 1),
        endDay: checkOut.getMonth() === 2 ? checkOut.getDate() : (checkOut.getMonth() < 2 ? 1 : daysInMonth + 1),
        color: sourceColors[r.source || "Direct"] || "bg-muted-foreground",
        source: r.source || "Direct",
        price: `€${Number(r.total_amount).toLocaleString()}`,
        balance: `€${Number(r.balance || 0).toLocaleString()}`,
        adults: r.occupants_adults || 2,
        children: r.occupants_children || 0,
        status: r.status,
      };
    });

  // Calculate occupancy % per day
  const totalSuites = suites.length || 1;
  const getOccupancy = (day: number) => {
    const occupied = bookings.filter(b =>
      day >= b.startDay && day < b.endDay && b.status !== "checked-out"
    ).length;
    return Math.round((occupied / totalSuites) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Bookings Calendar</h1>
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
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-3 w-32 bg-muted/30 border-b border-border sticky left-0 z-10">
                  Room
                </th>
                {days.map((day) => {
                  const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;
                  const occ = getOccupancy(day);
                  return (
                    <th key={day} className={`text-center text-xs font-medium p-1.5 border-b border-l border-border min-w-[56px] ${isWeekend ? "bg-muted/50" : ""}`}>
                      <div className="text-[10px] text-muted-foreground">
                        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(2026, 2, day).getDay()]}
                      </div>
                      <div className="font-semibold text-foreground">{day}</div>
                      <div className="text-[9px] text-muted-foreground">MAR</div>
                      <div className={`text-[9px] font-semibold mt-0.5 ${
                        occ >= 60 ? "text-success" : occ >= 30 ? "text-warning" : "text-muted-foreground"
                      }`}>
                        {occ}%
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {suiteNames.map((suite) => {
                const suiteBookings = bookings.filter(b => b.suite === suite);
                return (
                  <tr key={suite} className="hover:bg-muted/10 transition-colors">
                    <td className="text-xs font-medium text-foreground p-3 border-b border-border bg-card sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{suite}</span>
                      </div>
                    </td>
                    {days.map((day) => {
                      const booking = suiteBookings.find(b => day >= b.startDay && day < b.endDay);
                      const isStart = booking && day === Math.max(booking.startDay, days[0]);
                      const isEnd = booking && day === Math.min(booking.endDay - 1, days[days.length - 1]);
                      const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;

                      // Calculate span for start cell
                      let span = 0;
                      if (isStart && booking) {
                        const endVisible = Math.min(booking.endDay - 1, days[days.length - 1]);
                        span = endVisible - day + 1;
                      }

                      // Skip cells that are covered by a spanning booking (but not the start)
                      if (booking && !isStart) {
                        return null;
                      }

                      return (
                        <td
                          key={day}
                          colSpan={isStart && span > 1 ? span : 1}
                          className={`border-b border-l border-border p-0.5 h-16 relative ${isWeekend && !booking ? "bg-muted/20" : ""}`}
                        >
                          {booking && isStart && (
                            <div className={`${booking.color} rounded-md mx-0.5 h-full flex flex-col justify-between p-1.5 text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity`}>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-semibold bg-primary-foreground/20 rounded px-1">
                                  {booking.source === "Booking.com" ? "B" : booking.source === "Airbnb" ? "A" : "D"}
                                </span>
                                {booking.flag && <span className="text-[10px]">{booking.flag}</span>}
                                <span className="text-[10px] font-medium truncate">{booking.guestShort}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[9px] opacity-80">
                                  <Users className="w-2.5 h-2.5" />
                                  {booking.adults}{booking.children > 0 && <span>+{booking.children}</span>}
                                </div>
                                <span className="text-[9px] font-semibold">{booking.balance}/{booking.price}</span>
                              </div>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-info" /> Booking.com</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-success" /> Direct Booking</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent" /> Airbnb</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /> Travel Agent</div>
      </div>
    </div>
  );
}
