import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterPopup = ({ isOpen, onClose }: NewsletterPopupProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: signup, error } = await supabase
        .from('newsletter_signups')
        .insert([
          {
            email: email.toLowerCase().trim(),
            source: 'popup',
            ip_address: null, // Could be implemented with IP detection
            user_agent: navigator.userAgent,
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        // Generate discount code
        try {
          const { error: discountError } = await supabase.functions.invoke('generate-newsletter-discount', {
            body: {
              email: email.toLowerCase().trim(),
              signupId: signup.id,
            }
          });

          if (discountError) {
            console.error('Error generating discount code:', discountError);
          }
        } catch (discountErr) {
          console.error('Discount generation failed:', discountErr);
        }

        toast({
          title: "Success!",
          description: "You've been subscribed! Your £25 discount code has been sent to your email.",
        });
        setEmail('');
        onClose();
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/0fae248e-ea71-4790-b826-f8d17aa8e77a.png" 
              alt="BuyaWarranty Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            Get £25 Off Your Warranty!
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600">
            Sign up with your email to receive an exclusive discount on your vehicle warranty
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              {isSubmitting ? 'Signing Up...' : 'Get My £25 Discount'}
            </Button>
          </form>

          {/* Fine print */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By signing up, you agree to receive helpful updates about your warranty. 
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;