import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const warrantyPlans = [
  {
    name: "Basic Protection",
    price: "£19.99",
    period: "per month",
    coverage: "Essential",
    popular: false,
    features: [
      "Engine & Transmission",
      "Air Conditioning",
      "Electrical Systems",
      "12 Month Coverage",
      "UK Breakdown Cover",
      "No Age Limit"
    ],
    excluded: [
      "Wear & Tear Items",
      "Cosmetic Damage"
    ]
  },
  {
    name: "Complete Care",
    price: "£34.99",
    period: "per month",
    coverage: "Comprehensive",
    popular: true,
    features: [
      "All Basic Protection",
      "Turbo & Superchargers",
      "Fuel System",
      "Cooling System",
      "24 Month Coverage",
      "European Breakdown",
      "Courtesy Car Included"
    ],
    excluded: [
      "Pre-existing Conditions"
    ]
  },
  {
    name: "Ultimate Shield",
    price: "£54.99", 
    period: "per month",
    coverage: "Premium",
    popular: false,
    features: [
      "All Complete Care",
      "Body Electrical",
      "Multi-Media Systems",
      "36 Month Coverage",
      "Worldwide Breakdown",
      "Key & Lock Protection",
      "MOT Test Insurance"
    ],
    excluded: []
  }
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Choose Your Protection Level
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible warranty plans designed to fit your needs and budget.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {warrantyPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative p-8 ${plan.popular ? 'ring-2 ring-primary shadow-warranty' : 'shadow-card'} bg-gradient-card hover:shadow-warranty transition-all duration-300`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-card-foreground">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-primary">
                      {plan.price}
                      <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {plan.coverage} Coverage
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-card-foreground">What's Included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.excluded.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Excludes: {plan.excluded.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full ${plan.popular ? 'shadow-button' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get {plan.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need help choosing the right plan? Our experts are here to help.
          </p>
          <Button variant="outline" size="lg">
            Speak to an Expert
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;