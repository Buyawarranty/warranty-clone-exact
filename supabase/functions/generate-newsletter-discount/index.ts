import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterDiscountRequest {
  email: string;
  signupId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, signupId }: NewsletterDiscountRequest = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique discount code
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountCode = `WELCOME25-${timestamp.slice(-4).toUpperCase()}-${randomSuffix}`;

    console.log('Generating discount code:', discountCode, 'for email:', email);

    // Create Stripe coupon if Stripe is configured
    let stripeCouponId = null;
    let stripePromoCodeId = null;

    try {
      const stripeResponse = await fetch('https://api.stripe.com/v1/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'id': discountCode,
          'amount_off': '2500', // £25.00 in pence
          'currency': 'gbp',
          'duration': 'once',
          'name': 'Newsletter Welcome Discount - £25 Off',
          'metadata[source]': 'newsletter_signup',
          'metadata[email]': email,
        }),
      });

      if (stripeResponse.ok) {
        const stripeCoupon = await stripeResponse.json();
        stripeCouponId = stripeCoupon.id;
        console.log('Created Stripe coupon:', stripeCouponId);

        // Create promo code for easier usage
        const promoResponse = await fetch('https://api.stripe.com/v1/promotion_codes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'coupon': stripeCouponId,
            'code': discountCode,
            'active': 'true',
            'max_redemptions': '1',
            'metadata[source]': 'newsletter_signup',
            'metadata[email]': email,
          }),
        });

        if (promoResponse.ok) {
          const promoCode = await promoResponse.json();
          stripePromoCodeId = promoCode.id;
          console.log('Created Stripe promo code:', stripePromoCodeId);
        }
      } else {
        console.error('Failed to create Stripe coupon:', await stripeResponse.text());
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      // Continue without Stripe integration
    }

    // Store discount code in database
    const { error: discountError } = await supabase
      .from('discount_codes')
      .insert([
        {
          code: discountCode,
          type: 'fixed',
          value: 25.00,
          valid_from: new Date().toISOString(),
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          usage_limit: 1,
          used_count: 0,
          active: true,
          applicable_products: ['all'],
          stripe_coupon_id: stripeCouponId,
          stripe_promo_code_id: stripePromoCodeId,
        }
      ]);

    if (discountError) {
      console.error('Error creating discount code:', discountError);
      throw discountError;
    }

    // Update newsletter signup with discount code info
    const { error: updateError } = await supabase
      .from('newsletter_signups')
      .update({
        discount_code_sent: true,
      })
      .eq('id', signupId);

    if (updateError) {
      console.error('Error updating newsletter signup:', updateError);
    }

    // Return the discount code directly instead of sending email
    return new Response(
      JSON.stringify({
        success: true,
        discount_code: discountCode,
        message: 'Discount code generated successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in generate-newsletter-discount function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);