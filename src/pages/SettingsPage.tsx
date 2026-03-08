import { motion } from "framer-motion";
import { Building2, Globe, Bell, Shield, Palette, Database } from "lucide-react";

const settingsSections = [
  { icon: Building2, title: "Property Details", description: "Manage your villa portfolio information, addresses, and contact details." },
  { icon: Globe, title: "Channel Manager", description: "Connect and sync with OTAs like Booking.com, Airbnb, and Expedia." },
  { icon: Bell, title: "Notifications", description: "Configure email, SMS, and push notification preferences." },
  { icon: Shield, title: "Users & Permissions", description: "Manage staff accounts, roles, and access levels." },
  { icon: Palette, title: "Appearance", description: "Customize your PMS dashboard theme and branding." },
  { icon: Database, title: "Data & Backup", description: "Export data, manage backups, and configure integrations." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your Myvillas PMS</p>
      </div>

      <div className="space-y-3">
        {settingsSections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="p-3 rounded-lg bg-muted group-hover:bg-accent/10 transition-colors">
              <section.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="text-muted-foreground text-sm">→</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
