import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VehicleRegistrationStepProps {
  onNext: (data: { regNumber: string; vehicleData?: any; isManualEntry?: boolean }) => void;
}

interface DVLAVehicleData {
  found: boolean;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  yearOfManufacture?: string;
  vehicleType?: string;
  colour?: string;
  engineCapacity?: number;
  motStatus?: string;
  motExpiryDate?: string;
  taxStatus?: string;
  error?: string;
}

const VehicleRegistrationStep: React.FC<VehicleRegistrationStepProps> = ({ onNext }) => {
  const { toast } = useToast();
  const [regNumber, setRegNumber] = useState('');
  const [regError, setRegError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [vehicleData, setVehicleData] = useState<DVLAVehicleData | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry fields
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [yearError, setYearError] = useState('');

  const formatRegNumber = (value: string) => {
    const formatted = value.replace(/\s/g, '').toUpperCase();
    if (formatted.length > 3) {
      return formatted.slice(0, -3) + ' ' + formatted.slice(-3);
    }
    return formatted;
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) {
      setRegNumber(formatted);
      setRegError('');
      setVehicleData(null);
      setShowManualEntry(false);
    }
  };

  const handleFindCar = async () => {
    if (!regNumber || regError) return;
    
    setIsLookingUp(true);
    setVehicleData(null);
    
    try {
      console.log('Looking up vehicle:', regNumber);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Lookup timeout - please try again')), 12000);
      });
      
      const lookupPromise = supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: regNumber }
      });
      
      const { data, error } = await Promise.race([lookupPromise, timeoutPromise]) as any;

      if (error) {
        console.error('DVLA lookup error:', error);
        throw error;
      }

      console.log('DVLA lookup result:', data);
      setVehicleData(data);
      
      if (data.found) {
        // Vehicle found, proceed to next step
        onNext({ regNumber, vehicleData: data });
      } else {
        // Vehicle not found, show manual entry
        setShowManualEntry(true);
      }
    } catch (error: any) {
      console.error('Error looking up vehicle:', error);
      
      if (error.message?.includes('timeout')) {
        toast({
          title: "Lookup Timeout",
          description: "The vehicle lookup is taking longer than usual. Please try again or enter details manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lookup Failed",
          description: "Unable to find vehicle details. You can enter them manually below.",
          variant: "destructive",
        });
      }
      
      setShowManualEntry(true);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = e.target.value;
    setYear(yearValue);
    
    if (yearValue) {
      const currentYear = new Date().getFullYear();
      const vehicleYear = parseInt(yearValue);
      const vehicleAge = currentYear - vehicleYear;
      
      if (vehicleAge > 15) {
        setYearError('We cannot offer warranties for vehicles over 15 years of age');
      } else {
        setYearError('');
      }
    } else {
      setYearError('');
    }
  };

  const handleManualSubmit = () => {
    if (regNumber && make && model && year && vehicleType && !yearError) {
      const manualVehicleData = {
        found: true,
        make,
        model,
        yearOfManufacture: year,
        vehicleType
      };
      onNext({ regNumber, vehicleData: manualVehicleData, isManualEntry: true });
    }
  };

  const isManualFormValid = regNumber && make && model && year && vehicleType && !yearError && !regError;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Search size={20} className="text-[#ea580c]" />
          Find your vehicle
        </h2>
        <div 
          className="w-full flex items-center bg-white text-gray-900 font-bold text-lg px-4 py-4 rounded-lg border-2 border-gray-300 focus-within:border-[#1e40af] transition-colors cursor-pointer hover:border-[#1e40af]"
          onClick={() => document.getElementById('regInput')?.focus()}
        >
          <img 
            src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
            alt="GB Flag" 
            className="w-8 h-6 mr-3 object-cover rounded-sm"
          />
          <input
            id="regInput"
            type="text"
            value={regNumber}
            onChange={handleRegChange}
            placeholder="Enter your reg plate"
            className="bg-transparent border-none outline-none text-lg text-gray-900 flex-1 font-medium placeholder:text-gray-500"
            maxLength={8}
          />
        </div>
       
       {regError && (
         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
           <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
           <p className="text-sm text-red-700">{regError}</p>
         </div>
       )}
      </div>

      {!showManualEntry && (
        <button 
          type="button"
          onClick={handleFindCar}
          disabled={!regNumber || isLookingUp || regError !== ''}
          className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-lg font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover-scale"
        >
          {isLookingUp ? 'Looking up...' : 'Find my vehicle'}
        </button>
      )}

      {vehicleData && !vehicleData.found && vehicleData.error && vehicleData.error.includes('15 years') && (
        <div className="bg-orange-50 border border-orange-200 rounded-[4px] p-4 mb-4">
          <h3 className="text-lg font-bold text-orange-800 mb-2">
            Sorry, We Can't Cover This Vehicle
          </h3>
          <p className="text-sm text-orange-700 mb-2">
            We can't provide a warranty for vehicles that are more than 15 years old.
          </p>
          <p className="text-sm text-orange-700">
            If your car is newer than that, feel free to try again. We may just need to run a couple of extra checks 🔍 before we can confirm your cover.
          </p>
        </div>
      )}

      {vehicleData && !vehicleData.found && (!vehicleData.error || !vehicleData.error.includes('15 years')) && (
        <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-4 mb-4">
          <p className="text-sm text-blue-800 mb-2">
            ⚠️ Vehicle not found -
          </p>
          <p className="text-sm text-blue-700 font-bold mb-2">
            Please double-check your number plate and try again.
          </p>
          <p className="text-sm text-blue-700 mb-2">
            We couldn't verify this registration with the DVLA.
          </p>
          <p className="text-sm text-blue-700">
            If you'd still like to proceed, we may need to run some additional checks 🔍 before confirming your warranty.
          </p>
        </div>
      )}

      {showManualEntry && (
        <div className="mb-4 p-3 sm:p-4 border-2 border-gray-200 rounded-[6px]">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Enter your vehicle details manually</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Audi"
                className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none focus:border-[#224380]"
                required
              />
            </div>
            
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. A4"
                className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none focus:border-[#224380]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                placeholder="e.g. 2020"
                min="2000"
                max="2024"
                className={`w-full border-2 rounded-[6px] px-[16px] py-[12px] focus:outline-none ${
                  yearError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-[#224380]'
                }`}
                required
              />
              {yearError && (
                <p className="text-sm text-red-600 mt-1">{yearError}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none focus:border-[#224380] appearance-none"
                required
              >
                <option value="">Select type</option>
                <option value="Car or Van">Car or Van</option>
                <option value="EV">Electric Vehicle</option>
                <option value="PHEV">Plug-in Hybrid</option>
                <option value="MOTORBIKE">Motorbike</option>
              </select>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleManualSubmit}
            disabled={!isManualFormValid}
            className="w-full mt-4 bg-[#ea580c] hover:bg-[#dc2626] text-white text-lg font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistrationStep;