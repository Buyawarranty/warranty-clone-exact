import React from 'react';
import { Star, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  children: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-gray-100">
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
      <div className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Protect your car.
                  <br />
                  <span className="text-gray-700">Fast, fair and</span>
                  <br />
                  <span className="text-orange-600">no fuss.</span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Get comprehensive warranty coverage, instant quotes, 
                  flexible plans, and same-day activation.
                </p>
              </div>

              {/* Form container */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 max-w-lg">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Step 1 of 4</span>
                  </div>
                </div>
                {children}
              </div>

              {/* Trustpilot section */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">Excellent</span>
                <span className="text-gray-600">4.8/5 based on 8,500+ reviews</span>
                <img 
                  src="/lovable-uploads/bed8e125-f5d3-4bf5-a0f8-df4df5ff8693.png" 
                  alt="Trustpilot" 
                  className="h-6 w-auto opacity-90"
                />
              </div>
            </div>

            {/* Right content - Car image */}
            <div className="relative">
              {/* Orange accent shapes */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-100 rounded-full opacity-60"></div>
              <div className="absolute top-20 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-40"></div>
              <div className="absolute bottom-16 right-16 w-16 h-16 bg-orange-300 rounded-full opacity-30"></div>
              
              {/* Car image */}
              <div className="relative z-10">
                <img 
                  src="/lovable-uploads/81af2dba-748e-43a9-b3af-839285969056.png"
                  alt="Blue car for warranty coverage"
                  className="w-full max-w-lg mx-auto drop-shadow-lg"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute top-8 left-8 bg-orange-500 text-white rounded-full px-4 py-2 shadow-lg">
                <div className="text-sm font-semibold">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ready. Set. <em className="text-orange-600">Protected.</em>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make car protection simple. Here's how it works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/0ae93d6c-222e-46e2-8e73-9760bf2b943d.png"
                  alt="Get a free valuation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Get a free quote</h3>
                <p className="text-gray-600 leading-relaxed">
                  See your warranty options instantly. Quick, easy and done in minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png"
                  alt="Choose the best plan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Choose the best plan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Compare comprehensive warranty plans. No hidden fees.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-80 h-60 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/3174e10f-48a6-44dc-a380-d2c78144dd6c.png"
                  alt="Get instant coverage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Get instant coverage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your warranty activates immediately. Outstanding service guaranteed.
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