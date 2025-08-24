import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import AdminLoginDebug from '@/components/admin/AdminLoginDebug';

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isInviteFlow, setIsInviteFlow] = useState(false);

  // Handle invitation flow
  const handleInvitation = async (token: string) => {
    try {
      // Verify invitation token and get email
      const { data: invitation, error } = await supabase
        .from('admin_invitations')
        .select('email, expires_at')
        .eq('invitation_token', token)
        .eq('accepted_at', null)
        .single();

      if (error || !invitation) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has already been used.",
          variant: "destructive",
        });
        return;
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        toast({
          title: "Expired Invitation",
          description: "This invitation link has expired.",
          variant: "destructive",
        });
        return;
      }

      // Pre-fill email and show success message
      setEmail(invitation.email);
      toast({
        title: "Invitation Accepted",
        description: "Please sign in with your credentials from the invitation email.",
      });

      // Mark invitation as accepted
      await supabase
        .from('admin_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('invitation_token', token);

    } catch (error: any) {
      console.error('Error processing invitation:', error);
      toast({
        title: "Error",
        description: "There was an error processing your invitation.",
        variant: "destructive",
      });
    }
  };

  // Check for invitation parameters
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'invite') {
      setIsInviteFlow(true);
      handleInvitation(token);
    }
  }, [searchParams]);

  useEffect(() => {
    // Set up auth state listener to handle sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // User signed out, stay on auth page
          return;
        }
        
        if (session) {
          console.log("User logged in, checking role for redirect");
          
          // Check if user is admin (only admins have roles in user_roles table)
          const { data: roleData, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle(); // Use maybeSingle instead of single to handle no results

        // If there's an error (other than no results) or user has any admin role, redirect to admin
        if (!error && roleData && ['admin', 'member', 'viewer', 'guest'].includes(roleData.role)) {
          navigate('/admin-dashboard', { replace: true });
        } else {
          // No role found means regular customer
          navigate('/customer-dashboard', { replace: true });
        }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting to sign in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message, error);
        toast({
          title: "Sign In Failed",
          description: error.message || "Authentication failed. Please check your credentials.",
          variant: "destructive",
        });
        return;
      }

      console.log("Sign in successful:", data.user?.email);
      console.log("Session:", data.session);
      
      // Check user role and navigate
      if (data.session) {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results

        toast({
          title: "Success",
          description: "You have been signed in successfully!",
        });

        // If there's an error (other than no results) or user has any admin role, redirect to admin
        if (!error && roleData && ['admin', 'member', 'viewer', 'guest'].includes(roleData.role)) {
          console.log("Admin user detected, redirecting to admin dashboard");
          navigate('/admin-dashboard', { replace: true });
        } else {
          console.log("Regular user detected, redirecting to customer dashboard");
          navigate('/customer-dashboard', { replace: true });
        }
      }
      
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting to sign up with:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/customer-dashboard`
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }

      console.log("Sign up successful:", data.user?.email);
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully! Please check your email to confirm your account.",
      });

      // For immediate testing, navigate to customer dashboard
      if (data.session) {
        navigate('/customer-dashboard', { replace: true });
      }
      
    } catch (error: any) {
      console.error("Sign up failed:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col">
      {/* Trustpilot header */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <TrustpilotHeader />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <img 
              src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
              alt="BuyAWarranty" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-xl md:text-2xl">Welcome</CardTitle>
            <CardDescription className="text-sm">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={handleResetPassword}
                      className="text-sm"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Debug tool for admin login issues */}
        <div className="mt-8">
          <AdminLoginDebug />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;