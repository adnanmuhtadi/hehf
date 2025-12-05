// src/pages/SummerSchools.tsx
import { Calendar, Home, BookOpen, Users, Globe, Sparkles, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageLayout from "@/layouts/PageLayout";
import Hero from "@/components/Hero";
import QuickEnquiry from "@/components/QuickEnquiry";
import { Card, CardContent } from "@/components/ui/card";

// Hero image for the page
const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1661290835495-9d1a6144c19c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const benefits = [
  {
    icon: Home,
    title: "Safe Home Environment",
    description: "A safe, welcoming UK home environment where students feel comfortable and cared for"
  },
  {
    icon: BookOpen,
    title: "English Development",
    description: "Immersive English language development through daily interaction and structured lessons"
  },
  {
    icon: Calendar,
    title: "Diverse Activities",
    description: "A diverse programme of daily activities including sports, workshops, and cultural experiences"
  },
  {
    icon: Globe,
    title: "British Culture",
    description: "Opportunities to explore British culture, traditions, and local attractions"
  },
  {
    icon: Sparkles,
    title: "Memorable Experience",
    description: "A memorable and enriching summer experience that students will cherish forever"
  }
];

const programmeFeatures = [
  "Engaging English lessons tailored to all levels",
  "Wide range of sporting activities",
  "Creative workshops and arts programmes",
  "Cultural excursions and experiences",
  "Team-building activities",
  "Evening social events"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const SummerSchools = () => (
  <PageLayout
    title="Summer Schools Programme | Herts & Essex Host Families"
    description="Join our Summer Schools Programme – Immersive English language and cultural programmes for international students across Hertfordshire & Essex from late June to late August."
    className="flex flex-col"
  >
    {/* HERO SECTION */}
    <Hero
      bgImage={HERO_IMAGE}
      heading="Make This Summer Unforgettable!"
      subheading="Our homes are open throughout the summer period—from late June to late August—providing an ideal setting for international students to experience a fully immersive UK summer school programme."
      buttonText={
        <>
          <Calendar className="mr-2 h-5 w-5 inline" aria-hidden="true" />
          Get in Touch
        </>
      }
      buttonHref="#contact-form"
    />

    {/* INTRO SECTION */}
    <section className="py-16 bg-background" aria-label="Summer Programme Overview">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            A Structured Blend of Learning & Enrichment
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We deliver a structured blend of learning and enrichment, including engaging English lessons, 
            a wide range of sporting activities, creative workshops, cultural experiences, and much more. 
            Each programme is carefully designed to offer students a balance of education, personal development, 
            and enjoyable activities.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">5 days to 3 weeks</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Small & large groups</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Late June - Late August</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* BENEFITS SECTION */}
    <section className="py-16 bg-muted" aria-label="Student Benefits">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Your Students Will Benefit From
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We aim to provide a seamless, high-quality summer programme that helps students grow, 
            connect, and make the most of their time in the UK.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>

    {/* PROGRAMME FEATURES SECTION */}
    <section className="py-16 bg-background" aria-label="Programme Features">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              What Our Programmes Include
            </h2>
            <p className="text-muted-foreground mb-8">
              Programmes can run from as little as 5 days up to 3 weeks, depending on your requirements. 
              We cater for both small and large groups, ensuring each cohort receives a tailored schedule 
              that suits their needs, age range, and goals.
            </p>
            <ul className="space-y-4">
              {programmeFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/images/summer-activity.jpg"
                alt="Students enjoying summer programme activities"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* CONTACT FORM SECTION */}
    <section id="contact-form">
      <QuickEnquiry
        title="Interested in Our Summer Programme?"
        description="If you'd like to discuss this with us, please use the contact form below."
        bgClassName="bg-primary text-primary-foreground"
      />
    </section>
  </PageLayout>
);

export default SummerSchools;