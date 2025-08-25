import React, { useState } from 'react';
import { Check, Gauge } from 'lucide-react';

interface VehicleMileageStepProps {
  vehicleData: {
    regNumber: string;
    vehicleData?: any;
    isManualEntry?: boolean;
  };
  onNext: (data: { 
    regNumber: string; 
    mileage: string; 
    make?: string; 
    model?: string; 
    fuelType?: string; 
    transmission?: string; 
    year?: string; 
    vehicleType?: string; 
    isManualEntry?: boolean 
  }) => void;
  onBack: () => void;
}

const VehicleMileageStep: React.FC<VehicleMileageStepProps> = ({ vehicleData, onNext, onBack }) => {
  const [mileage, setMileage] = useState('');
  const [mileageError, setMileageError] = useState('');

  const formatMileage = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    const rawValue = cleanValue.replace(/,/g, '');
    const numericValue = parseInt(rawValue);
    
    if (cleanValue === '' || rawValue === '') {
      setMileage('');
      setMileageError('');
      return;
    }
    
    if (isNaN(numericValue) || numericValue < 0) {
      return;
    }
    
    if (numericValue > 150000) {
      setMileageError('Vehicle mileage exceeds our maximum of 150,000 miles');
      setMileage(cleanValue);
      return;
    } else {
      setMileageError('');
    }
    
    const formattedValue = formatMileage(rawValue);
    setMileage(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawMileage = mileage.replace(/,/g, '');
    const numericMileage = parseInt(rawMileage);
    
    if (!mileage.trim()) {
      setMileageError('Enter approximate mileage');
      return;
    }
    
    if (numericMileage <= 150000 && !mileageError) {
      const submitData: any = {
        regNumber: vehicleData.regNumber,
        mileage: rawMileage,
        isManualEntry: vehicleData.isManualEntry
      };
      
      // Include vehicle data if available
      if (vehicleData.vehicleData?.found) {
        submitData.make = vehicleData.vehicleData.make;
        submitData.model = vehicleData.vehicleData.model;
        submitData.fuelType = vehicleData.vehicleData.fuelType;
        submitData.transmission = vehicleData.vehicleData.transmission;
        submitData.year = vehicleData.vehicleData.yearOfManufacture;
        submitData.vehicleType = vehicleData.vehicleData.vehicleType || 'Car or Van';
      }
      
      onNext(submitData);
    }
  };

  const rawMileage = mileage.replace(/,/g, '');
  const numericMileage = parseInt(rawMileage) || 0;
  const isFormValid = mileage && numericMileage <= 150000 && !mileageError;

  return (
    <div className="w-full space-y-6">
      {/* Vehicle Details Display */}
      {vehicleData.vehicleData?.found && (
        <div style={{ backgroundColor: '#f0f8ff', borderColor: '#224380' }} className="border rounded-[4px] p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2 font-semibold">Vehicle Details</p>
          <p className="text-lg font-bold text-gray-900 mb-2">{vehicleData.regNumber}</p>
          <p className="text-sm text-gray-600">
            {vehicleData.vehicleData.make} • {vehicleData.vehicleData.fuelType} • {vehicleData.vehicleData.colour} • {vehicleData.vehicleData.yearOfManufacture}
            {vehicleData.vehicleData.engineCapacity && (
              <span> • {vehicleData.vehicleData.engineCapacity}cc</span>
            )}
          </p>
          {(vehicleData.vehicleData.motStatus || vehicleData.vehicleData.taxStatus) && (
            <p className="text-xs text-gray-500 mt-1">
              {vehicleData.vehicleData.motStatus && `MOT: ${vehicleData.vehicleData.motStatus}`}
              {vehicleData.vehicleData.motStatus && vehicleData.vehicleData.taxStatus && ' • '}
              {vehicleData.vehicleData.taxStatus && `Tax: ${vehicleData.vehicleData.taxStatus}`}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gauge size={20} className="text-[#ea580c]" />
            <h2 className="text-xl font-semibold text-gray-800">
              Vehicle mileage
            </h2>
            {mileage && !mileageError && (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={mileage}
              onChange={handleMileageChange}
              placeholder="Enter mileage (e.g. 50,000)"
              className={`w-full border-2 rounded-lg px-4 py-4 text-lg focus:outline-none transition-colors ${
                mileageError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-[#1e40af]'
              }`}
            />
            {mileage && !mileageError && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {mileageError && (
            <p className="text-sm text-red-600">{mileageError}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-semibold py-4 px-6 rounded-lg transition-all duration-200"
          >
            Back
          </button>
          <button 
            type="submit"
            disabled={!isFormValid}
            className="flex-1 bg-[#ea580c] hover:bg-[#dc2626] text-white text-lg font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Get My Quote
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleMileageStep;