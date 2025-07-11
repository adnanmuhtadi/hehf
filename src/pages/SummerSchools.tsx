import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, BookOpen, Star, Clock } from "lucide-react";

const SummerSchools = () => {
  const programs = [
    {
      title: "Intensive English Plus",
      duration: "2-4 weeks",
      ages: "14-18 years",
      location: "Watford Campus",
      description: "Comprehensive English language program with cultural activities and weekend excursions to London landmarks.",
      features: ["25 hours/week English lessons", "Afternoon activities", "Weekend trips", "Certificate of completion"],
      price: "£850/week"
    },
    {
      title: "Academic Preparation",
      duration: "3-6 weeks", 
      ages: "16-19 years",
      location: "St Albans Centre",
      description: "Prepare for UK university entry with academic English, study skills, and IELTS preparation courses.",
      features: ["Academic writing skills", "Presentation training", "IELTS preparation", "University visit program"],
      price: "£950/week"
    },
    {
      title: "Cultural Immersion",
      duration: "1-3 weeks",
      ages: "12-17 years", 
      location: "Multiple locations",
      description: "Experience British culture through homestay living, local activities, and cultural workshops.",
      features: ["Cultural workshops", "Local family placement", "Heritage site visits", "Traditional activities"],
      price: "£750/week"
    }
  ];

  const activities = [
    { icon: <BookOpen className="h-6 w-6" />, title: "English Classes", description: "Professional teachers, small class sizes" },
    { icon: <MapPin className="h-6 w-6" />, title: "London Excursions", description: "Tower Bridge, Museums, West End shows" },
    { icon: <Users className="h-6 w-6" />, title: "Group Activities", description: "Sports, games, team building exercises" },
    { icon: <Star className="h-6 w-6" />, title: "Cultural Events", description: "British traditions, festivals, celebrations" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Summer Schools Programme</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Exceptional English language and cultural immersion programs with homestay accommodation
          </p>
          <Button size="lg" variant="secondary">
            <Calendar className="mr-2 h-5 w-5" />
            View 2024 Dates
          </Button>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Summer Programmes</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our range of carefully designed programs to suit different ages, interests, and learning objectives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary mb-2">{program.title}</CardTitle>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {program.ages}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {program.location}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{program.description}</p>
                  <ul className="space-y-2">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t">
                    <div className="text-2xl font-bold text-primary mb-3">{program.price}</div>
                    <Button className="w-full">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">What's Included</h2>
            <p className="text-xl text-muted-foreground">
              A comprehensive program designed to maximize learning and cultural experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="flex justify-center text-primary">{activity.icon}</div>
                  <h3 className="text-xl font-semibold">{activity.title}</h3>
                  <p className="text-muted-foreground">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Schedule */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-6">Sample Weekly Schedule</h2>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="text-center">
                    <h3 className="font-semibold text-primary mb-3">{day}</h3>
                    <div className="space-y-2 text-sm">
                      {index < 5 ? (
                        <>
                          <div className="bg-muted p-2 rounded">9:00-12:30<br/>English Classes</div>
                          <div className="bg-primary/10 p-2 rounded">14:00-17:00<br/>Activities</div>
                          <div className="bg-muted p-2 rounded">Evening<br/>Homestay</div>
                        </>
                      ) : index === 5 ? (
                        <>
                          <div className="bg-success/10 p-2 rounded">Full Day<br/>London Trip</div>
                        </>
                      ) : (
                        <>
                          <div className="bg-warning/10 p-2 rounded">Family Time<br/>& Rest Day</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SummerSchools;