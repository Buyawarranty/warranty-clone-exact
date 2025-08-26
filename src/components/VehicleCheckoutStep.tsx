import React, { useState } from 'react';
import { Check, ArrowLeft, Car, Calendar, Gauge, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CarJourneyProgress from './CarJourneyProgress';

interface VehicleCheckoutStepProps {
  vehicleData: any;
  onBack?: () => void;
  onStripePayment?: (amount: number) => void;
  onBumperPayment?: () => void;
}

const VehicleCheckoutStep = ({ vehicleData, onBack, onStripePayment, onBumperPayment }: VehicleCheckoutStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState('1year');
  const [paymentType, setPaymentType] = useState('full');

  const plans = {
    '1year': { duration: '1 Year', price: 599, monthly: 49.92, savings: 0 },
    '2years': { duration: '2 Years', price: 899, monthly: 74.92, savings: 299 },
    '3years': { duration: '3 Years', price: 1249, monthly: 104.08, savings: 549 }
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 py-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-blue-600">buya</span>
            <span className="text-orange-500">warranty</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">What's Covered</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Make a Claim</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Contact Us</a>
          </nav>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-50">
        <CarJourneyProgress currentStep={3} />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Confirm Your Vehicle</h1>
          <p className="text-orange-100">Please verify these details are correct</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Vehicle Confirmation */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                1
              </div>
              <span className="font-medium">Based on your vehicle</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {vehicleData?.registrationNumber || 'EX65XNN'}
              </h2>
              <p className="text-gray-600 mb-1">
                {vehicleData?.make} {vehicleData?.model} • {vehicleData?.fuelType}
              </p>
              <p className="text-sm text-gray-500">{vehicleData?.year} • CONVERTIBLE</p>
            </div>

            {/* Vehicle Details Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Car className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Fuel Type</p>
                <p className="font-medium">{vehicleData?.fuelType || 'Combustion'}</p>
              </div>
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-medium">{vehicleData?.year || '2015'}</p>
              </div>
              <div className="text-center">
                <Gauge className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Mileage</p>
                <p className="font-medium">2,225 miles</p>
              </div>
              <div className="text-center">
                <Palette className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-medium">White</p>
              </div>
            </div>

            <div className="flex items-center justify-center text-green-600">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-medium">Eligible for warranty coverage</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                2
              </div>
              <span className="font-medium">Select your cover</span>
              <span className="ml-auto text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">What's Covered</span>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Petrol/Diesel Car Warranty</h3>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">Up to £££</span>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">No Obligations</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choose your warranty duration</p>

              {/* Plan Options */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <div 
                    key={key}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === key 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="text-center">
                      <h4 className="font-bold mb-1">{plan.duration}</h4>
                      <p className="text-xs text-gray-500 mb-2">Comprehensive</p>
                      <p className="text-2xl font-bold text-gray-900">£{plan.price}</p>
                      <p className="text-xs text-gray-500">£{plan.monthly}/month</p>
                      {plan.savings > 0 && (
                        <p className="text-xs text-green-600 mt-1">Save £{plan.savings}</p>
                      )}
                      <Button 
                        className={`w-full mt-3 ${
                          selectedPlan === key 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedPlan === key ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Cover */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Enhanced Cover <span className="text-sm font-normal text-blue-600">Optional</span></h4>
              <p className="text-sm text-gray-600">Increase your claim limit from £3,000 to £6,000</p>
              <p className="text-sm text-blue-600">+£0 total</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                3
              </div>
              <span className="font-medium">Choose how to pay</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Pay in Full */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  paymentType === 'full' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentType('full')}
              >
                <h4 className="font-bold mb-2">Pay in Full</h4>
                <p className="text-sm text-gray-600 mb-4">One-time payment with card</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total today</span>
                    <span className="font-bold text-green-600">£{currentPlan.price}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    Instant coverage activation
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    10% upfront discount applied
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    Secure payment via Stripe
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => onStripePayment?.(currentPlan.price)}
                >
                  Pay £{currentPlan.price} Now →
                </Button>
              </div>

              {/* Spread the Cost */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  paymentType === 'finance' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentType('finance')}
              >
                <h4 className="font-bold mb-2">Spread the Cost</h4>
                <p className="text-sm text-gray-600 mb-4">0% APR financing available</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly payment</span>
                    <span className="font-bold text-blue-600">£{currentPlan.monthly}</span>
                  </div>
                  <div className="text-xs text-gray-500">Over 12 months</div>
                </div>

                <div className="space-y-1 text-xs text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    0% APR on vehicle products
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    Flexible payment terms (3-12 months)
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-green-600" />
                    Instant decision
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={onBumperPayment}
                >
                  Apply for Finance →
                </Button>
              </div>
            </div>

            <div className="text-center mt-6">
              <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                ← Choose Different Vehicle
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleCheckoutStep;