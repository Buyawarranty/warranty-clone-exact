import React, { useState } from 'react';
import { Star, ChevronDown, Play, Car, Truck, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BuyawarrantyHomepage = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Car');

  const handleGetQuote = () => {
    console.log('Get quote clicked, regNumber:', regNumber);
    console.log('regNumber length:', regNumber.length);
    console.log('regNumber trimmed:', regNumber.trim());
    console.log('Current isExpanded:', isExpanded);
    
    if (regNumber.trim()) {
      console.log('Expanding section...');
      setIsExpanded(true);
      console.log('After setIsExpanded(true)');
    } else {
      console.log('No registration number entered');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-gray-100">
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

      {/* Hero Section */}
      <div className="px-4 py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  We've Got You
                  <br />
                  Covered
                  <br />
                  <span className="text-orange-500">In 60 Seconds!</span>
                </h1>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-red-500 font-semibold">• VEHICLE COVER</span>
                  <span className="text-red-500 font-semibold">• TYRE TYRE COVER</span>
                  <span className="text-red-500 font-semibold">• KEY PROTECT</span>
                </div>
                
                <p className="text-gray-600">
                  From only £19/month • Ex VAT • No hidden fees
                </p>
              </div>

              {/* Quick Quote Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Your quote in 30 seconds</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                    ))}
                  </div>
                </div>

                {/* Vehicle Type Icons */}
                <div className="flex justify-center space-x-6 mb-4">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Car className="w-5 h-5" />
                    <span className="text-sm">Car</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Truck className="w-5 h-5" />
                    <span className="text-sm">Van</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Bike className="w-5 h-5" />
                    <span className="text-sm">Bike</span>
                  </div>
                </div>

                {/* Registration Input */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      <span className="mr-1">🇬🇧</span>
                      <span>GB</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter your reg"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                      className="pl-20 h-12 text-center font-semibold text-lg bg-yellow-400 border-yellow-400 placeholder:text-gray-700"
                    />
                  </div>
                  
                  <button 
                    onClick={handleGetQuote}
                    disabled={!regNumber.trim()}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Get my quote
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">Excellent</span>
                <span className="text-gray-600 text-sm">4.8/5 based on 8,500+ reviews</span>
                <span className="text-green-600 text-sm font-medium">★★★★★ Trustpilot</span>
              </div>
            </div>

            {/* Right content - Vehicles and Mascot */}
            <div className="relative">
              <div className="flex items-center justify-center">
                {/* Halfords Autocentre Logo */}
                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 rounded text-sm font-bold">
                  halfords autocentre
                </div>
                
                {/* Vehicles */}
                <div className="grid grid-cols-2 gap-4 mr-8">
                  <img src="/lovable-uploads/bed8e125-f5d3-4bf5-a0f8-df4df5ff8693.png" alt="White van" className="w-32 h-auto" />
                  <img src="/lovable-uploads/81af2dba-748e-43a9-b3af-839285969056.png" alt="Black car" className="w-32 h-auto" />
                  <img src="/lovable-uploads/0ae93d6c-222e-46e2-8e73-9760bf2b943d.png" alt="Motorcycle" className="w-32 h-auto" />
                </div>
                
                {/* Panda Mascot */}
                <div className="relative">
                  <img src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" alt="Panda mascot" className="w-48 h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="bg-gray-50 py-16 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Left - Video Section */}
              <div className="space-y-6">
                <div className="relative bg-blue-600 rounded-xl overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white space-y-4">
                      <h3 className="text-2xl font-bold">Extended Warranty Provider UK - Affordable Vehicle Extended Warranty Plans</h3>
                      <div className="bg-white/20 rounded-full p-4 inline-block">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <span>👁️ 338 views</span>
                        <span>📅 3 years</span>
                        <span>Watch later</span>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">What Do We Cover?</h2>
                  <p className="text-gray-700 font-medium">Our warranty includes:</p>
                  
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Mechanical & Electrical Components:</strong> Engine, gearbox, clutch, turbo, drivetrain, suspension, steering, braking systems, fuel, cooling, emissions systems, ECUs, sensors, driver assistance tech, air conditioning, airbags, multimedia systems.</li>
                    <li><strong>Diagnostics & Fault-Finding:</strong> Comprehensive diagnostic coverage.</li>
                    <li><strong>Consequential Damage:</strong> Protection against related damages.</li>
                    <li><strong>Labour Costs:</strong> Labour costs covered.</li>
                    <li><strong>Claim Limits:</strong> £2,000 or £5,000 per claim.</li>
                  </ul>
                  
                  <p className="text-gray-900 font-bold">Protect Your Vehicle Today!</p>
                  <p className="text-gray-700">
                    Whether you drive a car, van, or motorbike Buy-a-Warranty offers the 
                    protection you need. Get covered in 1 minute and enjoy peace of mind 
                    on the road.
                  </p>
                </div>
              </div>

              {/* Right - Extended Warranty Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Extended Warranty:</h3>
                  <h4 className="text-xl text-orange-500 font-semibold mb-4">Avoid Costly Repairs</h4>
                  
                  <p className="text-gray-700 mb-6">
                    Protect your vehicle from unexpected repairs with flexible, 
                    affordable warranty plans. Get covered in under 60 seconds. 
                    No hidden fees. No nonsense.
                  </p>
                  
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 font-semibold">
                    Start Cover
                  </Button>
                </div>

                {/* Panda with Checkmark */}
                <div className="flex justify-center">
                  <div className="relative">
                    <img src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" alt="Panda mascot" className="w-40 h-auto" />
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-500 font-bold text-sm">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Section (Always Visible) */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Panda with badges */}
            <div className="flex justify-center relative">
              <img src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" alt="Panda mascot" className="w-64 h-auto" />
              
              {/* Floating badges */}
              <div className="absolute top-0 left-0 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Monthly
              </div>
              <div className="absolute top-8 right-0 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Yearly
              </div>
              <div className="absolute bottom-8 left-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                1-3 Year
              </div>
            </div>

            {/* Right - Benefits */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Buy-a-Warranty?</h2>
              
              <ul className="space-y-3 text-gray-700">
                <li><strong>No Excess:</strong> Never pay a penny towards repairs.</li>
                <li><strong>Unlimited Claims:</strong> Claim as many times as you need.</li>
                <li><strong>Comprehensive Coverage:</strong> From engine to electrics</li>
                <li><strong>Free MOT Test:</strong> We pay your MOT test fee</li>
                <li><strong>Recovery:</strong> Claim-back recovery costs</li>
                <li><strong>Nationwide Repairs:</strong> Repairs at trusted garages; Halfords, ATS, Kwik Fit</li>
                <li><strong>Flexible Plans:</strong> Available on 1, 2, or 3-year plans and monthly 0% APR options.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyawarrantyHomepage;