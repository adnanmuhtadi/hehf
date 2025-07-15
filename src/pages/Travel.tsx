import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Bus, Landmark, Globe2, Users, MapPinned, Star, Eye, Compass, Ticket,
} from "lucide-react";
import { travelHighlights } from "@/data/travel-highlights";

// Utility to map string to Lucide icon component
const iconMap: Record<string, React.ReactNode> = {
  Bus: <Bus className="h-8 w-8 text-accent" />,
  Landmark: <Landmark className="h-8 w-8 text-accent" />,
  Compass: <Compass className="h-8 w-8 text-accent" />,
  Ticket: <Ticket className="h-8 w-8 text-accent" />,
};

const TravelAndTours = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[800px] flex items-center justify-center bg-gradient-to-br from-pink-300 via-primary to-violet-300 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="London travel"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          draggable={false}
        />
        <div className="relative z-10 text-center py-20 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-black text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
          >
            Explore the UK <span className="inline-block animate-bounce">🌍</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-white/90"
          >
            Unlock every moment for your students—discover the sights, stories, and spirit of Britain with tailored travel & tour experiences.
          </motion.p>
        </div>
      </section>

      {/* Highlight Cards */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } }
            }}
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {travelHighlights.map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="rounded-2xl bg-white/80 shadow-xl p-8 text-center flex flex-col items-center hover:scale-105 hover:bg-white transition-transform duration-300"
              >
                {iconMap[item.icon]}
                <h3 className="mt-5 mb-2 text-lg font-bold text-primary">{item.title}</h3>
                <p className="text-base text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About the Experience */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/20 p-10 shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-foreground">
              Expertly Curated. Totally Unique.
            </h2>
            <p className="text-lg md:text-xl text-center text-muted-foreground mb-8">
              A study visit to the UK is a once-in-a-lifetime adventure—make it unforgettable.
              Our passionate team handles everything: from bespoke itineraries and group discounts
              to insider tips on what to see, when to go, and how to get there.
            </p>
            <ul className="grid gap-5 md:grid-cols-2 text-base text-foreground">
              <li className="flex items-start gap-3"><Star className="text-accent w-5 h-5" /> Iconic and offbeat attractions—London Eye, British Museum, secret city tours</li>
              <li className="flex items-start gap-3"><Globe2 className="text-accent w-5 h-5" /> Sustainable travel options and eco-friendly adventures</li>
              <li className="flex items-start gap-3"><MapPinned className="text-accent w-5 h-5" /> Custom routes for solo students or full groups</li>
              <li className="flex items-start gap-3"><Eye className="text-accent w-5 h-5" /> All interests welcome—history buffs, thrill seekers, or first-time explorers!</li>
            </ul>
            <p className="mt-8 text-center text-lg font-semibold">
              Let your students see the UK from a fresh perspective—immersing themselves in culture, history, and excitement. 
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="/contact"
                className="inline-block rounded-xl px-8 py-4 font-bold bg-gradient-to-tr from-pink-500 to-primary text-white shadow hover:scale-105 transition-transform"
              >
                Enquire About Tours
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TravelAndTours;
