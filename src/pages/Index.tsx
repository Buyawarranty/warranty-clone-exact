import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BuyawarrantyHomepage from '@/components/BuyawarrantyHomepage';
import MileageAndPricingStep from '@/components/MileageAndPricingStep';
import CarJourneyProgress from '@/components/CarJourneyProgress';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import CustomerDetailsStep from '@/components/CustomerDetailsStep';
import VehicleCheckoutStep from '@/components/VehicleCheckoutStep';
import NewsletterPopupTrigger from '@/components/NewsletterPopupTrigger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface VehicleData {
  regNumber: string;
  mileage: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
  isManualEntry?: boolean;
}

const Index = () => {
  console.log('Index component rendering...');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state variables first
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, paymentType: string, name?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}} | null>(null);
  const [formData, setFormData] = useState({
    regNumber: '',
    mileage: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    make: '',
    model: '',
    fuelType: '',
    transmission: '',
    year: '',
    vehicleType: ''
  });
  
  // Get current step from URL or default to 1
  const getStepFromUrl = () => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = parseFloat(stepParam);
      // Handle old step 1.5 by redirecting to step 1
      if (step === 1.5) {
        return 1;
      }
      return step >= 1 && step <= 3 && Number.isInteger(step) ? step : 1;
    }
    return 1;
  };
  
  const [currentStep, setCurrentStep] = useState(getStepFromUrl());
  
  // Save state to localStorage
  const saveStateToLocalStorage = (step?: number) => {
    const state = {
      step: step || currentStep,
      vehicleData,
      selectedPlan,
      formData
    };
    localStorage.setItem('warrantyJourneyState', JSON.stringify(state));
  };
  
  // Load state from localStorage
  const loadStateFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem('warrantyJourneyState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return null;
  };
  
  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', step.toString());
    setSearchParams(newSearchParams, { replace: true });
  };
  
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
    // Store current state in localStorage for persistence
    saveStateToLocalStorage(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const stepFromUrl = getStepFromUrl();
      setCurrentStep(stepFromUrl);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Load saved state on initial load
    const savedState = loadStateFromLocalStorage();
    const stepFromUrl = getStepFromUrl();
    
    // If we're at step 1.5 (old mileage step), redirect to step 1
    if (searchParams.get('step') === '1.5') {
      setCurrentStep(1);
      updateStepInUrl(1);
      return;
    }

    // Check for quote parameter from email links
    const quoteParam = searchParams.get('quote');
    const emailParam = searchParams.get('email');
    
    if (quoteParam && emailParam) {
      // User is returning from a quote email - fetch the stored quote data
      const fetchQuoteData = async () => {
        try {
          const { data, error } = await supabase
            .from('quote_data')
            .select('*')
            .eq('quote_id', quoteParam)
            .eq('customer_email', emailParam)
            .single();

          if (error || !data) {
            console.error('Quote not found or expired:', error);
            // Show error message and redirect to step 1
            setCurrentStep(1);
            updateStepInUrl(1);
            return;
          }

          // Restore the vehicle data from the stored quote
          const vehicleDataJson = data.vehicle_data as any;
          const restoredVehicleData = {
            regNumber: vehicleDataJson.regNumber || '',
            mileage: vehicleDataJson.mileage || '',
            email: emailParam,
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            make: vehicleDataJson.make || '',
            model: vehicleDataJson.model || '',
            year: vehicleDataJson.year || '',
            vehicleType: vehicleDataJson.vehicleType || 'car',
            fuelType: vehicleDataJson.fuelType || '',
            transmission: vehicleDataJson.transmission || ''
          };
          
          setVehicleData(restoredVehicleData);
          setFormData(prev => ({ ...prev, ...restoredVehicleData }));
          setCurrentStep(2); // Go to step 2 (mileage + pricing)
          updateStepInUrl(2);
          
          console.log('Quote data restored successfully:', restoredVehicleData);
        } catch (error) {
          console.error('Error fetching quote data:', error);
          setCurrentStep(1);
          updateStepInUrl(1);
        }
      };

      fetchQuoteData();
      return;
    }
    
    // Check for restore parameter from email links
    const restoreParam = searchParams.get('restore');
    
    if (restoreParam) {
      try {
        const restoredData = JSON.parse(atob(restoreParam));
        setVehicleData(restoredData);
        setFormData(prev => ({ ...prev, ...restoredData }));
        if (restoredData.selectedPlan) {
          setSelectedPlan(restoredData.selectedPlan);
        }
        const restoredStep = restoredData.step || 2;
        setCurrentStep(restoredStep);
        updateStepInUrl(restoredStep);
        
        // Clear the restore parameter but keep step
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('step', restoredStep.toString());
        setSearchParams(newSearchParams, { replace: true });
      } catch (error) {
        console.error('Error restoring data from URL:', error);
      }
    } else if (savedState && stepFromUrl > 1) {
      // Restore from localStorage if we're not on step 1
      setVehicleData(savedState.vehicleData);
      setSelectedPlan(savedState.selectedPlan);
      setFormData(prev => savedState.formData || prev);
    } else if (stepFromUrl === 1) {
      // Clear localStorage if we're starting fresh
      localStorage.removeItem('warrantyJourneyState');
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const steps = ['Enter Registration', 'Get Quote & Pricing', 'Checkout'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setFormData({ ...formData, ...data });
    // Always go to step 2 (mileage + pricing)
    setCurrentStep(2);
    updateStepInUrl(2);
    saveStateToLocalStorage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
    saveStateToLocalStorage(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormDataUpdate = (data: Partial<VehicleData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleQuoteDeliveryComplete = (contactData: { email: string; phone: string; firstName: string; lastName: string }) => {
    const updatedData = { ...vehicleData, ...contactData };
    setVehicleData(updatedData as VehicleData);
    setFormData({ ...formData, ...contactData });
    setCurrentStep(3);
    updateStepInUrl(3);
    saveStateToLocalStorage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track pricing page view for abandoned cart emails
    trackAbandonedCart(updatedData as VehicleData, 3);
  };

  const handlePlanSelected = (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => {
    setSelectedPlan({ id: planId, paymentType, name: planName, pricingData });
    setCurrentStep(3);
    updateStepInUrl(3);
    saveStateToLocalStorage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track plan selection for abandoned cart emails
    if (vehicleData) {
      trackAbandonedCart(vehicleData, 3, planName, paymentType);
    }
  };

  const handleCustomerDetailsComplete = (customerData: any) => {
    // This will be handled by the CustomerDetailsStep component itself
    console.log('Customer details completed:', customerData);
  };

  // Function to track abandoned cart events
  const trackAbandonedCart = async (data: VehicleData, step: number, planName?: string, paymentType?: string) => {
    try {
      await supabase.functions.invoke('track-abandoned-cart', {
        body: {
          full_name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
          email: data.email,
          phone: data.phone,
          vehicle_reg: data.regNumber,
          vehicle_make: data.make,
          vehicle_model: data.model,
          vehicle_year: data.year,
          vehicle_type: data.vehicleType, // Include vehicle type for special vehicles
          mileage: data.mileage,
          plan_name: planName,
          payment_type: paymentType,
          step_abandoned: step
        }
      });
    } catch (error) {
      console.error('Error tracking abandoned cart:', error);
      // Don't throw error to avoid disrupting user flow
    }
  };

  // Check if vehicle is a special type
  const isSpecialVehicle = vehicleData?.vehicleType && ['EV', 'PHEV', 'MOTORBIKE'].includes(vehicleData.vehicleType);

  console.log('Rendering Index with currentStep:', currentStep);
  
  return (
    <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
     
      {currentStep === 1 && (
        <>
          <BuyawarrantyHomepage onRegistrationComplete={handleRegistrationComplete} />
          
          {/* What Do We Cover Section */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      What Do We <span className="text-orange-500">Cover?</span>
                    </h2>
                    <p className="text-lg text-gray-700">Our warranty includes:</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 text-xl mt-1">✓</span>
                        <div>
                          <span className="font-semibold text-gray-900">Mechanical & Electrical Components:</span>
                          <span className="text-gray-700"> Engine, gearbox, clutch, turbo, drivetrain, suspension, steering, braking systems, fuel, cooling, emissions systems, ECUs, sensors, driver assistance tech, air conditioning, airbags, multimedia systems.</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 text-xl mt-1">✓</span>
                        <div>
                          <span className="font-semibold text-gray-900">Diagnostics & Fault-Finding:</span>
                          <span className="text-gray-700"> Comprehensive diagnostic coverage.</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 text-xl mt-1">✓</span>
                        <div>
                          <span className="font-semibold text-gray-900">Consequential Damage:</span>
                          <span className="text-gray-700"> Protection against related damages.</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 text-xl mt-1">✓</span>
                        <div>
                          <span className="font-semibold text-gray-900">Labour Costs:</span>
                          <span className="text-gray-700"> Labour costs covered.</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 text-xl mt-1">✓</span>
                        <div>
                          <span className="font-semibold text-gray-900">Claim Limits:</span>
                          <span className="text-gray-700"> £2,000 or £5,000 per claim.</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Protect Your Vehicle <span className="text-orange-500">Today!</span>
                      </h3>
                      <p className="text-gray-700">
                        Whether you drive a car, van, or motorbike Buy-a-Warranty offers the protection you need. 
                        Get covered in 1 minute and enjoy peace of mind on the road.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Content - Warranty Panda Image - Hidden on mobile, moved above */}
                <div className="relative hidden md:block">
                  <img 
                    src="/lovable-uploads/e1385dd8-13fc-40eb-8f98-7517b4903e8f.png" 
                    alt="Warranty Protection - Panda mascot with electric car and warranty active badge"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {currentStep === 2 && vehicleData && (
        <QuoteDeliveryStep 
          onBack={() => handleBackToStep(1)}
          onViewQuote={() => handleStepChange(3)}
          onEmailQuote={() => handleStepChange(3)}
          showProgress={true}
          currentStep={2}
        />
      )}

      {currentStep === 2.5 && vehicleData && (
        <div className="w-full overflow-x-hidden">
          {/* Progress bar positioned at top */}
          <div className="bg-[#e8f4fb]">
            <CarJourneyProgress currentStep={2} onStepChange={handleStepChange} />
          </div>
          <MileageAndPricingStep 
            vehicleData={vehicleData}
            onBack={() => handleBackToStep(2)} 
            onPlanSelected={handlePlanSelected}
          />
        </div>
      )}

      {currentStep === 3 && vehicleData && (
        <VehicleCheckoutStep
          vehicleData={vehicleData}
          onBack={() => handleBackToStep(2)}
          onStripePayment={async (amount) => {
            console.log('Stripe payment initiated', { amount, vehicleData, formData });
            try {
              const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
                body: {
                  planId: 'c708e514-d494-4935-827d-96567a078bd9', // Platinum plan ID
                  vehicleData,
                  paymentType: 'yearly',
                  voluntaryExcess: 0,
                  finalAmount: amount,
                  customerData: {
                    first_name: formData.firstName || vehicleData.firstName || 'Guest',
                    last_name: formData.lastName || vehicleData.lastName || 'Customer',
                    email: formData.email || vehicleData.email || 'guest@buyawarranty.co.uk',
                    phone: formData.phone || vehicleData.phone || '',
                    mobile: formData.phone || vehicleData.phone || '',
                    vehicle_reg: vehicleData.regNumber || ''
                  }
                }
              });
              
              if (error) {
                console.error('Stripe checkout error:', error);
                toast.error('Failed to create checkout session');
                return;
              }
              
              if (data?.url) {
                window.location.href = data.url;
              } else {
                console.error('No checkout URL received');
                toast.error('Failed to redirect to checkout');
              }
            } catch (error) {
              toast.error('Failed to create Stripe checkout');
              console.error('Stripe checkout error:', error);
            }
          }}
          onBumperPayment={async () => {
            console.log('Bumper payment initiated', { vehicleData, formData });
            try {
              const { data, error } = await supabase.functions.invoke('create-bumper-checkout', {
                body: {
                  planId: 'c708e514-d494-4935-827d-96567a078bd9', // Platinum plan ID
                  vehicleData,
                  paymentType: 'monthly',
                  voluntaryExcess: 0,
                  customerData: {
                    email: formData.email || vehicleData.email || 'guest@buyawarranty.co.uk',
                    first_name: formData.firstName || vehicleData.firstName || 'Guest',
                    last_name: formData.lastName || vehicleData.lastName || 'Customer',
                    mobile: formData.phone || vehicleData.phone || '',
                    vehicle_reg: vehicleData.regNumber || '',
                    street: formData.address || vehicleData.address || '',
                    town: '',
                    county: '',
                    postcode: '',
                    country: 'UK'
                  }
                }
              });
              
              if (error) {
                console.error('Bumper checkout error:', error);
                toast.error('Failed to create Bumper checkout');
                return;
              }
              
              if (data?.url) {
                window.location.href = data.url;
              } else if (data?.stripeUrl) {
                // Fallback to Stripe if Bumper is not available
                window.location.href = data.stripeUrl;
              } else {
                console.error('No checkout URL received');
                toast.error('Failed to redirect to checkout');
              }
            } catch (error) {
              toast.error('Failed to create Bumper checkout');
              console.error('Bumper checkout error:', error);
            }
          }}
        />
      )}

      {currentStep === 4 && (
        <>
          {vehicleData && selectedPlan ? (
            <>
              {/* Progress bar positioned at top */}
              <div className="bg-[#e8f4fb]">
                <CarJourneyProgress currentStep={3} onStepChange={handleStepChange} />
              </div>
              <CustomerDetailsStep
                vehicleData={vehicleData}
                planId={selectedPlan.id}
                paymentType={selectedPlan.paymentType}
                planName={selectedPlan.name}
                pricingData={selectedPlan.pricingData}
                onNext={handleCustomerDetailsComplete}
                onBack={() => handleBackToStep(2)}
              />
            </>
          ) : (
            <div className="w-full px-4 py-8">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Oops! We've lost your order details
                </h2>
                <p className="text-gray-600">
                  It looks like your session has expired or you've navigated back from a payment page. 
                  Please start your warranty journey again to continue.
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => handleStepChange(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Start Over
                  </Button>
                  <p className="text-sm text-gray-500">
                    If you've already completed a payment, please check your email for confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Newsletter Popup - Only shows on homepage */}
      {currentStep === 1 && <NewsletterPopupTrigger />}
    </div>
  );
};

export default Index;
