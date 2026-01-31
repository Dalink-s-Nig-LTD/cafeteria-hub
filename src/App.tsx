import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const App = () => {
  // If Convex is not configured, render without provider
  if (!convex) {
    return <AppContent />;
  }

  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  );
};

export default App;
