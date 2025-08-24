import React from 'react';
import { Shield, Star } from 'lucide-react';

interface HeroSectionProps {
  children: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#ffdb00] via-[#ffd700] to-[#ffcc00]">
      {/* Background geometric shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#ea580c] opacity-20 transform rotate-45 translate-x-48"></div>
        <div className="absolute top-40 right-32 w-64 h-64 bg-[#1e40af] opacity-15 transform rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#ea580c] opacity-10 transform -rotate-12"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-3xl font-bold">
            <span className="text-[#1e40af]">buya</span>
            <span className="text-[#ea580c]">warranty</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-[#1e40af] transition-colors">How it works</a>
            <a href="#" className="text-gray-700 hover:text-[#1e40af] transition-colors">Help</a>
            <a href="#" className="text-gray-700 hover:text-[#1e40af] transition-colors">More</a>
            <button className="flex items-center text-gray-700 hover:text-[#1e40af] transition-colors">
              Sign in
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Protect your car.
                  <br />
                  <span className="text-[#1e40af]">Simple, fast and</span>
                  <br />
                  <span className="text-[#ea580c]">reliable.</span>
                </h1>
                
                <p className="text-xl text-gray-700 max-w-lg leading-relaxed">
                  Get comprehensive warranty coverage with instant quotes, 
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
                <span className="text-gray-700 font-medium">Excellent</span>
                <span className="text-gray-600">4.8/5 based on 8,500+ reviews</span>
                <img 
                  src="/lovable-uploads/bed8e125-f5d3-4bf5-a0f8-df4df5ff8693.png" 
                  alt="Trustpilot" 
                  className="h-6 w-auto opacity-90"
                />
              </div>
            </div>

            {/* Right content - Car illustration */}
            <div className="relative">
              <div className="relative z-10">
                {/* Car SVG illustration */}
                <svg 
                  viewBox="0 0 400 240" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Car body */}
                  <ellipse cx="200" cy="220" rx="180" ry="15" fill="#00000010" />
                  
                  {/* Main car body */}
                  <path 
                    d="M80 160 L80 140 Q80 120 100 120 L140 120 Q150 100 170 100 L230 100 Q250 100 260 120 L300 120 Q320 120 320 140 L320 160 L320 180 Q320 190 310 190 L290 190 Q280 200 260 200 Q240 200 230 190 L170 190 Q160 200 140 200 Q120 200 110 190 L90 190 Q80 190 80 180 Z" 
                    fill="#1e40af"
                  />
                  
                  {/* Car roof */}
                  <path 
                    d="M140 120 Q150 100 170 100 L230 100 Q250 100 260 120 L240 120 Q230 110 200 110 Q170 110 160 120 Z" 
                    fill="#2563eb"
                  />
                  
                  {/* Windows */}
                  <path 
                    d="M160 120 L160 135 L240 135 L240 120 Q230 110 200 110 Q170 110 160 120" 
                    fill="#87ceeb" 
                    opacity="0.8"
                  />
                  
                  {/* Front and rear lights */}
                  <circle cx="310" cy="155" r="8" fill="#ffeb3b" />
                  <circle cx="90" cy="155" r="8" fill="#ff5722" />
                  
                  {/* Wheels */}
                  <circle cx="140" cy="190" r="25" fill="#2c2c2c" />
                  <circle cx="140" cy="190" r="18" fill="#4a4a4a" />
                  <circle cx="140" cy="190" r="12" fill="#666" />
                  
                  <circle cx="260" cy="190" r="25" fill="#2c2c2c" />
                  <circle cx="260" cy="190" r="18" fill="#4a4a4a" />
                  <circle cx="260" cy="190" r="12" fill="#666" />
                  
                  {/* Door handle */}
                  <rect x="200" y="150" width="8" height="3" rx="1" fill="#333" />
                  
                  {/* Shield icon overlay */}
                  <g transform="translate(320, 80)">
                    <circle cx="0" cy="0" r="25" fill="#ea580c" />
                    <Shield className="w-8 h-8 text-white" x="-16" y="-16" />
                  </g>
                </svg>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-10 right-10 bg-white rounded-full p-3 shadow-lg animate-bounce">
                <Shield className="w-6 h-6 text-[#ea580c]" />
              </div>
              
              <div className="absolute bottom-10 left-10 bg-[#1e40af] text-white rounded-lg p-3 shadow-lg">
                <div className="text-sm font-semibold">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;