import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import BecomeHost from "./pages/BecomeHost";
import BecomePartner from "./pages/BecomePartner";
import ElstreeAndBorehamwood from "./pages/locations/Elstree-and-Borehamwood";
import HatchEnd from "./pages/locations/HatchEnd";
import Harpenden from "./pages/locations/Harpenden";
import Stevenage from "./pages/locations/Stevenage";
import Loughton from "./pages/locations/Loughton";
import Harrow from "./pages/locations/Harrow";
import Watford from "./pages/locations/Watford";
import Chingford from "./pages/locations/Chingford";
import Cheshunt from "./pages/locations/Cheshunt";
import SummerSchools from "./pages/SummerSchools";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsConditions from "./pages/TermsConditions";
import Travel from "./pages/Travel";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () =>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>;

export default App;
