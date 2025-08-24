import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Star, Users, Award, ArrowRight } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    postcode: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetQuote = () => {
    console.log("Getting quote for:", formData);
    // Quote generation logic would go here
  };

  return (
    <section className="relative bg-gradient-hero min-h-[600px] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <div className="flex items-center space-x-2 text-primary-glow">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">UK's Leading Warranty Provider</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Vehicle Warranty
              <span className="block text-primary-glow">Made Simple</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-lg">
              Get instant quotes from top UK warranty providers. Compare prices, coverage levels, and find the perfect protection for your vehicle.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-primary-glow" />
                </div>
                <div className="text-2xl font-bold">50k+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-primary-glow" />
                </div>
                <div className="text-2xl font-bold">4.8/5</div>
                <div className="text-sm text-white/80">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-primary-glow" />
                </div>
                <div className="text-2xl font-bold">FCA</div>
                <div className="text-sm text-white/80">Regulated</div>
              </div>
            </div>
          </div>

          {/* Right - Quote Form */}
          <Card className="p-8 shadow-warranty bg-card">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-card-foreground">Get Your Instant Quote</h2>
                <p className="text-muted-foreground">Compare warranties in under 30 seconds</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">Make</label>
                    <Select onValueChange={(value) => handleInputChange("make", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="ford">Ford</SelectItem>
                        <SelectItem value="mercedes">Mercedes</SelectItem>
                        <SelectItem value="volkswagen">Volkswagen</SelectItem>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="nissan">Nissan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">Year</label>
                    <Select onValueChange={(value) => handleInputChange("year", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Model</label>
                  <Input
                    placeholder="Enter your car model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Mileage</label>
                  <Input
                    placeholder="Enter current mileage"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Postcode</label>
                  <Input
                    placeholder="Enter your postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleGetQuote}
                  className="w-full h-12 text-lg shadow-button"
                  size="lg"
                >
                  Get My Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No obligation. Instant results. 100% free comparison.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;