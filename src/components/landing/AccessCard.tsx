import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AccessCardProps {
  type: "cashier" | "admin";
  onSuccess: () => void;
}

export function AccessCard({ type, onSuccess }: AccessCardProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const isCashier = type === "cashier";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(code);

      if (result.success) {
        toast({
          title: "Access Granted",
          description: `Welcome to the ${isCashier ? "Cashier" : "Admin"} Dashboard`,
        });
        onSuccess();
      } else {
        toast({
          title: "Access Denied",
          description: result.error || "Incorrect Access Code",
          variant: "destructive",
        });
        setCode("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`
      relative overflow-hidden hover-lift cursor-pointer group
      border-0 shadow-card hover:shadow-glow
      ${isCashier ? "bg-gradient-to-br from-primary to-navy" : "bg-gradient-to-br from-accent to-gold-dark"}
    `}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />

      <CardContent className="relative z-10 p-8 min-h-[320px] flex flex-col justify-between">
        <div>
          <div
            className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-6
            ${isCashier ? "bg-white/20" : "bg-foreground/20"}
          `}
          >
            {isCashier ? (
              <User className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Shield className="w-8 h-8 text-accent-foreground" />
            )}
          </div>

          <h2
            className={`
            text-2xl font-display font-bold mb-2
            ${isCashier ? "text-primary-foreground" : "text-accent-foreground"}
          `}
          >
            {isCashier ? "Cashier" : "Admin"}
          </h2>

          <p
            className={`
            text-sm mb-6 opacity-80
            ${isCashier ? "text-primary-foreground" : "text-accent-foreground"}
          `}
          >
            {isCashier
              ? "Process orders, manage cart, and print receipts"
              : "View reports, analytics, and manage menu items"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock
              className={`
              absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
              ${isCashier ? "text-primary-foreground/60" : "text-accent-foreground/60"}
            `}
            />
            <Input
              type="password"
              placeholder="Enter access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={4}
              className={`
                pl-10 border-0 
                ${
                  isCashier
                    ? "bg-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-white/50"
                    : "bg-foreground/20 text-accent-foreground placeholder:text-accent-foreground/50 focus-visible:ring-foreground/50"
                }
              `}
            />
          </div>

          <Button
            type="submit"
            disabled={code.length !== 4 || isLoading}
            className={`
              w-full font-semibold group/btn
              ${
                isCashier
                  ? "bg-white text-primary hover:bg-white/90"
                  : "bg-foreground text-accent hover:bg-foreground/90"
              }
            `}
          >
            {isLoading ? "Verifying..." : "Access Dashboard"}
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
