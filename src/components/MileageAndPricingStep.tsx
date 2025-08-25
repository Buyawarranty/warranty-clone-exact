import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';

type VehicleType = 'car' | 'motorbike' | 'phev' | 'hybrid' | 'ev';

const normalizeVehicleType = (raw?: string): VehicleType => {
  const v = (raw ?? '').toLowerCase().trim();
  if (['car','saloon','hatchback','estate','suv'].includes(v)) return 'car';
  if (v.includes('motor') || v.includes('bike')) return 'motorbike';
  if (v === 'phev') return 'phev';
  if (v.includes('hybrid')) return 'hybrid';
  if (['ev','electric'].includes(v)) return 'ev';
  return 'car'; // safe default
};

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  two_monthly_price: number | null;
  three_monthly_price: number | null;
  coverage: string[];
  add_ons: string[];
  is_active: boolean;
  pricing_matrix?: any;
  vehicle_type?: string;
}

interface MileageAndPricingStepProps {
  vehicleData: {
    regNumber: string;
    mileage?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    vehicleType?: string;
    vehicleData?: any;
  };
  onBack: () => void;
  onPlanSelected?: (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => void;
}

const MileageAndPricingStep: React.FC<MileageAndPricingStepProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [mileage, setMileage] = useState(vehicleData.mileage || '');
  const [mileageError, setMileageError] = useState('');
  const [showPricing, setShowPricing] = useState(!!vehicleData.mileage);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});

  // Normalize vehicle type once
  const vt = useMemo(() => normalizeVehicleType(vehicleData?.vehicleType), [vehicleData?.vehicleType]);

  const MAX_MILEAGE = 200000;

  // Format mileage with commas
  const formatMileage = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numericValue = parseInt(value, 10);
    
    if (value === '' || (numericValue >= 0 && numericValue <= MAX_MILEAGE)) {
      setMileage(value);
      setMileageError('');
    } else if (numericValue > MAX_MILEAGE) {
      setMileageError(`Mileage cannot exceed ${MAX_MILEAGE.toLocaleString()} miles`);
    }
  };

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mileage) {
      setMileageError('Please enter your vehicle mileage');
      return;
    }
    
    const numericMileage = parseInt(mileage, 10);
    if (numericMileage > MAX_MILEAGE) {
      setMileageError(`Mileage cannot exceed ${MAX_MILEAGE.toLocaleString()} miles`);
      return;
    }
    
    setShowPricing(true);
    loadPlans();
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    setPlansError(null);
    
    try {
      const rows = await fetchPlansFor(vt);
      console.log(`🔍 Fetched ${rows.length} plans for ${vt}:`, rows);
      setPlans(rows);
    } catch (e: any) {
      console.error('💥 Error fetching plans:', e);
      setPlansError('Failed to load pricing plans. Please try again.');
      toast.error('Failed to load pricing plans');
    } finally {
      setPlansLoading(false);
    }
  };

  // Server-side filtering function
  async function fetchPlansFor(vt: VehicleType): Promise<Plan[]> {
    if (vt === 'car') {
      console.log('🚗 Fetching standard car plans: Basic, Gold, Platinum');
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .in('name', ['Basic', 'Gold', 'Platinum'])
        .order('monthly_price');
      
      if (error) {
        console.error('❌ Error fetching car plans:', error);
        throw error;
      }
      
      console.log('✅ Car plans fetched:', data?.length || 0);
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: Array.isArray(plan.add_ons) ? plan.add_ons.map(item => String(item)) : [],
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    } else {
      console.log(`🛵 Fetching special vehicle plans for: ${vt}`);
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .eq('is_active', true)
        .eq('vehicle_type', vt === 'ev' ? 'electric' : vt)
        .order('monthly_price');
      
      if (error) {
        console.error('❌ Error fetching special vehicle plans:', error);
        throw error;
      }
      
      console.log('✅ Special vehicle plans fetched:', data?.length || 0);
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: [], // Special vehicle plans don't have add-ons
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    }
  }

  useEffect(() => {
    if (showPricing) {
      loadPlans();
    }
  }, [showPricing, vt]);

  const handleSendQuote = async () => {
    // TODO: Implement send quote functionality
    toast.success('Quote will be sent to your email shortly');
  };

  const calculatePlanPrice = (plan: Plan) => {
    // Fallback pricing table
    const fallbackPricingTable = {
      yearly: {
        0: { basic: { monthly: 31 }, gold: { monthly: 34 }, platinum: { monthly: 36 } },
        50: { basic: { monthly: 29 }, gold: { monthly: 31 }, platinum: { monthly: 32 } },
        100: { basic: { monthly: 25 }, gold: { monthly: 27 }, platinum: { monthly: 29 } },
        150: { basic: { monthly: 23 }, gold: { monthly: 26 }, platinum: { monthly: 27 } },
        200: { basic: { monthly: 20 }, gold: { monthly: 23 }, platinum: { monthly: 25 } }
      }
    };
    
    const pricing = fallbackPricingTable.yearly[voluntaryExcess as keyof typeof fallbackPricingTable.yearly] || fallbackPricingTable.yearly[0];
    const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    return pricing[planType]?.monthly || 0;
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    return selectedAddOnCount * 2;
  };

  const toggleAddOn = (planId: string, addon: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [addon]: !prev[planId]?.[addon]
      }
    }));
  };

  const handleSelectPlan = async (plan: Plan) => {
    setLoading(prev => ({ ...prev, [plan.id]: true }));
    
    try {
      const basePrice = calculatePlanPrice(plan);
      const addOnPrice = calculateAddOnPrice(plan.id);
      const monthlyTotal = basePrice + addOnPrice;
      
      let totalPrice = monthlyTotal;
      if (paymentType === '12months') {
        totalPrice = monthlyTotal * 12;
      } else if (paymentType === '24months') {
        totalPrice = monthlyTotal * 24;
      } else if (paymentType === '36months') {
        totalPrice = monthlyTotal * 36;
      }
      
      const bumperMonthlyPrice = Math.round(monthlyTotal);
      
      const pricingData = {
        totalPrice,
        monthlyPrice: bumperMonthlyPrice,
        voluntaryExcess,
        selectedAddOns: selectedAddOns[plan.id] || {}
      };

      if (onPlanSelected) {
        onPlanSelected(plan.id, paymentType, plan.name, pricingData);
      }
    } catch (error) {
      console.error('Error in plan selection:', error);
      toast.error('An error occurred while processing your selection');
    } finally {
      setLoading(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  return (
    <div className="bg-[#e8f4fb] w-full min-h-screen">
      {/* Header with Back Button */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 sm:px-8">
        <div className="flex justify-start items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </Button>
        </div>
      </div>

      {/* Trustpilot Header */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-center">
        <TrustpilotHeader />
      </div>

      {!showPricing ? (
        // Mileage Entry Step
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Enter Your Mileage
            </h1>
            
            {/* Vehicle Details Display */}
            {vehicleData.vehicleData?.found && (
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Make:</span> {vehicleData.make}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {vehicleData.model}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {vehicleData.year}
                  </div>
                  <div>
                    <span className="font-medium">Fuel:</span> {vehicleData.fuelType}
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleGetQuote} className="space-y-6">
            <div>
              <Label htmlFor="mileage" className="text-lg font-semibold text-gray-900">
                Current Mileage
              </Label>
              <Input
                id="mileage"
                type="text"
                value={formatMileage(mileage)}
                onChange={handleMileageChange}
                placeholder="Enter mileage"
                className="mt-2 text-lg h-12"
                aria-describedby={mileageError ? "mileage-error" : undefined}
              />
              {mileageError && (
                <p id="mileage-error" className="mt-2 text-sm text-red-600">
                  {mileageError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
              disabled={!mileage || !!mileageError}
            >
              Get My Quote
            </Button>
          </form>
        </div>
      ) : (
        // Pricing Display Step
        <div className="w-full">
          {/* Header with Vehicle Details */}
          <div className="text-center mb-8 sm:mb-10 px-4 sm:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Your Warranty Quote
            </h1>
            
            {/* Vehicle Registration Display */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-[6px] shadow-sm leading-tight border-2 border-black">
                <img 
                  src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                  alt="GB Flag" 
                  className="w-[25px] h-[18px] sm:w-[30px] sm:h-[22px] md:w-[35px] md:h-[25px] mr-3 sm:mr-4 object-cover rounded-[2px]"
                />
                <div className="font-bold font-sans tracking-normal">
                  {vehicleData.regNumber || 'REG NUM'}
                </div>
              </div>
            </div>

            {/* Send Quote Button */}
            <div className="mb-6">
              <Button
                onClick={handleSendQuote}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Quote
              </Button>
            </div>
          </div>

          {/* Pricing Plans */}
          {plansLoading ? (
            <div className="text-center py-8">
              <p className="text-lg">Loading pricing plans...</p>
            </div>
          ) : plansError ? (
            <div className="text-center py-8">
              <p className="text-red-600">{plansError}</p>
              <Button onClick={loadPlans} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 pb-8">
              {/* Voluntary Excess Selection */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Voluntary Excess</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[0, 50, 100, 150, 200].map((amount) => (
                    <Button
                      key={amount}
                      variant={voluntaryExcess === amount ? "default" : "outline"}
                      onClick={() => setVoluntaryExcess(amount)}
                      className="min-w-[80px]"
                    >
                      £{amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan, index) => {
                  const basePrice = calculatePlanPrice(plan);
                  const addOnPrice = calculateAddOnPrice(plan.id);
                  const monthlyTotal = basePrice + addOnPrice;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                        index === 1 ? 'border-orange-500 scale-105' : 'border-gray-200'
                      } overflow-hidden`}
                    >
                      {index === 1 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-orange-500 text-white px-4 py-1 text-sm font-bold">
                            MOST POPULAR
                          </Badge>
                        </div>
                      )}
                      
                      <div className="p-6 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {plan.name}
                        </h3>
                        <div className="text-4xl font-bold text-orange-600 mb-2">
                          £{monthlyTotal}
                        </div>
                        <p className="text-gray-600 mb-6">per month</p>
                        
                        <Button
                          onClick={() => handleSelectPlan(plan)}
                          disabled={loading[plan.id]}
                          className={`w-full h-12 text-lg font-semibold ${
                            index === 1
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                        >
                          {loading[plan.id] ? 'Processing...' : 'Select Plan'}
                        </Button>
                      </div>
                      
                      <div className="px-6 pb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">What's covered:</h4>
                        <ul className="space-y-2">
                          {plan.coverage.slice(0, 5).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MileageAndPricingStep;