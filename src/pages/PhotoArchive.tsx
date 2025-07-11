import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, MapPin, Users, Search, Filter } from "lucide-react";

const PhotoArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Photos", count: 156 },
    { id: "summer-schools", label: "Summer Schools", count: 45 },
    { id: "cultural-activities", label: "Cultural Activities", count: 38 },
    { id: "host-families", label: "Host Families", count: 28 },
    { id: "excursions", label: "Excursions", count: 25 },
    { id: "graduation", label: "Graduations", count: 20 }
  ];

  const photoGallery = [
    {
      id: 1,
      title: "Summer School Graduation 2023",
      category: "graduation",
      date: "August 2023",
      location: "Watford Campus",
      description: "Celebrating our summer school students' achievements",
      tags: ["graduation", "ceremony", "students"],
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "London Eye Excursion",
      category: "excursions",
      date: "July 2023",
      location: "London",
      description: "Students enjoying panoramic views of London",
      tags: ["london", "excursion", "sightseeing"],
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Host Family Welcome Dinner",
      category: "host-families",
      date: "June 2023",
      location: "St Albans",
      description: "New students meeting their host families",
      tags: ["welcome", "dinner", "families"],
      imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "English Class Activity",
      category: "summer-schools",
      date: "July 2023",
      location: "Elstree Campus",
      description: "Interactive learning session with international students",
      tags: ["classroom", "learning", "interaction"],
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Traditional British Tea Experience",
      category: "cultural-activities",
      date: "August 2023",
      location: "Cheshunt",
      description: "Students learning about British tea culture",
      tags: ["culture", "tea", "tradition"],
      imageUrl: "https://images.unsplash.com/photo-1542427886-030b2d8de4e3?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Windsor Castle Visit",
      category: "excursions",
      date: "July 2023",
      location: "Windsor",
      description: "Exploring British royal history and architecture",
      tags: ["castle", "history", "royal"],
      imageUrl: "https://images.unsplash.com/photo-1529655683826-3c6d0eeaa23d?w=400&h=300&fit=crop"
    },
    {
      id: 7,
      title: "Sports Day Activities",
      category: "cultural-activities",
      date: "August 2023",
      location: "Watford Sports Centre",
      description: "Students participating in traditional British sports",
      tags: ["sports", "activities", "fun"],
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
      id: 8,
      title: "Cooking Class with Host Families",
      category: "host-families",
      date: "June 2023",
      location: "Southgate",
      description: "Learning to prepare traditional British meals",
      tags: ["cooking", "food", "culture"],
      imageUrl: "https://images.unsplash.com/photo-1556909114-5f7b8ee10b7b?w=400&h=300&fit=crop"
    },
    {
      id: 9,
      title: "Cambridge University Tour",
      category: "excursions",
      date: "July 2023",
      location: "Cambridge",
      description: "Inspiring visit to one of the world's top universities",
      tags: ["university", "cambridge", "education"],
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    }
  ];

  const filteredPhotos = photoGallery.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Archive</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Capturing memories and moments from our host family experiences and summer school programs
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photos by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
              </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/90 text-foreground">
                      <Camera className="mr-1 h-3 w-3" />
                      {photo.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold">{photo.title}</h3>
                  <p className="text-muted-foreground text-sm">{photo.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {photo.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {photo.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {photo.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">156</div>
              <div className="text-muted-foreground">Total Photos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">28</div>
              <div className="text-muted-foreground">Host Families Featured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">45</div>
              <div className="text-muted-foreground">Summer School Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Happy Students</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhotoArchive;