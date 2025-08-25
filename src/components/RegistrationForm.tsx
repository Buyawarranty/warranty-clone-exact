import React, { useState, useEffect } from 'react';
import VehicleRegistrationStep from './VehicleRegistrationStep';
import VehicleMileageStep from './VehicleMileageStep';

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

interface VehicleData {
  regNumber: string;
  mileage: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  isManualEntry?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onNext, 
  onBack, 
  onFormDataUpdate,
  initialData,
  currentStep,
  onStepChange
}) => {
  console.log('RegistrationForm rendering...');
  const [vehicleRegData, setVehicleRegData] = useState<{ regNumber: string; vehicleData?: any; isManualEntry?: boolean } | null>(null);
  
  const handleRegNext = (data: { regNumber: string; vehicleData?: any; isManualEntry?: boolean }) => {
    setVehicleRegData(data);
    onStepChange(1.5); // Use 1.5 to indicate mileage substep
  };

  const handleMileageNext = (data: VehicleData) => {
    onFormDataUpdate?.(data);
    // Pass empty contact details since we'll collect them in step 2
    onNext({
      ...data,
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      address: ''
    });
  };

  const handleBackToReg = () => {
    setVehicleRegData(null);
    onStepChange(1);
  };

  // Show mileage step if we have vehicle registration data
  if (vehicleRegData) {
    return (
      <VehicleMileageStep 
        vehicleData={vehicleRegData}
        onNext={handleMileageNext}
        onBack={handleBackToReg}
      />
    );
  }

  return (
    <VehicleRegistrationStep 
      onNext={handleRegNext}
    />
  );
};

export default RegistrationForm;