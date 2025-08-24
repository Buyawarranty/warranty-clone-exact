import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import WebsiteFooter from "@/components/WebsiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarSpinnerPreview from "./components/CarSpinnerPreview";
import ThankYou from "./pages/ThankYou";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminTest from "./pages/AdminTest";
import PasswordReset from "./components/PasswordReset";
import ResetPassword from "./pages/ResetPassword";
import QuickPasswordReset from "./pages/QuickPasswordReset";
import PaymentFallback from "./pages/PaymentFallback";

import CarJourneyDemo from "./pages/CarJourneyDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-32">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/payment-fallback" element={<PaymentFallback />} />
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-test" element={<AdminTest />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/password-reset" element={<ResetPassword />} />
                <Route path="/quick-reset" element={<QuickPasswordReset />} />
                <Route path="/car-journey" element={<CarJourneyDemo />} />
                <Route path="/car-preview" element={<CarSpinnerPreview />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <WebsiteFooter />
          </div>
        </BrowserRouter>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
