import { motion } from "framer-motion";
import { BedDouble, Users, MapPin, Star, MoreHorizontal, Maximize } from "lucide-react";

type Suite = {
  name: string;
  location: string;
  size: string;
  maxGuests: number;
  pricePerNight: string;
  status: "available" | "occupied" | "maintenance" | "cleaning";
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  currentGuest?: string;
  nextCheckIn?: string;
};

const suitesData: Suite[] = [
  {
    name: "Wave I",
    location: "Krotiri Hillside, Parikia",
    size: "27 m²",
    maxGuests: 2,
    pricePerNight: "€180",
    status: "occupied",
    rating: 4.9,
    image: "🏖️",
    description: "Bright and elegant sea view room with minimalist Cycladic design and a private balcony overlooking the Aegean.",
    amenities: ["King-size bed", "Harbor view", "Private balcony", "Nespresso", "Rain shower"],
    currentGuest: "Maria Santos",
  },
  {
    name: "Wave II",
    location: "Krotiri Hillside, Parikia",
    size: "30 m²",
    maxGuests: 2,
    pricePerNight: "€220",
    status: "available",
    rating: 4.9,
    image: "🌅",
    description: "Spacious studio with a kitchenette, natural textures, and large openings with panoramic sea views.",
    amenities: ["King-size bed", "Panoramic sea view", "Large terrace", "Nespresso", "Outdoor shower"],
    nextCheckIn: "Mar 12",
  },
  {
    name: "Wave III",
    location: "Krotiri Hillside, Parikia",
    size: "35 m²",
    maxGuests: 2,
    pricePerNight: "€260",
    status: "cleaning",
    rating: 4.9,
    image: "🌊",
    description: "Expansive west-facing suite with enhanced privacy, generous space, and an outdoor bathtub for sunset moments.",
    amenities: ["King-size bed", "Sunset harbor view", "Private terrace", "Nespresso", "Outdoor bathtub"],
    nextCheckIn: "Mar 15",
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Available", class: "bg-success/10 text-success" },
  occupied: { label: "Occupied", class: "bg-info/10 text-info" },
  maintenance: { label: "Maintenance", class: "bg-destructive/10 text-destructive" },
  cleaning: { label: "Cleaning", class: "bg-warning/10 text-warning" },
};

export default function VillasPage() {
  const stats = {
    available: suitesData.filter(v => v.status === "available").length,
    occupied: suitesData.filter(v => v.status === "occupied").length,
    maintenance: suitesData.filter(v => v.status === "maintenance").length,
    cleaning: suitesData.filter(v => v.status === "cleaning").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Suites</h1>
        <p className="text-sm text-muted-foreground mt-1">3 Waves Paros — {suitesData.length} sea view suites in Parikia</p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(stats).filter(([_, count]) => count > 0).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
            <div className={`w-2 h-2 rounded-full ${statusConfig[key].class.split(" ")[0]}`} />
            <span className="capitalize text-muted-foreground">{key}:</span>
            <span className="font-semibold text-foreground">{count}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suitesData.map((suite, i) => (
          <motion.div
            key={suite.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Header */}
            <div className="stat-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{suite.image}</span>
                <div>
                  <h3 className="font-heading font-semibold text-primary-foreground">{suite.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
                    <MapPin className="w-3 h-3" /> {suite.location}
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
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[suite.status].class}`}>
                  {statusConfig[suite.status].label}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-accent text-accent" /> {suite.rating}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{suite.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5" /> {suite.size}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {suite.maxGuests} guests
                </div>
                <div className="ml-auto font-semibold text-foreground text-sm">
                  {suite.pricePerNight}<span className="text-xs font-normal text-muted-foreground">/night</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5">
                {suite.amenities.map(a => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a}</span>
                ))}
              </div>

              {suite.currentGuest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium text-foreground">{suite.currentGuest}</span>
                </div>
              )}
              {suite.nextCheckIn && !suite.currentGuest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Next check-in:</span>{" "}
                  <span className="font-medium text-foreground">{suite.nextCheckIn}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
