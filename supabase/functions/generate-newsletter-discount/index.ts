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

    // Send email with discount code (using Resend)
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BuyaWarranty <support@buyawarranty.co.uk>',
          to: [email],
          subject: '🎉 Your £25 Discount Code is Ready!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your £25 Discount Code</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                  <div style="display: inline-block; padding: 20px; background-color: #f97316; border-radius: 50%; margin-bottom: 20px;">
                    <span style="color: white; font-weight: bold; font-size: 14px;">
                      buya<br>warranty
                    </span>
                  </div>
                  <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Your £25 Discount is Ready!</h1>
                </div>
                
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                  <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">Use this exclusive code to get £25 off your warranty:</p>
                  <div style="background-color: #1f2937; color: white; padding: 15px 25px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 2px; display: inline-block; margin-bottom: 20px;">
                    ${discountCode}
                  </div>
                  <p style="color: #ef4444; margin: 0; font-size: 14px; font-weight: 500;">Valid for 30 days • One-time use only</p>
                </div>
                
                <div style="text-center; margin-bottom: 30px;">
                  <a href="https://buyawarranty.co.uk" style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Get My Warranty Now
                  </a>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; color: #6b7280; font-size: 14px;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0;">Why Choose BuyaWarranty?</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>No excess to pay</li>
                    <li>Unlimited claims</li>
                    <li>Comprehensive coverage</li>
                    <li>Fast payouts</li>
                    <li>Trusted garage network</li>
                  </ul>
                  
                  <p style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                    You received this email because you signed up for our newsletter discount.<br>
                    BuyaWarranty • United Kingdom
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email:', await emailResponse.text());
      } else {
        console.log('Email sent successfully');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        discountCode,
        message: 'Discount code generated and email sent successfully',
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