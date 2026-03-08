import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { Bell, Search, User } from "lucide-react";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reservations, guests, villas..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Manager</p>
              </div>
              <div className="w-9 h-9 rounded-full stat-gradient flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
