import React from 'react';
import VehicleRegistrationStep from './VehicleRegistrationStep';

interface RegistrationFormProps {
  onNext: (data: { regNumber: string; mileage: string; email: string; phone: string; firstName: string; lastName: string; address: string; make?: string; model?: string; fuelType?: string; transmission?: string; year?: string; isManualEntry?: boolean }) => void;
  onBack?: (step: number) => void;
  onFormDataUpdate?: (data: any) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
    firstName?: string;
    address?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
  };
  currentStep: number;
  onStepChange: (step: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onNext, 
  onFormDataUpdate
}) => {
  console.log('RegistrationForm rendering...');
  
  const handleRegNext = (data: { regNumber: string; vehicleData?: any; isManualEntry?: boolean }) => {
    // Prepare the data structure expected by the parent component
    const formattedData = {
      regNumber: data.regNumber,
      mileage: '', // Will be filled in step 2
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      address: '',
      make: data.vehicleData?.make || '',
      model: data.vehicleData?.model || '',
      fuelType: data.vehicleData?.fuelType || '',
      transmission: data.vehicleData?.transmission || '',
      year: data.vehicleData?.year || '',
      vehicleType: data.vehicleData?.vehicleType || '',
      isManualEntry: data.isManualEntry,
      vehicleData: data.vehicleData
    };
    
    onFormDataUpdate?.(formattedData);
    onNext(formattedData);
  };

  return (
    <VehicleRegistrationStep 
      onNext={handleRegNext}
    />
  );
};

export default RegistrationForm;