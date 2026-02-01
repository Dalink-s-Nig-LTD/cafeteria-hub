import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { role, userName } = useAuth();
  const isAdmin =
    role === "superadmin" ||
    role === "manager" ||
    role === "vc" ||
    role === "supervisor";

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src={logo}
              alt="New Era Cafeteria Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {isAdmin ? userName || "Admin Dashboard" : "Cashier Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Redeemers University · New Era Cafeteria
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
