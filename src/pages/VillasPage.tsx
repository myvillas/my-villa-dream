import { motion } from "framer-motion";
import { useState } from "react";
import { Users, MapPin, Star, Maximize, Check, X, Pencil, Plus, Download } from "lucide-react";
import { useSuites, useUpdateSuite, useCreateSuite } from "@/hooks/use-suites";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Διαθέσιμο", class: "bg-success/10 text-success" },
  occupied: { label: "Κατειλημμένο", class: "bg-info/10 text-info" },
  maintenance: { label: "Συντήρηση", class: "bg-destructive/10 text-destructive" },
  cleaning: { label: "Καθαρισμός", class: "bg-warning/10 text-warning" },
};

const statusOptions = ["available", "occupied", "cleaning", "maintenance"];

const DEFAULT_ROOMS = [
  {
    name: "Double Room with Balcony and Sea View",
    location: "Tellion Suites",
    size: "25m²",
    max_guests: 3,
    price_per_night: 120,
    status: "available" as const,
    emoji: "🌊",
    description: "20 rooms available. Double room with private balcony and sea view.",
    amenities: ["Balcony", "Sea View", "Air Conditioning", "Wi-Fi", "Private Bathroom"],
  },
  {
    name: "Double Room with Balcony",
    location: "Tellion Suites",
    size: "22m²",
    max_guests: 3,
    price_per_night: 100,
    status: "available" as const,
    emoji: "🛏️",
    description: "2 rooms available. Double room with private balcony.",
    amenities: ["Balcony", "Air Conditioning", "Wi-Fi", "Private Bathroom"],
  },
  {
    name: "Triple Room with Balcony",
    location: "Tellion Suites",
    size: "28m²",
    max_guests: 3,
    price_per_night: 130,
    status: "available" as const,
    emoji: "🏨",
    description: "Triple room with private balcony.",
    amenities: ["Balcony", "Air Conditioning", "Wi-Fi", "Private Bathroom"],
  },
  {
    name: "Apartment with Garden View",
    location: "Tellion Suites",
    size: "45m²",
    max_guests: 4,
    price_per_night: 160,
    status: "available" as const,
    emoji: "🌿",
    description: "2 units available. Apartment with garden view and kitchenette.",
    amenities: ["Garden View", "Kitchenette", "Air Conditioning", "Wi-Fi", "Private Bathroom", "Living Area"],
  },
  {
    name: "Apartment",
    location: "Tellion Suites",
    size: "40m²",
    max_guests: 3,
    price_per_night: 150,
    status: "available" as const,
    emoji: "🏠",
    description: "Comfortable apartment with kitchenette.",
    amenities: ["Kitchenette", "Air Conditioning", "Wi-Fi", "Private Bathroom", "Living Area"],
  },
];

export default function VillasPage() {
  const { data: suites = [], isLoading } = useSuites();
  const updateSuite = useUpdateSuite();
  const createSuite = useCreateSuite();
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", size: "", max_guests: "2", price_per_night: "", emoji: "🏨" });

  const stats = {
    available: suites.filter(v => v.status === "available").length,
    occupied: suites.filter(v => v.status === "occupied").length,
    maintenance: suites.filter(v => v.status === "maintenance").length,
    cleaning: suites.filter(v => v.status === "cleaning").length,
  };

  const handleSeedRooms = async () => {
    setSeeding(true);
    try {
      const existingNames = suites.map(s => s.name);
      const toInsert = DEFAULT_ROOMS.filter(r => !existingNames.includes(r.name));
      if (toInsert.length === 0) {
        toast.info("Τα δωμάτια υπάρχουν ήδη");
        return;
      }
      for (const room of toInsert) {
        await createSuite.mutateAsync(room);
      }
      toast.success(`Προστέθηκαν ${toInsert.length} δωμάτια!`);
    } catch (err: any) {
      toast.error(err.message || "Σφάλμα προσθήκης δωματίων");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.price_per_night) {
      toast.error("Συμπλήρωσε Όνομα και Τιμή");
      return;
    }
    try {
      await createSuite.mutateAsync({
        name: newRoom.name,
        size: newRoom.size || "—",
        max_guests: parseInt(newRoom.max_guests) || 2,
        price_per_night: parseFloat(newRoom.price_per_night),
        location: "Tellion Suites",
        status: "available",
        emoji: newRoom.emoji || "🏨",
        amenities: [],
      });
      toast.success("Το δωμάτιο προστέθηκε!");
      setShowAddForm(false);
      setNewRoom({ name: "", size: "", max_guests: "2", price_per_night: "", emoji: "🏨" });
    } catch (err: any) {
      toast.error(err.message || "Σφάλμα προσθήκης");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSuite.mutateAsync({ id, status: newStatus });
      toast.success(`Κατάσταση: ${statusConfig[newStatus]?.label}`);
    } catch (err: any) {
      toast.error(err.message || "Σφάλμα ενημέρωσης");
    }
  };

  const savePrice = async (suiteId: string) => {
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Εισήγαγε έγκυρη τιμή");
      return;
    }
    try {
      await updateSuite.mutateAsync({ id: suiteId, price_per_night: newPrice });
      toast.success("Τιμή ενημερώθηκε!");
      setEditingPrice(null);
    } catch (err: any) {
      toast.error(err.message || "Σφάλμα ενημέρωσης τιμής");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Φόρτωση δωματίων...</div>;
  }

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">PMS</p>
          <h1 className="text-2xl font-bold font-heading text-foreground">Δωμάτια</h1>
        </div>
        <div className="flex gap-2">
          {suites.length === 0 && (
            <button
              onClick={handleSeedRooms}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors disabled:opacity-50">
              <Download className="w-4 h-4" />
              {seeding ? "Προσθήκη..." : "Εισαγωγή από Booking.com"}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Νέο Δωμάτιο
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {suites.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats).filter(([_, count]) => count > 0).map(([key, count]) => (
            <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
              <div className={`w-2 h-2 rounded-full ${statusConfig[key]?.class.split(" ")[0] || ""}`} />
              <span className="text-muted-foreground">{statusConfig[key]?.label}:</span>
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add room form */}
      {showAddForm && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Νέο Δωμάτιο</h3>
          <form onSubmit={handleAddRoom} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Όνομα *</label>
              <input value={newRoom.name} onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                placeholder="π.χ. Double Room with Sea View" className={inputCls} autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Emoji</label>
              <input value={newRoom.emoji} onChange={e => setNewRoom(p => ({ ...p, emoji: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Μέγεθος</label>
              <input value={newRoom.size} onChange={e => setNewRoom(p => ({ ...p, size: e.target.value }))}
                placeholder="π.χ. 25m²" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max άτομα</label>
              <input type="number" min="1" max="20" value={newRoom.max_guests}
                onChange={e => setNewRoom(p => ({ ...p, max_guests: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Τιμή/βράδυ (€) *</label>
              <input type="number" step="0.01" value={newRoom.price_per_night}
                onChange={e => setNewRoom(p => ({ ...p, price_per_night: e.target.value }))} className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-3 flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                Ακύρωση
              </button>
              <button type="submit" disabled={createSuite.isPending}
                className="px-4 py-2 rounded-lg accent-gradient text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {createSuite.isPending ? "Αποθήκευση..." : "Προσθήκη"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {suites.length === 0 && !showAddForm && (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🏨</p>
          <p className="font-semibold text-foreground mb-1">Δεν υπάρχουν δωμάτια ακόμα</p>
          <p className="text-sm text-muted-foreground mb-4">Πάτα «Εισαγωγή από Booking.com» για αυτόματη προσθήκη ή «Νέο Δωμάτιο» για χειροκίνητη.</p>
        </div>
      )}

      {/* Rooms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suites.map((suite, i) => (
          <motion.div key={suite.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="stat-gradient p-4 flex items-center gap-3">
              <span className="text-2xl">{suite.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-primary-foreground leading-tight">{suite.name}</h3>
                <div className="flex items-center gap-1 text-xs text-primary-foreground/70 mt-0.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {suite.location}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Status buttons */}
              <div className="flex flex-wrap gap-1">
                {statusOptions.map(s => (
                  <button key={s} onClick={() => handleStatusChange(suite.id, s)}
                    className={`text-[10px] px-2 py-1 rounded-full font-medium transition-all ${
                      suite.status === s ? statusConfig[s]?.class : "bg-muted/30 text-muted-foreground hover:bg-muted"
                    }`}>
                    {statusConfig[s]?.label}
                  </button>
                ))}
                {suite.rating && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-accent text-accent" /> {suite.rating}
                  </div>
                )}
              </div>

              {suite.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{suite.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {suite.size && <div className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {suite.size}</div>}
                <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {suite.max_guests} άτομα</div>
                <div className="ml-auto">
                  {editingPrice === suite.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-foreground font-semibold">€</span>
                      <input type="number" value={priceValue}
                        onChange={e => setPriceValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") savePrice(suite.id); if (e.key === "Escape") setEditingPrice(null); }}
                        className="w-16 px-1.5 py-0.5 rounded border border-border bg-background text-sm font-semibold outline-none focus:ring-1 focus:ring-accent"
                        autoFocus />
                      <button onClick={() => savePrice(suite.id)} className="p-0.5 rounded hover:bg-success/10">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </button>
                      <button onClick={() => setEditingPrice(null)} className="p-0.5 rounded hover:bg-destructive/10">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPrice(suite.id); setPriceValue(String(suite.price_per_night)); }}
                      className="flex items-center gap-1 hover:bg-muted/50 rounded px-1.5 py-0.5 -mx-1.5 transition-colors group/price">
                      <span className="font-semibold text-foreground text-sm">€{suite.price_per_night}</span>
                      <span className="text-xs font-normal text-muted-foreground">/βράδυ</span>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>

              {(suite.amenities || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(suite.amenities || []).map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Seed button also shown at bottom when suites exist but missing Booking.com rooms */}
      {suites.length > 0 && suites.length < DEFAULT_ROOMS.length && (
        <div className="text-center">
          <button
            onClick={handleSeedRooms}
            disabled={seeding}
            className="text-sm text-accent hover:underline disabled:opacity-50">
            {seeding ? "Προσθήκη..." : `+ Εισαγωγή υπόλοιπων δωματίων από Booking.com (${DEFAULT_ROOMS.length - suites.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
