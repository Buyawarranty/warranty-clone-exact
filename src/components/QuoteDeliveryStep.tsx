import React from 'react';
import { Mail, Eye, ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteDeliveryStepProps {
  onBack?: () => void;
  onViewQuote?: () => void;
  onEmailQuote?: () => void;
}

const QuoteDeliveryStep = ({ onBack, onViewQuote, onEmailQuote }: QuoteDeliveryStepProps) => {
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How would you like to receive your quote?
          </h1>

          {/* Quote Options */}
          <div className="space-y-4">
            {/* View Quote Now */}
            <Button 
              onClick={onViewQuote}
              className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg flex items-center justify-between px-6"
            >
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-3" />
                View my quote now
              </div>
              <span className="text-xl">→</span>
            </Button>

            {/* Or Divider */}
            <div className="text-center py-4">
              <span className="text-gray-500 text-sm">or</span>
            </div>

            {/* Email Quote */}
            <Button 
              onClick={onEmailQuote}
              className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg flex items-center justify-between px-6"
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                Email me my quote
              </div>
              <span className="text-xl">→</span>
            </Button>

            {/* Unsubscribe Notice */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Unsubscribe at any time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDeliveryStep;