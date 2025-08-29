-- Create table for email newsletter signups
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  discount_amount NUMERIC DEFAULT 25.00,
  source TEXT DEFAULT 'popup',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  discount_code_sent BOOLEAN DEFAULT false,
  discount_code_used BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow inserting newsletter signups" 
ON public.newsletter_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view newsletter signups" 
ON public.newsletter_signups 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage newsletter signups" 
ON public.newsletter_signups 
FOR ALL 
USING (true);

-- Add unique constraint on email to prevent duplicates
CREATE UNIQUE INDEX idx_newsletter_signups_email ON public.newsletter_signups(email);