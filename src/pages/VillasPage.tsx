import { motion } from "framer-motion";
import { useState } from "react";
import { Users, MapPin, Star, Maximize, Check, X, Pencil } from "lucide-react";
import { useSuites, useUpdateSuite } from "@/hooks/use-suites";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Available", class: "bg-success/10 text-success" },
  occupied: { label: "Occupied", class: "bg-info/10 text-info" },
  maintenance: { label: "Maintenance", class: "bg-destructive/10 text-destructive" },
  cleaning: { label: "Cleaning", class: "bg-warning/10 text-warning" },
};

const statusOptions = ["available", "occupied", "cleaning", "maintenance"];

export default function VillasPage() {
  const { data: suites = [], isLoading } = useSuites();
  const updateSuite = useUpdateSuite();
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");

  const stats = {
    available: suites.filter(v => v.status === "available").length,
    occupied: suites.filter(v => v.status === "occupied").length,
    maintenance: suites.filter(v => v.status === "maintenance").length,
    cleaning: suites.filter(v => v.status === "cleaning").length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSuite.mutateAsync({ id, status: newStatus });
      toast.success(`Suite status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const startEditPrice = (suiteId: string, currentPrice: number) => {
    setEditingPrice(suiteId);
    setPriceValue(String(currentPrice));
  };

  const savePrice = async (suiteId: string) => {
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      await updateSuite.mutateAsync({ id: suiteId, price_per_night: newPrice });
      toast.success("Price updated!");
      setEditingPrice(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update price");
    }
  };

  const cancelEditPrice = () => {
    setEditingPrice(null);
    setPriceValue("");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading suites...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Suites</h1>
        <p className="text-sm text-muted-foreground mt-1">3 Waves Paros — {suites.length} sea view suites in Parikia</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(stats).filter(([_, count]) => count > 0).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
            <div className={`w-2 h-2 rounded-full ${statusConfig[key]?.class.split(" ")[0] || ""}`} />
            <span className="capitalize text-muted-foreground">{key}:</span>
            <span className="font-semibold text-foreground">{count}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suites.map((suite, i) => (
          <motion.div key={suite.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="stat-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{suite.emoji}</span>
                <div>
                  <h3 className="font-heading font-semibold text-primary-foreground">{suite.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
                    <MapPin className="w-3 h-3" /> {suite.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {statusOptions.map(s => (
                    <button key={s} onClick={() => handleStatusChange(suite.id, s)}
                      className={`text-[10px] px-2 py-1 rounded-full font-medium transition-all ${
                        suite.status === s ? statusConfig[s]?.class || "" : "bg-muted/30 text-muted-foreground hover:bg-muted"
                      }`}>
                      {statusConfig[s]?.label || s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-accent text-accent" /> {suite.rating}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{suite.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {suite.size}</div>
                <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {suite.max_guests} guests</div>
                <div className="ml-auto">
                  {editingPrice === suite.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-foreground font-semibold">€</span>
                      <input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") savePrice(suite.id); if (e.key === "Escape") cancelEditPrice(); }}
                        className="w-16 px-1.5 py-0.5 rounded border border-border bg-background text-sm text-foreground font-semibold outline-none focus:ring-1 focus:ring-accent"
                        autoFocus
                      />
                      <button onClick={() => savePrice(suite.id)} className="p-0.5 rounded hover:bg-success/10 transition-colors">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </button>
                      <button onClick={cancelEditPrice} className="p-0.5 rounded hover:bg-destructive/10 transition-colors">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditPrice(suite.id, suite.price_per_night)}
                      className="flex items-center gap-1 group/price hover:bg-muted/50 rounded px-1.5 py-0.5 -mx-1.5 transition-colors"
                    >
                      <span className="font-semibold text-foreground text-sm">€{suite.price_per_night}</span>
                      <span className="text-xs font-normal text-muted-foreground">/night</span>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(suite.amenities || []).map(a => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a}</span>
                ))}
              </div>

              {suite.current_guest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium text-foreground">{suite.current_guest}</span>
                </div>
              )}
              {suite.next_check_in && !suite.current_guest && (
                <div className="text-xs bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Next check-in:</span>{" "}
                  <span className="font-medium text-foreground">{new Date(suite.next_check_in).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
