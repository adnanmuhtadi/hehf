import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import BecomeHost from "./pages/BecomeHost";
import BecomePartner from "./pages/BecomePartner";
import ElstreeAndBorehamwood from "./pages/locations/Elstree-and-Borehamwood";
import HatchEnd from "./pages/locations/HatchEnd";
import Harpenden from "./pages/locations/Harpenden"; // <-- Updated import
import Stevenage from "./pages/locations/Stevenage"; // <-- Updated import
import Loughton from "./pages/locations/Loughton"; // <-- Updated import
import Harrow from "./pages/locations/Harrow"; // <-- Updated import
import Watford from "./pages/locations/Watford"; // <-- Updated import
import Chingford from "./pages/locations/Chingford"; // <-- Updated import
import Cheshunt from "./pages/locations/Cheshunt"; // <-- Updated import
import SummerSchools from "./pages/SummerSchools";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsConditions from "./pages/TermsConditions";
import Travel from "./pages/Travel";
import ScrollToTop from "@/components/ScrollToTop"; // <-- Your scroll handler

const queryClient = new QueryClient();

const App = () =>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Scroll to top on route change */}
        <ScrollToTop /> {/* <-- Just add this here! */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/become-partners" element={<BecomePartner />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route
            path="/locations/Elstree-and-Borehamwood"
            element={<ElstreeAndBorehamwood />}
          />
          <Route path="/locations/Stevenage" element={<Stevenage />} />
          <Route path="/locations/Loughton" element={<Loughton />} />
          <Route path="/locations/Harrow" element={<Harrow />} />
          <Route path="/locations/Hatch-End" element={<HatchEnd />} />
          <Route path="/locations/Harpenden" element={<Harpenden />} />
          <Route path="/locations/Watford" element={<Watford />} />
          <Route path="/locations/Chingford" element={<Chingford />} />
          <Route path="/locations/Cheshunt" element={<Cheshunt />} />
          <Route path="/summer-schools" element={<SummerSchools />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;

export default App;
