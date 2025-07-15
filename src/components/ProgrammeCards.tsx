import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Users, BookOpen, Star } from "lucide-react";

const programmes = [
  {
    title: "Intensive English Plus",
    duration: "2-4 weeks",
    ages: "14-18 years",
    location: "Watford Campus",
    description: "Comprehensive English language programme with cultural activities and weekend excursions to London landmarks.",
    features: ["25 hours/week English lessons", "Afternoon activities", "Weekend trips", "Certificate of completion"],
    price: "£850/week"
  },
  // Add more as needed
];

const ProgrammeCards = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-6">Our Summer Programmes</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose from our range of carefully designed programmes to suit different ages, interests, and learning objectives
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programmes.map((program, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary mb-2">{program.title}</CardTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />{program.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />{program.ages}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />{program.location}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default ProgrammeCards;
