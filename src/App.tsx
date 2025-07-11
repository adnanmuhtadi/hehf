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
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsConditions from "./pages/TermsConditions";
import SummerSchools from "./pages/SummerSchools";
import HostApplication from "./pages/HostApplication";
import PhotoArchive from "./pages/PhotoArchive";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/for-students" element={<ForStudents />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:location" element={<Locations />} />
          <Route path="/summer-schools" element={<SummerSchools />} />
          <Route path="/host-application" element={<HostApplication />} />
          <Route path="/photo-archive" element={<PhotoArchive />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
