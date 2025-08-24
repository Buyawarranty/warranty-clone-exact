import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Manchester",
    avatar: "SJ",
    rating: 5,
    text: "Excellent service! Got my warranty claim processed within 24 hours. The repair garage was professional and the whole experience was hassle-free.",
    verified: true
  },
  {
    name: "Michael Chen",
    location: "London",
    avatar: "MC", 
    rating: 5,
    text: "Best decision I made was getting a warranty through Buy A Warranty. Saved me £2,400 when my gearbox failed. Highly recommend!",
    verified: true
  },
  {
    name: "Emma Thompson",
    location: "Birmingham",
    avatar: "ET",
    rating: 5,
    text: "The quote comparison was so easy and saved me time and money. Customer service team was brilliant when I had questions.",
    verified: true
  },
  {
    name: "David Williams",
    location: "Bristol",
    avatar: "DW",
    rating: 5,
    text: "Had to claim for electrical issues on my BMW. Process was smooth and repair quality was excellent. No complaints at all.",
    verified: true
  },
  {
    name: "Lisa Roberts",
    location: "Leeds",
    avatar: "LR",
    rating: 5,
    text: "Great value for money. The peace of mind knowing my car is protected is worth every penny. Would definitely recommend to friends.",
    verified: true
  },
  {
    name: "James Anderson",
    location: "Glasgow",
    avatar: "JA",
    rating: 5,
    text: "Professional service from start to finish. When my engine developed a fault, everything was handled quickly and efficiently.",
    verified: true
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from thousands of satisfied customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-card hover:shadow-card transition-all duration-300 relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground italic">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-card-foreground text-sm">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <div className="bg-success text-success-foreground text-xs px-2 py-0.5 rounded-full">
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Overall Stats */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-6 bg-gradient-card">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">4.8/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Would Recommend</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;