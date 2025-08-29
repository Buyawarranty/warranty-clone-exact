
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Play, Car, Truck, Bike, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
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
  const [showStickyBar, setShowStickyBar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Hide sticky bar when within 200px of the bottom
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;
      setShowStickyBar(!isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        // If vehicle is found, expand to show mileage input
        setIsExpanded(true);
        setVehicleNotFound(false);
        
        // Scroll to the expanded section after a brief delay
        setTimeout(() => {
          const expandedSection = document.querySelector('.expanded-section');
          if (expandedSection) {
            expandedSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 300);
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-center lg:text-left">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <span className="text-blue-600">buya</span>
              <span className="text-orange-500">warranty</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm">
              <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</Link>
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
                
                <ul className="flex flex-wrap items-center gap-4 text-base lg:text-lg">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    From only £12/month
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited claims
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Fast payout
                  </li>
                </ul>
              </div>

              {/* Registration Plate Input */}
              <div className="space-y-4 flex flex-col items-center lg:items-start">
                {/* GB Reg Plate Style Input - Centered on mobile */}
                <div className="flex items-center bg-yellow-400 border-2 border-black rounded-lg overflow-hidden shadow-lg w-full max-w-sm lg:w-96">
                  <div className="bg-blue-600 text-white px-3 py-4 text-sm font-bold flex flex-col items-center justify-center min-w-[60px]">
                    <div className="text-xs mb-1">🇬🇧</div>
                    <div className="text-xs font-black">UK</div>
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER REG"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                    className="bg-yellow-400 px-4 py-4 text-black font-bold text-center flex-1 placeholder:text-gray-700 border-none outline-none text-xl tracking-wider"
                    maxLength={8}
                  />
                </div>
                
                {/* Get My Quote Button - Same Width, centered on mobile */}
                <button 
                  onClick={handleSearchVehicle}
                  disabled={!regNumber.trim() || isSearching}
                  className="w-full max-w-sm lg:w-96 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors flex items-center justify-center shadow-lg"
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
                
                {/* Official Trustpilot Logo - Left Aligned */}
                <div className="flex justify-start mt-4">
                  <img 
                    src="/lovable-uploads/93ae1ab8-67a7-4ec1-8874-fe6d38c9a39c.png" 
                    alt="Trustpilot logo" 
                    className="h-8 w-auto"
                  />
                </div>
              </div>

              {/* Trustpilot Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Excellent 4.8/5</span>
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
        <section className="bg-gray-50 py-8 border-t expanded-section">
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
                
                <div className="space-y-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-600">👇</div>
                    <label className="text-lg font-bold text-gray-900">
                      Now enter your approximate mileage:
                    </label>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. 15,000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="h-12 text-center text-lg border-2 border-yellow-400 focus:border-yellow-500"
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
      <section className="bg-gray-50 py-16 pb-24 relative overflow-hidden">
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

              {/* Get My Cover Button */}
              <div className="mt-8">
                <button 
                  onClick={() => {
                    // Scroll to the registration section
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Focus on the registration input
                    const regInput = document.querySelector('input[placeholder="ENTER REG"]') as HTMLInputElement;
                    if (regInput) {
                      regInput.focus();
                    }
                  }}
                  className="px-8 py-4 rounded-lg font-bold text-lg text-white transition-colors shadow-lg"
                  style={{ backgroundColor: '#170B54' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a0e5a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#170B54';
                  }}
                >
                  Get My Cover
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved Bottom Divider */}
        <svg 
          className="absolute -bottom-1 left-0 w-full block"
          style={{ zIndex: 1 }}
          viewBox="0 0 1200 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 Q600,60 1200,0 L1200,60 L0,60 Z" 
            fill="#ffffff"
          />
        </svg>
      </section>


      {/* Why Choose Buy-a-Warranty Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Payment Options Panda Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/3055b782-ad2b-4456-804b-84703e692b93.png" 
                alt="Panda mascot with payment options - Monthly, Yearly, 1,2,3 Years" 
                className="w-full h-auto"
              />
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Why Choose <span className="text-orange-500">Buy a Warranty?</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">No Excess:</span>
                      <span className="text-gray-700"> Never pay a penny towards repairs.</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Unlimited Claims:</span>
                      <span className="text-gray-700"> Claim as many times as you need.</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Comprehensive Coverage:</span>
                      <span className="text-gray-700"> From engine to electrics</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Free MOT Test:</span>
                      <span className="text-gray-700"> We pay your MOT test fee</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Recovery:</span>
                      <span className="text-gray-700"> Claim-back recovery costs</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Nationwide Repairs:</span>
                      <span className="text-gray-700"> Repairs at trusted garages; Halfords, ATS, Kwik Fit</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <div>
                      <span className="font-semibold text-gray-900">Flexible Plans:</span>
                      <span className="text-gray-700"> Available on 1, 2, or 3-year plans and monthly 0% APR options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Mobile Layout - Stacked */}
          <div className="md:hidden flex flex-col items-center gap-3">
            <div className="text-gray-700 font-bold text-lg text-center">
              Protect Your Vehicle <span className="text-orange-500">Today!</span>
            </div>
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="flex items-center bg-yellow-400 border-2 border-black rounded-lg overflow-hidden shadow-lg flex-1">
                <div className="bg-blue-600 text-white px-2 py-2 text-xs font-bold flex flex-col items-center justify-center min-w-[40px]">
                  <div className="text-xs mb-1">🇬🇧</div>
                  <div className="text-xs font-black">UK</div>
                </div>
                <input
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  type="text"
                  placeholder="ENTER REG"
                  className="bg-yellow-400 text-black font-bold text-center py-2 px-2 flex-1 focus:outline-none uppercase placeholder-black text-sm"
                  maxLength={8}
                />
              </div>
              <button 
                onClick={handleSearchVehicle}
                disabled={!regNumber.trim() || isSearching}
                className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {isSearching ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  'Quote'
                )}
              </button>
            </div>
          </div>
          
          {/* Desktop Layout - Horizontal */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-gray-700 font-bold text-2xl">
              Protect Your Vehicle <span className="text-orange-500">Today!</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-yellow-400 border-2 border-black rounded-lg overflow-hidden shadow-lg">
                <div className="bg-blue-600 text-white px-3 py-3 text-sm font-bold flex flex-col items-center justify-center min-w-[50px]">
                  <div className="text-xs mb-1">🇬🇧</div>
                  <div className="text-xs font-black">UK</div>
                </div>
                <input
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  type="text"
                  placeholder="ENTER REG"
                  className="bg-yellow-400 text-black font-bold text-center py-3 px-6 w-64 focus:outline-none uppercase placeholder-black"
                  maxLength={8}
                />
              </div>
              <button 
                onClick={handleSearchVehicle}
                disabled={!regNumber.trim() || isSearching}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 h-14 rounded-lg font-semibold whitespace-nowrap disabled:opacity-50 flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Get My Quote'
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default BuyawarrantyHomepage;
