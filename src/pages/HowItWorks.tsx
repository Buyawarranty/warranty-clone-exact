import { ArrowRight, Shield, Search, FileText, CheckCircle, Loader } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [regNumber, setRegNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [vehicleNotFound, setVehicleNotFound] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Auto-trigger search if reg parameter exists
  useEffect(() => {
    const regFromUrl = searchParams.get('reg');
    if (regFromUrl && regFromUrl.trim()) {
      setRegNumber(regFromUrl);
      handleSearchVehicleFromParam(regFromUrl);
    }
  }, [searchParams]);

  // Show/hide sticky bar based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setHasScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchVehicleFromParam = async (regFromParam: string) => {
    setIsSearching(true);
    setVehicleNotFound(false);

    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    try {
      const apiCall = supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: regFromParam.trim() }
      });

      const result = await Promise.race([apiCall, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        console.error('DVLA lookup error:', error);
        setVehicleNotFound(true);
      } else if (data?.found) {
        setVehicleData(data);
        // Navigate to homepage with vehicle data
        navigate(`/?reg=${encodeURIComponent(regFromParam.trim())}`);
      } else {
        setVehicleNotFound(true);
      }
    } catch (error) {
      console.error('Error calling DVLA API:', error);
      setVehicleNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchVehicle = async () => {
    if (!regNumber.trim()) return;
    await handleSearchVehicleFromParam(regNumber.trim());
  };
  const steps = [
    {
      number: "01",
      title: "Enter Your Registration",
      description: "Simply enter your vehicle registration number to get started. We'll find your vehicle details instantly and provide you with a personalized quote in seconds.",
      image: "/lovable-uploads/cb74e665-c160-42bd-a414-b415e1ab94d9.png",
      icon: Search
    },
    {
      number: "02", 
      title: "Choose Your Cover",
      description: "Select from our comprehensive warranty plans. All our warranties include mechanical and electrical components, wear & tear, MOT failure, and breakdown cover with no excess to pay.",
      image: "/lovable-uploads/5f9e8b25-15a8-44ae-a3d0-5b9ccbfd8e3e.png",
      icon: Shield
    },
    {
      number: "03",
      title: "Drive with Confidence", 
      description: "Your warranty is active immediately. Drive knowing you're protected by our comprehensive cover with unlimited claims and fast payouts when you need them most.",
      image: "/lovable-uploads/cfbf0396-ae9e-4099-a797-043bb0875170.png",
      icon: FileText
    },
    {
      number: "04",
      title: "We've Got You Covered",
      description: "If something goes wrong, contact us directly. We'll direct you to our trusted garage network, assess the repair fairly, and pay the garage directly - you pay nothing.",
      image: "/lovable-uploads/bed17cf0-a266-44f2-ab7a-67658b9013fc.png", 
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/how-it-works" className="text-blue-600 transition-colors">How It Works</Link>
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
      <section className="bg-gradient-to-br from-blue-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It <span className="text-orange-500">Works</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            One Simple Warranty. Total Peace of Mind. We've made it easy — one powerful cover for cars, vans, and motorbikes, whether electric, hybrid, or petrol/diesel.
          </p>
          <p className="text-lg text-gray-700 font-semibold">
            No tiers. No upgrades. No stress.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image Side */}
                <div className="flex-1 relative">
                  <div className="relative">
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full max-w-md mx-auto h-auto"
                    />
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Step Number Bubble */}
                  <div className="inline-flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <Link 
                    to="/"
                    className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-6"
                  >
                    Get My Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What's Included – <span className="text-orange-500">Every Time</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              "Mechanical & electrical repairs",
              "Fair wear & tear",
              "MOT failure cover",
              "Fault diagnostics",
              "Labour costs in full",
              "Premium breakdown cover",
              "No excess to pay",
              "Unlimited claims",
              "Fast payouts"
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center md:justify-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get <span className="text-orange-500">Protected?</span>
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of drivers who trust BuyaWarranty for complete peace of mind on the road.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors animate-pulse hover:animate-none"
            >
              Get My Quote Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom spacing for sticky bar */}
      <div className="h-20"></div>

      {/* Sticky Bottom Bar */}
      {hasScrolled && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Layout - Vertical */}
            <div className="flex md:hidden flex-col items-center gap-3">
              <div className="text-gray-700 font-bold text-xl text-center">
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
}