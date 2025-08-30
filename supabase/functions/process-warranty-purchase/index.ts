import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentWebhookData {
  sessionId?: string;
  customerEmail: string;
  customerName: string;
  planType: string;
  paymentType: string;
  amount: number;
  currency?: string;
  customerId?: string;
  vehicleDetails?: any;
  paymentProvider: 'stripe' | 'bumper';
  bumperOrderId?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Warranty Purchase Processing Started ===');
    const webhookData: PaymentWebhookData = await req.json();
    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

    const {
      customerEmail,
      customerName,
      planType,
      paymentType,
      amount,
      currency = 'GBP',
      customerId,
      sessionId,
      bumperOrderId,
      paymentProvider,
      vehicleDetails
    } = webhookData;

    // Step 1: Determine vehicle type and document path
    console.log('Step 1: Determining document mapping for plan:', planType);
    
    // Check if this is a special vehicle plan
    const isSpecialVehicle = ['motorcycle', 'van', 'motorhome', 'caravan'].some(type => 
      planType.toLowerCase().includes(type)
    );
    
    const vehicleType = isSpecialVehicle ? 'special_vehicle' : 'standard';
    
    // Get the document path from mapping
    const { data: docMapping, error: docError } = await supabase
      .from('plan_document_mapping')
      .select('document_path')
      .eq('plan_name', planType)
      .eq('vehicle_type', vehicleType)
      .single();

    if (docError || !docMapping) {
      console.error('No document mapping found for plan:', planType, 'vehicle type:', vehicleType);
      throw new Error(`No document mapping found for plan: ${planType} (${vehicleType})`);
    }

    const documentPath = docMapping.document_path;
    console.log('Document path determined:', documentPath);

    // Step 2: Create customer record if not exists
    console.log('Step 2: Creating/updating customer record');
    
    const customerRecord = {
      email: customerEmail,
      name: customerName,
      plan_type: planType,
      status: 'Active',
      stripe_customer_id: paymentProvider === 'stripe' ? customerId : null,
      stripe_session_id: paymentProvider === 'stripe' ? sessionId : null,
      bumper_order_id: paymentProvider === 'bumper' ? bumperOrderId : null,
      payment_type: paymentType,
      final_amount: amount,
      signup_date: new Date().toISOString(),
      country: 'United Kingdom',
      voluntary_excess: vehicleDetails?.voluntaryExcess || vehicleDetails?.voluntary_excess || 0,
      ...(vehicleDetails || {})
    };

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(customerRecord, { onConflict: 'email' })
      .select()
      .single();

    if (customerError) {
      console.error('Error creating customer:', customerError);
      throw customerError;
    }

    console.log('Customer record created/updated:', customer.id);

    // Step 3: Create policy record
    console.log('Step 3: Creating policy record');
    
    const policyStartDate = new Date();
    const policyEndDate = new Date();
    
    // Calculate policy end date based on payment type
    switch (paymentType.toLowerCase()) {
      case 'monthly':
        policyEndDate.setMonth(policyEndDate.getMonth() + 1);
        break;
      case 'yearly':
        policyEndDate.setFullYear(policyEndDate.getFullYear() + 1);
        break;
      case 'twoyear':
      case 'two_year':
        policyEndDate.setFullYear(policyEndDate.getFullYear() + 2);
        break;
      case 'threeyear':
      case 'three_year':
        policyEndDate.setFullYear(policyEndDate.getFullYear() + 3);
        break;
      default:
        policyEndDate.setMonth(policyEndDate.getMonth() + 1);
    }

    const policyRecord = {
      customer_id: customer.id,
      email: customerEmail,
      plan_type: planType.toLowerCase(),
      payment_type: paymentType,
      policy_start_date: policyStartDate.toISOString(),
      policy_end_date: policyEndDate.toISOString(),
      status: 'active',
      stripe_session_id: paymentProvider === 'stripe' ? sessionId : null,
      bumper_order_id: paymentProvider === 'bumper' ? bumperOrderId : null,
      payment_amount: amount,
      payment_currency: currency,
      customer_full_name: customerName,
      document_type: vehicleType,
      pdf_document_path: documentPath,
      email_sent_status: 'pending'
    };

    const { data: policy, error: policyError } = await supabase
      .from('customer_policies')
      .insert(policyRecord)
      .select()
      .single();

    if (policyError) {
      console.error('Error creating policy:', policyError);
      throw policyError;
    }

    console.log('Policy created with warranty number:', policy.warranty_number);

    // Step 4: Log the payment event
    await supabase.rpc('log_warranty_event', {
      p_policy_id: policy.id,
      p_customer_id: customer.id,
      p_event_type: 'payment_received',
      p_event_data: {
        payment_provider: paymentProvider,
        session_id: sessionId,
        bumper_order_id: bumperOrderId,
        amount: amount,
        currency: currency,
        plan_type: planType,
        payment_type: paymentType
      },
      p_created_by: 'webhook'
    });

    // Step 5: Send welcome email with login credentials
    console.log('Step 5: Sending welcome email with login credentials');
    
    try {
      const welcomeEmailData = {
        email: customerEmail,
        planType: planType,
        paymentType: paymentType,
        policyNumber: policy.policy_number,
        registrationPlate: vehicleDetails?.registration_plate || vehicleDetails?.registrationPlate || '',
        customerName: customerName
      };

      const { data: welcomeResult, error: welcomeError } = await supabase.functions.invoke(
        'send-welcome-email',
        { body: welcomeEmailData }
      );

      if (welcomeError) {
        console.error('Failed to send welcome email:', welcomeError);
        // Update policy with email failure status
        await supabase
          .from('customer_policies')
          .update({ 
            email_sent_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', policy.id);

        // Log the email failure event
        await supabase.rpc('log_warranty_event', {
          p_policy_id: policy.id,
          p_customer_id: customer.id,
          p_event_type: 'welcome_email_failed',
          p_event_data: { error: welcomeError },
          p_created_by: 'system'
        });
      } else {
        console.log('Successfully sent welcome email with login details');
        // Update policy with email success status
        await supabase
          .from('customer_policies')
          .update({ 
            email_sent_status: 'sent',
            email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', policy.id);

        // Log the success event
        await supabase.rpc('log_warranty_event', {
          p_policy_id: policy.id,
          p_customer_id: customer.id,
          p_event_type: 'welcome_email_sent',
          p_event_data: { email: customerEmail },
          p_created_by: 'system'
        });
      }
    } catch (emailError) {
      console.error('Exception in welcome email process:', emailError);
      // Don't fail the whole process if welcome email fails
    }

    console.log('=== Warranty Purchase Processing Complete ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      customerId: customer.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in warranty purchase processing:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);