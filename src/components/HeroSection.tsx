import React from 'react';
import { Star, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  children: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-3xl font-bold">
            <span className="text-blue-600">buya</span>
            <span className="text-orange-600">warranty</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Help</a>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                Tools <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                More <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              Sign in
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden">
        {/* Background geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-300 opacity-30 transform rotate-12 rounded-3xl"></div>
          <div className="absolute top-32 right-20 w-64 h-64 bg-orange-300 opacity-20 transform -rotate-12 rounded-3xl"></div>
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-orange-300 opacity-25 transform rotate-45 rounded-3xl"></div>
        </div>

        <div className="relative z-10 px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Protect your car.
                    <br />
                    <span className="text-gray-800">Fast, fair and</span>
                    <br />
                    <span className="text-gray-800">no fuss.</span>
                  </h1>
                  
                  <p className="text-xl text-gray-800 max-w-lg leading-relaxed font-medium">
                    <span className="text-gray-900">Get comprehensive warranty coverage</span>, instant quotes, 
                    flexible plans, and same-day activation.
                  </p>
                </div>

                {/* Form container */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg">
                  {children}
                </div>

                {/* Trustpilot section */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-green-500 text-green-500" />
                    ))}
                  </div>
                  <span className="text-gray-800 font-medium">Excellent</span>
                  <span className="text-gray-700">4.8/5 based on 8,500+ reviews</span>
                  <img 
                    src="/lovable-uploads/bed8e125-f5d3-4bf5-a0f8-df4df5ff8693.png" 
                    alt="Trustpilot" 
                    className="h-6 w-auto opacity-90"
                  />
                </div>
              </div>

              {/* Right content - Car image */}
              <div className="relative lg:pl-12">
                <div className="relative">
                  {/* Car image - using a blue BMW similar to Motorway */}
                  <img 
                    src="/lovable-uploads/81af2dba-748e-43a9-b3af-839285969056.png"
                    alt="Blue car for warranty coverage"
                    className="w-full max-w-2xl ml-auto drop-shadow-2xl relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ready. Set. <em className="text-blue-600">Protected.</em>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make car protection simple. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden">
                <img 
                  src="/lovable-uploads/0ae93d6c-222e-46e2-8e73-9760bf2b943d.png"
                  alt="Get a free valuation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Get a free quote</h3>
                <p className="text-gray-600 leading-relaxed">
                  See your warranty options instantly, then use our simple form to get your personalized quote. Quick, easy and done in minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden">
                <img 
                  src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png"
                  alt="Choose the best plan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Choose the best plan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Compare comprehensive warranty plans from trusted providers. We show you the best coverage options. No hidden fees.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden">
                <img 
                  src="/lovable-uploads/3174e10f-48a6-44dc-a380-d2c78144dd6c.png"
                  alt="Get instant coverage"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Get instant coverage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Protected! Your warranty activates immediately and your documents are sent the same day. Outstanding service guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;