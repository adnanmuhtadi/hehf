import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import BecomeHost from "./pages/BecomeHost";
import ForStudents from "./pages/ForStudents";
import Locations from "./pages/Locations";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsConditions from "./pages/TermsConditions";
import Education from "./pages/Education";
import Travel from "./pages/Travel";
import ScrollToTop from "@/components/ScrollToTop"; // <-- Your scroll handler

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Scroll to top on route change */}
        <ScrollToTop />   {/* <-- Just add this here! */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/for-students" element={<ForStudents />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:location" element={<Locations />} />
          <Route path="/education" element={<Education />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
