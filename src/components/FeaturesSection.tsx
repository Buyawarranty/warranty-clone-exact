import { Card } from "@/components/ui/card";
import { Shield, Clock, Phone, Award, CheckCircle, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Comprehensive Coverage",
    description: "Protection against mechanical and electrical failures with extensive coverage options."
  },
  {
    icon: Clock,
    title: "Instant Quotes",
    description: "Get multiple warranty quotes in under 30 seconds from top UK providers."
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Round-the-clock customer support and roadside assistance when you need it most."
  },
  {
    icon: Award,
    title: "FCA Regulated",
    description: "All our warranty providers are fully regulated by the Financial Conduct Authority."
  },
  {
    icon: CheckCircle,
    title: "No Hidden Fees",
    description: "Transparent pricing with no hidden costs or surprise charges on your warranty."
  },
  {
    icon: Star,
    title: "Trusted Reviews",
    description: "Over 50,000 satisfied customers with an average rating of 4.8 out of 5 stars."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Why Choose Buy A Warranty?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We make finding the right car warranty simple, fast, and transparent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-card transition-all duration-300 group bg-gradient-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;