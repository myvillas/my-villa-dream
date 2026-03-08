import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const villas = [
  "Villa Azure", "Villa Sunset", "Villa Olive", "Villa Breeze",
  "Villa Coral", "Villa Luna", "Villa Flora", "Villa Horizon",
  "Villa Marina", "Villa Terra", "Villa Stella", "Villa Serene",
];

type BookingBlock = {
  villa: string;
  guest: string;
  startDay: number;
  endDay: number;
  color: string;
};

const bookings: BookingBlock[] = [
  { villa: "Villa Azure", guest: "M. Santos", startDay: 1, endDay: 6, color: "bg-info/70" },
  { villa: "Villa Azure", guest: "L. Chen", startDay: 10, endDay: 15, color: "bg-success/70" },
  { villa: "Villa Sunset", guest: "J. Wilson", startDay: 3, endDay: 10, color: "bg-accent/70" },
  { villa: "Villa Olive", guest: "S. Laurent", startDay: 1, endDay: 4, color: "bg-primary/70" },
  { villa: "Villa Olive", guest: "P. Dubois", startDay: 7, endDay: 14, color: "bg-info/70" },
  { villa: "Villa Breeze", guest: "H. Mueller", startDay: 5, endDay: 9, color: "bg-success/70" },
  { villa: "Villa Coral", guest: "E. Rossi", startDay: 2, endDay: 8, color: "bg-accent/70" },
  { villa: "Villa Luna", guest: "A. Garcia", startDay: 8, endDay: 15, color: "bg-primary/70" },
  { villa: "Villa Flora", guest: "K. Tanaka", startDay: 1, endDay: 5, color: "bg-warning/70" },
  { villa: "Villa Horizon", guest: "R. Brown", startDay: 12, endDay: 16, color: "bg-info/70" },
  { villa: "Villa Marina", guest: "C. Duval", startDay: 4, endDay: 11, color: "bg-success/70" },
  { villa: "Villa Stella", guest: "N. Petrov", startDay: 6, endDay: 10, color: "bg-accent/70" },
];

const daysInMonth = 31;
const monthName = "March 2026";

export default function CalendarPage() {
  const [startDay, setStartDay] = useState(1);
  const visibleDays = 16;
  const days = Array.from({ length: visibleDays }, (_, i) => startDay + i).filter(d => d <= daysInMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Visual villa allocation for {monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDay(Math.max(1, startDay - 7))}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground px-3">{monthName}</span>
          <button
            onClick={() => setStartDay(Math.min(daysInMonth - visibleDays + 1, startDay + 7))}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-3 w-36 bg-muted/30 border-b border-border sticky left-0">
                  Villa
                </th>
                {days.map((day) => {
                  const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;
                  return (
                    <th
                      key={day}
                      className={`text-center text-xs font-medium p-2 border-b border-l border-border min-w-[50px] ${
                        isWeekend ? "bg-muted/50 text-muted-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <div>{day}</div>
                      <div className="text-[10px] opacity-60">
                        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(2026, 2, day).getDay()]}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {villas.map((villa) => {
                const villaBookings = bookings.filter(b => b.villa === villa);
                return (
                  <tr key={villa} className="hover:bg-muted/20 transition-colors">
                    <td className="text-sm font-medium text-foreground p-3 border-b border-border bg-card sticky left-0">
                      {villa}
                    </td>
                    {days.map((day) => {
                      const booking = villaBookings.find(b => day >= b.startDay && day < b.endDay);
                      const isStart = booking && day === booking.startDay;
                      const isEnd = booking && day === booking.endDay - 1;
                      const isWeekend = new Date(2026, 2, day).getDay() % 6 === 0;

                      return (
                        <td
                          key={day}
                          className={`border-b border-l border-border p-0.5 h-10 relative ${
                            isWeekend ? "bg-muted/30" : ""
                          }`}
                        >
                          {booking && (
                            <div
                              className={`absolute inset-y-1 ${booking.color} ${
                                isStart ? "left-1 rounded-l-md" : "left-0"
                              } ${isEnd ? "right-1 rounded-r-md" : "right-0"} flex items-center`}
                            >
                              {isStart && (
                                <span className="text-[10px] font-medium text-foreground px-1.5 truncate">
                                  {booking.guest}
                                </span>
                              )}
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
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-info/70" /> OTA Booking</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-success/70" /> Direct Booking</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent/70" /> Repeat Guest</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/70" /> Travel Agent</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-warning/70" /> VIP</div>
      </div>
    </div>
  );
}
