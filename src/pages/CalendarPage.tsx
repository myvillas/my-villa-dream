import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Plus } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { useSuites } from "@/hooks/use-suites";
import NewReservationDialog from "@/components/NewReservationDialog";
import ReservationDetailDialog from "@/components/ReservationDetailDialog";
import type { Reservation } from "@/hooks/use-reservations";

const sourceColors: Record<string, string> = {
  "Booking.com": "bg-info",
  "Direct": "bg-success",
  "Airbnb": "bg-accent",
  "Expedia": "bg-primary",
  "Other": "bg-muted-foreground",
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const { data: reservations = [] } = useReservations();
  const { data: suites = [] } = useSuites();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [startDay, setStartDay] = useState(1);
  const visibleDays = 16;

  const [newOpen, setNewOpen] = useState(false);
  const [newInitialSuite, setNewInitialSuite] = useState("");
  const [newInitialDate, setNewInitialDate] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const openNewReservation = (suiteName: string, day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    setNewInitialSuite(suiteName);
    setNewInitialDate(`${currentYear}-${month}-${dayStr}`);
    setNewOpen(true);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const days = Array.from({ length: visibleDays }, (_, i) => startDay + i).filter(d => d <= daysInMonth);
  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  const suiteNames = suites.map(s => s.name);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setStartDay(1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setStartDay(1);
  };

  // Map reservations to calendar blocks
  const bookings = reservations
    .filter(r => r.status !== "cancelled")
    .map(r => {
      const checkIn = new Date(r.check_in);
      const checkOut = new Date(r.check_out);
      // Calculate which days fall within the current month view
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth, daysInMonth);

      let sd = checkIn >= monthStart ? checkIn.getDate() : 1;
      let ed = checkOut <= monthEnd ? checkOut.getDate() : daysInMonth + 1;

      // Only include if reservation overlaps this month
      if (checkOut < monthStart || checkIn > monthEnd) {
        sd = -1; ed = -1;
      }

      return {
        id: r.id,
        suite: r.suite_name,
        guest: r.guest_name,
        guestShort: r.guest_name.length > 14 ? r.guest_name.substring(0, 14) + "…" : r.guest_name,
        flag: r.guest_country_flag || "",
        startDay: sd,
        endDay: ed,
        color: sourceColors[r.source || "Direct"] || "bg-muted-foreground",
        source: r.source || "Direct",
        price: `€${Number(r.total_amount).toLocaleString()}`,
        balance: `€${Number(r.balance || 0).toLocaleString()}`,
        adults: r.occupants_adults || 2,
        children: r.occupants_children || 0,
        status: r.status,
      };
    })
    .filter(b => b.startDay > 0);

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
          <p className="text-sm text-muted-foreground mt-1">Suite allocation for {monthLabel} — 3 Waves Paros</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setStartDay(Math.max(1, startDay - 7))} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-sm font-medium text-foreground px-2 min-w-[140px] text-center">{monthLabel}</span>
            <button onClick={() => setStartDay(Math.min(daysInMonth - visibleDays + 1, startDay + 7))} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <button onClick={goToNextMonth} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
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
                  const isWeekend = new Date(currentYear, currentMonth, day).getDay() % 6 === 0;
                  const occ = getOccupancy(day);
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  return (
                    <th key={day} className={`text-center text-xs font-medium p-1.5 border-b border-l border-border min-w-[56px] ${isWeekend ? "bg-muted/50" : ""} ${isToday ? "ring-2 ring-inset ring-accent" : ""}`}>
                      <div className="text-[10px] text-muted-foreground">
                        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(currentYear, currentMonth, day).getDay()]}
                      </div>
                      <div className="font-semibold text-foreground">{day}</div>
                      <div className="text-[9px] text-muted-foreground">{monthNames[currentMonth].substring(0, 3).toUpperCase()}</div>
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
                      const reservationObj = booking
                        ? (reservations.find(r => r.id === booking.id) ?? null)
                        : null;
                      const isStart = booking && day === Math.max(booking.startDay, days[0]);
                      const isWeekend = new Date(currentYear, currentMonth, day).getDay() % 6 === 0;

                      let span = 0;
                      if (isStart && booking) {
                        const endVisible = Math.min(booking.endDay - 1, days[days.length - 1]);
                        span = endVisible - day + 1;
                      }

                      if (booking && !isStart) return null;

                      return (
                        <td
                          key={day}
                          colSpan={isStart && span > 1 ? span : 1}
                          className={`border-b border-l border-border p-0.5 h-16 relative group ${isWeekend && !booking ? "bg-muted/20" : ""}`}
                          onClick={() => !booking && openNewReservation(suite, day)}
                        >
                          {booking && isStart ? (
                            <div
                              className={`${booking.color} rounded-md mx-0.5 h-full flex flex-col justify-between p-1.5 text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity`}
                              onClick={e => { e.stopPropagation(); if (reservationObj) setSelectedReservation(reservationObj); }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-semibold bg-primary-foreground/20 rounded px-1">
                                  {booking.source === "Booking.com" ? "B" : booking.source === "Airbnb" ? "A" : booking.source === "Expedia" ? "E" : "D"}
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
                          ) : !booking ? (
                            <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Plus className="w-4 h-4 text-muted-foreground/60" />
                            </div>
                          ) : null}
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
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /> Expedia</div>
        <div className="flex items-center gap-2 ml-auto text-muted-foreground/60 italic">Click empty cell to add booking</div>
      </div>

      <NewReservationDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        initialSuite={newInitialSuite}
        initialCheckIn={newInitialDate}
      />
      <ReservationDetailDialog
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </div>
  );
}
