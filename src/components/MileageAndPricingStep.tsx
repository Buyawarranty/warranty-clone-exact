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
            <div className="mb-8">
              <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Need time to decide?</h3>
                  <p className="text-sm text-gray-600">We'll email your quote for later</p>
                </div>
                <button
                  onClick={handleSendQuote}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200"
                >
                  Email Quote
                </button>
              </div>
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
              <div className="text-center mb-12">
                <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Voluntary Excess</h3>
                  <p className="text-gray-600 mb-6">Lower excess = higher monthly cost, but less to pay if you claim</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[0, 50, 100, 150, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setVoluntaryExcess(amount)}
                        className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          voluntaryExcess === amount
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="relative z-10">£{amount}</span>
                        {voluntaryExcess === amount && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-xl blur-lg" />
                        )}
                        {amount === 50 && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            ★
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    💡 Most customers choose £50 excess for the best balance
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => {
                  const basePrice = calculatePlanPrice(plan);
                  const addOnPrice = calculateAddOnPrice(plan.id);
                  const monthlyTotal = basePrice + addOnPrice;
                  const isPopular = index === 1;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`group relative transition-all duration-300 ${
                        isPopular ? 'transform scale-105' : 'hover:scale-105'
                      }`}
                    >
                      {/* Background glow effect */}
                      <div className={`absolute inset-0 rounded-3xl blur-xl transition-all duration-300 ${
                        isPopular 
                          ? 'bg-gradient-to-r from-orange-400/30 to-red-400/30' 
                          : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100'
                      }`} />
                      
                      {/* Main card */}
                      <div className={`relative bg-white rounded-3xl shadow-xl border-2 overflow-hidden transition-all duration-300 ${
                        isPopular 
                          ? 'border-orange-400 shadow-orange-200/50' 
                          : 'border-gray-100 group-hover:border-blue-300 group-hover:shadow-blue-200/50'
                      }`}>
                        
                        {/* Popular badge */}
                        {isPopular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                              🔥 MOST POPULAR
                            </div>
                          </div>
                        )}
                        
                        {/* Header with gradient */}
                        <div className={`h-2 ${
                          isPopular 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`} />
                        
                        <div className="p-8">
                          {/* Plan name with icon */}
                          <div className="text-center mb-6">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                              isPopular 
                                ? 'bg-gradient-to-r from-orange-100 to-red-100' 
                                : 'bg-gradient-to-r from-blue-100 to-purple-100'
                            }`}>
                              <div className={`text-2xl font-bold ${
                                isPopular ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {plan.name === 'Basic' && '🛡️'}
                                {plan.name === 'Gold' && '⭐'}
                                {plan.name === 'Platinum' && '💎'}
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {plan.name}
                            </h3>
                            <p className={`text-sm font-medium ${
                              isPopular ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                              {plan.name === 'Basic' && 'Essential Protection'}
                              {plan.name === 'Gold' && 'Enhanced Coverage'}
                              {plan.name === 'Platinum' && 'Ultimate Protection'}
                            </p>
                          </div>
                          
                          {/* Pricing */}
                          <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-2">
                              <span className={`text-5xl font-bold ${
                                isPopular ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                £{monthlyTotal}
                              </span>
                              <span className="text-gray-600 ml-2 text-lg">/month</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-gray-500 line-through text-sm">
                                £{Math.round(monthlyTotal * 1.2)}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                Save {Math.round(((monthlyTotal * 1.2) - monthlyTotal) / (monthlyTotal * 1.2) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* CTA Button */}
                          <button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={loading[plan.id]}
                            className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                              isPopular
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-200'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-blue-200'
                            } ${loading[plan.id] ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            {loading[plan.id] ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span>Select {plan.name}</span>
                                <span className="text-xl">→</span>
                              </div>
                            )}
                          </button>
                          
                          {/* Trust indicators */}
                          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className="text-green-500">✓</span>
                              Instant Cover
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-green-500">✓</span>
                              UK Support
                            </div>
                          </div>
                        </div>
                        
                        {/* Features section */}
                        <div className="px-8 pb-8">
                          {/* Divider */}
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />
                          
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <span className={isPopular ? 'text-orange-500' : 'text-blue-500'}>✨</span>
                              What's included:
                            </h4>
                            <div className="space-y-3">
                              {plan.coverage.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/item">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200 ${
                                    isPopular 
                                      ? 'bg-orange-100 group-hover/item:bg-orange-200' 
                                      : 'bg-blue-100 group-hover/item:bg-blue-200'
                                  }`}>
                                    <Check className={`w-3 h-3 ${
                                      isPopular ? 'text-orange-600' : 'text-blue-600'
                                    }`} />
                                  </div>
                                  <span className="text-sm text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                                    {item}
                                  </span>
                                </div>
                              ))}
                              
                              {plan.coverage.length > 4 && (
                                <div className="flex items-center gap-3 pt-2">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    isPopular ? 'bg-orange-100' : 'bg-blue-100'
                                  }`}>
                                    <Plus className={`w-3 h-3 ${
                                      isPopular ? 'text-orange-600' : 'text-blue-600'
                                    }`} />
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    isPopular ? 'text-orange-600' : 'text-blue-600'
                                  }`}>
                                    +{plan.coverage.length - 4} more benefits
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Value proposition */}
                          <div className={`mt-6 p-4 rounded-2xl ${
                            isPopular 
                              ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' 
                              : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                          }`}>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${
                                isPopular ? 'text-orange-800' : 'text-blue-800'
                              }`}>
                                {plan.name === 'Basic' && '💡 Smart Choice'}
                                {plan.name === 'Gold' && '🎯 Best Value'}
                                {plan.name === 'Platinum' && '👑 Premium Experience'}
                              </div>
                              <p className={`text-sm ${
                                isPopular ? 'text-orange-700' : 'text-blue-700'
                              }`}>
                                {plan.name === 'Basic' && 'Perfect for essential protection'}
                                {plan.name === 'Gold' && 'Most customers choose this plan'}
                                {plan.name === 'Platinum' && 'Complete peace of mind'}
                              </p>
                            </div>
                          </div>
                        </div>
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