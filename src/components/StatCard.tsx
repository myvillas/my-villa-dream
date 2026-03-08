import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  variant?: "default" | "accent" | "primary";
}

export default function StatCard({ title, value, change, icon, variant = "default" }: StatCardProps) {
  const bgClass = variant === "accent"
    ? "accent-gradient"
    : variant === "primary"
    ? "stat-gradient"
    : "glass-card";

  const textClass = variant !== "default"
    ? "text-primary-foreground"
    : "text-foreground";

  const subtextClass = variant !== "default"
    ? "text-primary-foreground/70"
    : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-5 ${bgClass}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${subtextClass}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 font-heading ${textClass}`}>{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${change.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {change} vs last month
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${variant !== "default" ? "bg-white/10" : "bg-muted"}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
