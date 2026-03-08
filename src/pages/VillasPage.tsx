import { motion } from "framer-motion";
import { BedDouble, Users, MapPin, Star, MoreHorizontal } from "lucide-react";

type Villa = {
  name: string;
  location: string;
  bedrooms: number;
  maxGuests: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance" | "cleaning";
  rating: number;
  image: string;
  currentGuest?: string;
  nextCheckIn?: string;
};

const villasData: Villa[] = [
  { name: "Villa Azure", location: "Beachfront", bedrooms: 4, maxGuests: 8, pricePerNight: "€750", status: "occupied", rating: 4.9, image: "🏖️", currentGuest: "Maria Santos", nextCheckIn: "Mar 16" },
  { name: "Villa Sunset", location: "Hillside", bedrooms: 3, maxGuests: 6, pricePerNight: "€600", status: "available", rating: 4.8, image: "🌅" },
  { name: "Villa Olive", location: "Garden", bedrooms: 2, maxGuests: 4, pricePerNight: "€450", status: "occupied", rating: 4.7, image: "🫒", currentGuest: "Sophie Laurent" },
  { name: "Villa Breeze", location: "Beachfront", bedrooms: 3, maxGuests: 6, pricePerNight: "€700", status: "cleaning", rating: 4.9, image: "🌊", nextCheckIn: "Mar 15" },
  { name: "Villa Coral", location: "Poolside", bedrooms: 5, maxGuests: 10, pricePerNight: "€950", status: "occupied", rating: 4.8, image: "🪸", currentGuest: "Elena Rossi" },
  { name: "Villa Luna", location: "Hillside", bedrooms: 2, maxGuests: 4, pricePerNight: "€400", status: "available", rating: 4.6, image: "🌙" },
  { name: "Villa Flora", location: "Garden", bedrooms: 3, maxGuests: 6, pricePerNight: "€550", status: "maintenance", rating: 4.5, image: "🌺" },
  { name: "Villa Horizon", location: "Beachfront", bedrooms: 4, maxGuests: 8, pricePerNight: "€850", status: "available", rating: 4.9, image: "🌄", nextCheckIn: "Mar 12" },
  { name: "Villa Marina", location: "Poolside", bedrooms: 3, maxGuests: 6, pricePerNight: "€650", status: "occupied", rating: 4.7, image: "⚓", currentGuest: "Claire Duval" },
  { name: "Villa Terra", location: "Garden", bedrooms: 2, maxGuests: 4, pricePerNight: "€380", status: "available", rating: 4.6, image: "🌿" },
  { name: "Villa Stella", location: "Hillside", bedrooms: 4, maxGuests: 8, pricePerNight: "€800", status: "occupied", rating: 4.8, image: "⭐", currentGuest: "Nikolai Petrov" },
  { name: "Villa Serene", location: "Beachfront", bedrooms: 5, maxGuests: 10, pricePerNight: "€1,100", status: "available", rating: 4.9, image: "🏝️" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Available", class: "bg-success/10 text-success" },
  occupied: { label: "Occupied", class: "bg-info/10 text-info" },
  maintenance: { label: "Maintenance", class: "bg-destructive/10 text-destructive" },
  cleaning: { label: "Cleaning", class: "bg-warning/10 text-warning" },
};

export default function VillasPage() {
  const stats = {
    available: villasData.filter(v => v.status === "available").length,
    occupied: villasData.filter(v => v.status === "occupied").length,
    maintenance: villasData.filter(v => v.status === "maintenance").length,
    cleaning: villasData.filter(v => v.status === "cleaning").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Villas</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your {villasData.length} properties</p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(stats).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
            <div className={`w-2 h-2 rounded-full ${statusConfig[key].class.split(" ")[0]}`} />
            <span className="capitalize text-muted-foreground">{key}:</span>
            <span className="font-semibold text-foreground">{count}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {villasData.map((villa, i) => (
          <motion.div
            key={villa.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Header */}
            <div className="stat-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{villa.image}</span>
                <div>
                  <h3 className="font-heading font-semibold text-primary-foreground">{villa.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
                    <MapPin className="w-3 h-3" /> {villa.location}
                  </div>
                </div>
              </div>
              <button className="p-1.5 rounded hover:bg-primary-foreground/10 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[villa.status].class}`}>
                  {statusConfig[villa.status].label}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-accent text-accent" /> {villa.rating}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" /> {villa.bedrooms} bed
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {villa.maxGuests} guests
                </div>
                <div className="ml-auto font-semibold text-foreground text-sm">
                  {villa.pricePerNight}<span className="text-xs font-normal text-muted-foreground">/night</span>
                </div>
              </div>

              {villa.currentGuest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium text-foreground">{villa.currentGuest}</span>
                </div>
              )}
              {villa.nextCheckIn && !villa.currentGuest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Next check-in:</span>{" "}
                  <span className="font-medium text-foreground">{villa.nextCheckIn}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
