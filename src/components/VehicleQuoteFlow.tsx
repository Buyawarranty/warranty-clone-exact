import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Car, Gauge, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VehicleData {
  registration: string;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  transmission: string;
}

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  two_yearly_price: number;
  three_yearly_price: number;
  coverage: any;
  is_active: boolean;
}

const VehicleQuoteFlow = () => {
  const [step, setStep] = useState(1);
  const [registration, setRegistration] = useState("");
  const [mileage, setMileage] = useState("");
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegLookup = async () => {
    if (!registration.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid registration number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Mock vehicle data lookup - in real implementation, this would call DVLA API
    const mockVehicleData: VehicleData = {
      registration: registration.toUpperCase(),
      make: "BMW",
      model: "3 Series",
      year: "2020",
      fuelType: "Petrol",
      transmission: "Manual"
    };

    setVehicleData(mockVehicleData);
    setStep(2);
    setLoading(false);
  };

  const handleGetPrices = async () => {
    if (!mileage.trim()) {
      toast({
        title: "Error",
        description: "Please enter your vehicle's mileage",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      setPlans(data || []);
      setStep(3);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load warranty plans. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleSelectPlan = (plan: Plan) => {
    toast({
      title: "Plan Selected",
      description: `You've selected the ${plan.name} plan. Proceeding to checkout...`,
    });
    // Here you would typically redirect to a checkout page or continue the flow
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>

          {step === 1 && (
            <Card className="p-8 shadow-warranty">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Enter Your Registration</h2>
                <p className="text-muted-foreground">
                  We'll automatically find your vehicle details
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g. AB12 CDE"
                      value={registration}
                      onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                      className="text-center text-xl font-mono"
                      maxLength={8}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleRegLookup}
                    disabled={loading}
                    className="w-full h-12 text-lg shadow-button"
                    size="lg"
                  >
                    {loading ? "Looking up..." : "Find My Vehicle"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && vehicleData && (
            <Card className="p-8 shadow-warranty">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Vehicle Found!</h2>
                  <p className="text-muted-foreground">Please confirm your details and add mileage</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registration</label>
                      <p className="text-lg font-mono">{vehicleData.registration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year</label>
                      <p className="text-lg">{vehicleData.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Make</label>
                      <p className="text-lg">{vehicleData.make}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Model</label>
                      <p className="text-lg">{vehicleData.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fuel Type</label>
                      <p className="text-lg">{vehicleData.fuelType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Transmission</label>
                      <p className="text-lg">{vehicleData.transmission}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Gauge className="h-4 w-4 mr-2" />
                    Current Mileage
                  </label>
                  <Input
                    placeholder="e.g. 25000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))}
                    type="number"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleGetPrices}
                    disabled={loading}
                    className="flex-1 shadow-button"
                  >
                    {loading ? "Loading..." : "Get Prices"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">Select the warranty plan that's right for you</p>
              </div>

              <div className="grid gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="space-y-1">
                          {plan.coverage && Array.isArray(plan.coverage) && plan.coverage.map((item: string, index: number) => (
                            <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          £{plan.monthly_price}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          or £{plan.yearly_price}/year
                        </div>
                        <Button 
                          onClick={() => handleSelectPlan(plan)}
                          className="mt-4 shadow-button"
                        >
                          Select Plan
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicle Details
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VehicleQuoteFlow;