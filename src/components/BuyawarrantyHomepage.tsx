import React, { useState } from 'react';
import { Star, ChevronDown, Play, Car, Truck, Bike, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface BuyawarrantyHomepageProps {
  onRegistrationComplete?: (data: any) => void;
}

const BuyawarrantyHomepage = ({ onRegistrationComplete }: BuyawarrantyHomepageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Car');
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [vehicleNotFound, setVehicleNotFound] = useState(false);

  const handleSearchVehicle = async () => {
    if (!regNumber.trim()) return;

    setIsSearching(true);
    setVehicleNotFound(false);

    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    try {
      const apiCall = supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: regNumber.trim() }
      });

      const result = await Promise.race([apiCall, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        console.error('DVLA lookup error:', error);
        setVehicleNotFound(true);
        setIsExpanded(true);
      } else if (data?.found) {
        setVehicleData(data);
        setIsExpanded(true);
      } else {
        setVehicleNotFound(true);
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error calling DVLA API:', error);
      setVehicleNotFound(true);
      setIsExpanded(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetQuote = () => {
    if (regNumber.trim() && mileage.trim() && onRegistrationComplete) {
      const vehicleInfo = vehicleData ? {
        make: vehicleData.make,
        model: vehicleData.model || 'Unknown',
        year: vehicleData.yearOfManufacture.toString(),
        vehicleType: vehicleData.vehicleType
      } : {
        make: 'UNKNOWN',
        model: 'UNKNOWN',
        year: '2020',
        vehicleType: 'car'
      };

      onRegistrationComplete({
        regNumber: regNumber.trim(),
        mileage: mileage.trim(),
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        ...vehicleInfo
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <span className="text-blue-600">buya</span>
              <span className="text-orange-500">warranty</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Our Warranties</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">What's Covered</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Make A Claim</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Contact Us</a>
            </nav>
            
            {/* Header CTA */}
            <div className="flex items-center space-x-2">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                WhatsApp Us
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                Get My Quote
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Reliable Protection
                </div>
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Save Upto 60%
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  We've Got You
                  <br />
                  Covered
                  <br />
                  <span className="text-orange-500">In 60 Seconds!</span>
                </h1>
                
                <ul className="space-y-2 text-lg">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    From only £19/month
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    0% APR
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    No hidden fees.
                  </li>
                </ul>
              </div>

              {/* Registration Plate Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  {/* GB Reg Plate Style Input */}
                  <div className="flex items-center bg-yellow-400 border-2 border-black rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-blue-600 text-white px-3 py-4 text-xs font-bold flex items-center">
                      <span className="mr-1">🇬🇧</span>
                      <span>GB</span>
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER REG"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                      className="bg-yellow-400 px-4 py-4 text-black font-bold text-center w-32 placeholder:text-gray-700 border-none outline-none text-lg"
                      maxLength={8}
                    />
                  </div>
                  
                  <button 
                    onClick={handleSearchVehicle}
                    disabled={!regNumber.trim() || isSearching}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors flex items-center shadow-lg"
                  >
                    {isSearching ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Get My Quote'
                    )}
                  </button>
                </div>
              </div>

              {/* Trustpilot */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Trustpilot</span>
              </div>
            </div>

            {/* Right content - Hero Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/a82efe3e-53ff-4ada-93eb-73dbbc1cc793.png" 
                alt="Panda mascot with various vehicles - cars, vans, and motorbikes" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
                  
      {/* Expanded Vehicle Details Modal/Section */}
      {isExpanded && (
        <section className="bg-gray-50 py-8 border-t">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {vehicleData && !vehicleNotFound ? (
                  <>
                    <div className="text-lg font-medium text-gray-900 text-center">
                      We found your vehicle:
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {vehicleData.yearOfManufacture} • {vehicleData.make} • {vehicleData.model || 'Unknown Model'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {vehicleData.fuelType} • {vehicleData.transmission || 'Unknown'} • MOT: {vehicleData.motStatus} • Tax: {vehicleData.taxStatus}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setVehicleNotFound(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      This is not my vehicle
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-medium text-gray-900 text-center">
                      {vehicleNotFound ? 'Vehicle not found. Please enter details manually:' : 'Please confirm your vehicle details:'}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Make (e.g. Ford)" className="h-12" />
                      <Input placeholder="Model (e.g. Focus)" className="h-12" />
                      <Input placeholder="Year (e.g. 2020)" className="h-12" />
                      <select className="h-12 px-3 rounded-md border border-input bg-background">
                        <option>Fuel Type</option>
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>Electric</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    
                    {vehicleData && (
                      <button 
                        onClick={() => setVehicleNotFound(false)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Back to found vehicle
                      </button>
                    )}
                  </>
                )}
                
                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-900">
                    What's your approximate mileage?
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 15,000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="h-12 text-center text-lg"
                  />
                </div>
                
                <button 
                  onClick={handleGetQuote}
                  disabled={!regNumber.trim() || !mileage.trim()}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl disabled:opacity-50 rounded-lg transition-colors"
                >
                  Continue To Quote
                </button>
                
                <div className="text-sm text-gray-500 text-center">
                  We can only provide warranty for vehicles with a maximum mileage of 100,000
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Video */}
            <div className="space-y-6">
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <h3 className="text-xl lg:text-2xl font-bold px-4">Extended Warranty Provider UK - Affordable Vehicle Cover Plans</h3>
                    <button className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors">
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </div>
                {/* YouTube embed placeholder */}
                <iframe 
                  src="https://www.youtube.com/embed/G9QuVoxckbw" 
                  title="Extended Warranty Provider UK - Affordable Vehicle Cover Plans"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Right - Extended Warranty Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Extended Warranty.
                  <br />
                  <span className="text-orange-500">Avoid Costly Repairs</span>
                </h2>
                
                <p className="text-lg text-gray-700">
                  Protect your vehicle from unexpected repairs with flexible, 
                  affordable warranty plans. Get covered in under 60 seconds. 
                  No hidden fees. No nonsense.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Mechanical & Electrical Coverage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Diagnostics & Fault-Finding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Labour Costs Covered</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Up to £5,000 per claim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Only show expandable section if not expanded in main form */}
      {isExpanded && false && (
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