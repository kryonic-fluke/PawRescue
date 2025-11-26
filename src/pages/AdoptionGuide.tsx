import { useState } from "react";
import { BookOpen, ChevronRight, FileText, Home, ClipboardCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Guide {
  id: number;
  title: string;
  content: string;
  category: string;
  orderIndex: number;
  createdAt: string;
}

const categoryIcons: Record<string, any> = {
  procedure: FileText,
  requirements: ClipboardCheck,
  documentation: BookOpen,
  "post-adoption": Heart,
};

const categoryLabels: Record<string, string> = {
  procedure: "Adoption Procedure",
  requirements: "Requirements",
  documentation: "Documentation",
  "post-adoption": "Post-Adoption Care",
};

const AdoptionGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("procedure");

  const guides = [
    {
      id: 1,
      title: "Before You Adopt",
      content: "Research different pet breeds and their needs. Ensure your living situation is pet-friendly. Check if your family is ready for a pet. Calculate the financial commitment (food, vet bills, etc.)",
      category: "procedure",
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "The Adoption Process",
      content: "Visit local shelters or browse online listings. Meet the pet in person if possible. Complete the adoption application. Undergo a home check if required. Pay the adoption fee and complete paperwork.",
      category: "procedure",
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Bringing Your Pet Home",
      content: "Pet-proof your home. Prepare essential supplies (food, bed, toys, etc.). Set up a vet appointment for a check-up. Introduce your pet to their new home gradually. Establish a routine for feeding, walks, and playtime.",
      category: "post-adoption",
      orderIndex: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "Post-Adoption Care",
      content: "Schedule regular vet check-ups. Keep up with vaccinations and preventatives. Provide proper nutrition and exercise. Socialize your pet with other animals and people. Be patient during the adjustment period.",
      category: "post-adoption",
      orderIndex: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      title: "Adoption Requirements in India",
      content: "Valid government-issued ID proof. Proof of address. Consent from all adult family members. Home visit may be required by some shelters. Adoption fees vary by organization.",
      category: "requirements",
      orderIndex: 1,
      createdAt: new Date().toISOString()
    }
  ];

  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(guides[0]);

  const guidesByCategory = guides.reduce((acc, guide) => {
    if (!acc[guide.category]) acc[guide.category] = [];
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, Guide[]>);

  // Sort guides within each category by orderIndex
  Object.keys(guidesByCategory).forEach((category) => {
    guidesByCategory[category].sort((a, b) => a.orderIndex - b.orderIndex);
  });

  const categories = ["procedure", "requirements", "documentation", "post-adoption"];

  const faqs = [
    {
      question: "What is the adoption fee for?",
      answer: "The adoption fee typically covers vaccinations, spaying/neutering, deworming, and other medical expenses."
    },
    {
      question: "Can I return the pet if it doesn't work out?",
      answer: "Most shelters have a return policy. It's important to discuss this with the shelter before adopting."
    },
    {
      question: "How long does the adoption process take?",
      answer: "It can take anywhere from a few hours to a few days, depending on the shelter's process and requirements."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Pet Adoption Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Comprehensive information and resources to help you through every step of the pet adoption process in India.
            From initial application to lifelong care, we've got you covered.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category];
                    const count = guidesByCategory[category]?.length || 0;
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          const firstInCategory = guidesByCategory[category]?.[0];
                          if (firstInCategory) setSelectedGuide(firstInCategory);
                        }}
                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted ${
                          selectedCategory === category ? "bg-muted border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{categoryLabels[category]}</p>
                          <p className="text-xs text-muted-foreground">{count} guides</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-primary">{guides.length}</p>
                  <p className="text-sm text-muted-foreground">Total Guides</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Guide List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{categoryLabels[selectedCategory]}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                      {guidesByCategory[selectedCategory]?.length > 0 ? (
                        <div className="space-y-1">
                          {guidesByCategory[selectedCategory].map((guide) => (
                            <button
                              key={guide.id}
                              onClick={() => setSelectedGuide(guide)}
                              className={`w-full text-left p-4 transition-colors hover:bg-muted ${
                                selectedGuide?.id === guide.id ? "bg-muted border-l-4 border-l-primary" : ""
                              }`}
                            >
                              <h3 className="font-medium mb-1">{guide.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {guide.content.substring(0, 100)}...
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No guides in this category</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Guide Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    {selectedGuide && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{categoryLabels[selectedGuide.category]}</Badge>
                        </div>
                        <CardTitle className="text-2xl">{selectedGuide.title}</CardTitle>
                      </>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      {selectedGuide ? (
                        <div className="prose prose-sm max-w-none">
                          {selectedGuide.content.split(". ").map((sentence, idx) => (
                            <p key={idx} className="mb-4 text-foreground leading-relaxed">
                              {sentence.trim()}
                              {!sentence.endsWith('.') && '.'}
                            </p>
                          ))}
                          
                          {/* FAQ Section for Requirements */}
                          {selectedGuide.category === "requirements" && (
                            <div className="mt-8 pt-6 border-t">
                              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                              <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                  <Card key={index} className="p-4">
                                    <h4 className="font-medium text-base mb-2">{faq.question}</h4>
                                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                          <p className="text-lg font-medium">Select a guide to read</p>
                          <p className="text-sm mt-2">Choose from the list to view detailed information</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Ready to Adopt?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Now that you've learned about the adoption process, browse our available pets and find your perfect companion!
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/adopt">View Available Pets</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdoptionGuide;