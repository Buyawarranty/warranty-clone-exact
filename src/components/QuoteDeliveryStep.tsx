import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';

interface QuoteDeliveryStepProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
  };
  onNext: (data: { email: string; phone: string; firstName: string; lastName: string; sendQuoteEmail?: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
}

const QuoteDeliveryStep: React.FC<QuoteDeliveryStepProps> = ({ vehicleData, onNext, onBack, onSkip }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSkipClick = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Small delay to let confetti start before navigating
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const handleEmailQuoteClick = () => {
    setShowContactForm(true);
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    };

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (phone.trim() && !/^(07\d{9}|01\d{8,9}|02\d{8,9}|03\d{8,9})$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid UK phone number';
    }

    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName && !newErrors.email && !newErrors.phone;
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    });

    if (validateForm()) {
      setSendingEmail(true);
      
      try {
        // Send initial quote email (without specific plan details yet)
        console.log('Sending initial quote email with data:', {
          email,
          firstName,
          lastName,
          vehicleData
        });
        
        const quoteResponse = await supabase.functions.invoke('send-quote-email', {
          body: {
            email: email,
            firstName: firstName,
            lastName: lastName,
            vehicleData: vehicleData,
            planData: {
              planName: "Vehicle Protection Plans",
              totalPrice: 0, // Will be updated when plan is selected
              monthlyPrice: 19.99, // Starting from price
              voluntaryExcess: 50,
              paymentType: "12months",
              selectedAddOns: {}
            },
            quoteId: `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            isInitialQuote: true // Flag to indicate this is a pre-plan-selection quote
          }
        });

        if (quoteResponse.error) {
          console.error('Failed to send quote email:', quoteResponse.error);
          throw new Error('Failed to send quote email');
        }

        console.log('Quote email sent successfully:', quoteResponse.data);

        // Track abandoned cart for email quote users
        await supabase.functions.invoke('track-abandoned-cart', {
          body: {
            full_name: `${firstName} ${lastName}`.trim(),
            email: email,
            phone: phone || '',
            vehicle_reg: vehicleData?.regNumber,
            vehicle_make: vehicleData?.make,
            vehicle_model: vehicleData?.model,
            vehicle_year: vehicleData?.year,
            mileage: vehicleData?.mileage,
            step_abandoned: 2
          }
        });

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Small delay to let confetti start before navigating
        setTimeout(() => {
          onNext({ firstName, lastName, email, phone, sendQuoteEmail: true });
        }, 300);
        
      } catch (error) {
        console.error('Error sending quote email:', error);
        alert('There was an error sending your quote email. Please try again.');
      } finally {
        setSendingEmail(false);
      }
    }
  };

  const handleFieldBlur = (field: 'firstName' | 'lastName' | 'email' | 'phone') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && !errors.firstName && !errors.lastName && !errors.email && !errors.phone;
  const areRequiredFieldsFilled = firstName.trim() && lastName.trim() && email.trim();

  return (
    <section className="bg-[#e8f4fb] py-4 sm:py-10 min-h-screen px-3 sm:px-0">
      {/* Back button above the content box for both views */}
      <div className="max-w-4xl mx-auto mb-4">
        <button 
          type="button" 
          onClick={onBack}
          className="flex items-center gap-2 text-base font-medium py-3 px-6 rounded-lg border transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-12 relative">
        {!showContactForm ? (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight px-2">
                How would you like to receive your quote?
              </h1>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <button 
                onClick={handleSkipClick}
                className={`w-full flex items-center justify-center text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-xl transition-all duration-200 relative hover:bg-opacity-90 hover:shadow-lg hover:scale-[1.02] ${
                  areRequiredFieldsFilled ? '' : 'opacity-50'
                }`}
                style={{ backgroundColor: '#1e40af' }}
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 sm:left-8" />
                <div className="text-center px-8 sm:px-12">
                  <div className="text-base sm:text-xl leading-tight">
                    View my quote now
                  </div>
                </div>
                <span className="text-xl sm:text-2xl absolute right-4 sm:right-8">→</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 sm:px-6 py-2 text-gray-700 text-base sm:text-lg font-semibold border border-gray-300 rounded-full">
                    or
                  </span>
                </div>
              </div>

              <div>
                <button 
                  onClick={handleEmailQuoteClick}
                  className="w-full flex items-center justify-center text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-xl transition-all duration-200 relative shadow-lg"
                  style={{ backgroundColor: '#eb4b00' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d43f00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#eb4b00';
                  }}
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 sm:left-8" />
                  <div className="text-center px-8 sm:px-12">
                    <div className="text-base sm:text-xl leading-tight">
                      Email me my quote
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl absolute right-4 sm:right-8">→</span>
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-2">
                  Unsubscribe at any time
                </p>
              </div>
            </div>

          </>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">One last step - this won't take long</h2>
            </div>

            <form onSubmit={handleSubmitContactForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className={`w-full border-2 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base ${
                      touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onFocus={(e) => {
                      e.target.style.borderColor = touched.firstName && errors.firstName ? '#ef4444' : '#224380';
                    }}
                    onBlur={(e) => {
                      handleFieldBlur('firstName');
                      e.target.style.borderColor = touched.firstName && errors.firstName ? '#ef4444' : '#d1d5db';
                    }}
                    required
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Smith"
                    className={`w-full border-2 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base ${
                      touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onFocus={(e) => {
                      e.target.style.borderColor = touched.lastName && errors.lastName ? '#ef4444' : '#224380';
                    }}
                    onBlur={(e) => {
                      handleFieldBlur('lastName');
                      e.target.style.borderColor = touched.lastName && errors.lastName ? '#ef4444' : '#d1d5db';
                    }}
                    required
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johnsmith@email.com"
                  className={`w-full border-2 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onFocus={(e) => {
                    e.target.style.borderColor = touched.email && errors.email ? '#ef4444' : '#224380';
                  }}
                  onBlur={(e) => {
                    handleFieldBlur('email');
                    e.target.style.borderColor = touched.email && errors.email ? '#ef4444' : '#d1d5db';
                  }}
                  required
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setPhone(value);
                  }}
                  placeholder="07953866662"
                  className={`w-full border-2 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base ${
                    touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onFocus={(e) => {
                    e.target.style.borderColor = touched.phone && errors.phone ? '#ef4444' : '#224380';
                  }}
                  onBlur={(e) => {
                    handleFieldBlur('phone');
                    e.target.style.borderColor = touched.phone && errors.phone ? '#ef4444' : '#d1d5db';
                  }}
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="flex justify-end items-center">
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      // Trigger confetti
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                      });
                      
                      // Small delay to let confetti start before navigating
                      setTimeout(() => {
                        onSkip();
                      }, 300);
                    }}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium py-3 sm:py-3 px-4 sm:px-6 rounded-lg border-2 transition-all duration-200 hover-scale"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#d1d5db',
                      color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#9ca3af';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    Skip this step
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={!isFormValid || sendingEmail}
                    title={!isFormValid ? "Please enter details" : sendingEmail ? "Sending email..." : ""}
                    className="flex items-center justify-center gap-2 text-white text-base sm:text-lg font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{
                      backgroundColor: isFormValid && !sendingEmail ? '#0f1351' : '#0f1351',
                      borderColor: isFormValid && !sendingEmail ? '#0f1351' : '#0f1351'
                    }}
                    onMouseEnter={(e) => {
                      if (isFormValid && !sendingEmail) {
                        e.currentTarget.style.backgroundColor = '#0a0d3a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isFormValid && !sendingEmail) {
                        e.currentTarget.style.backgroundColor = '#0f1351';
                      }
                    }}
                  >
                    {sendingEmail ? 'Sending email...' : 'Email me my quote'}
                    {!sendingEmail && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default QuoteDeliveryStep;