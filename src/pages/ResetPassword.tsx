import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingLink, setIsValidatingLink] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle PKCE flow for password reset
  useEffect(() => {
    const handlePasswordReset = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect_to');

      console.log('Password reset params:', { tokenHash, type, redirectTo });

      if (tokenHash && type === 'recovery') {
        try {
          console.log('Verifying OTP for password recovery...');
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (error) {
            console.error('OTP verification error:', error);
            setError(`Invalid or expired reset link: ${error.message}`);
            setIsValidatingLink(false);
            return;
          }

          if (data.session) {
            console.log('Password recovery session established');
            setIsPasswordRecovery(true);
            setIsValidatingLink(false);
          } else {
            console.log('No session after OTP verification');
            setError("Failed to establish password reset session. Please try again.");
            setIsValidatingLink(false);
          }
        } catch (err) {
          console.error('Error during OTP verification:', err);
          setError("Invalid or expired reset link. Please request a new password reset.");
          setIsValidatingLink(false);
        }
      } else {
        // Check if user is already authenticated (implicit flow)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Existing session found');
          setIsPasswordRecovery(true);
          setIsValidatingLink(false);
        } else {
          console.log('No valid reset parameters or session');
          setError("Invalid or expired reset link. Please request a new password reset.");
          setIsValidatingLink(false);
        }
      }
    };

    handlePasswordReset();
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message || "Failed to reset password. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log('Password updated successfully');
      setIsSuccess(true);
      toast({
        title: "Password reset successfully!",
        description: "Your password has been updated. You can now sign in with your new password.",
      });

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state while validating the reset link
  if (isValidatingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-900">mytuta</span>
            </div>
          </div>

          {/* Loading Card */}
          <Card className="p-8 bg-white shadow-xl border-0 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Validating Reset Link
            </h2>
            
            <p className="text-slate-600">
              Please wait while we verify your password reset link...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-900">mytuta</span>
            </div>
          </div>

          {/* Success Card */}
          <Card className="p-8 bg-white shadow-xl border-0 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Password Reset Successfully!
            </h2>
            
            <p className="text-slate-600 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/signin')}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-6 text-lg"
              >
                Sign In Now
              </Button>
              
              <p className="text-sm text-slate-500">
                Redirecting to sign in page in a few seconds...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900">mytuta</span>
          </div>
          <p className="text-slate-600">Reset your password to continue learning.</p>
        </div>

        {/* Reset Password Card */}
        <Card className="p-8 bg-white shadow-xl border-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Reset Password
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password */}
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            {/* Password Match Indicator */}
            {password && confirmPassword && (
              <div className="text-sm">
                {password === confirmPassword ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Passwords do not match
                  </div>
                )}
              </div>
            )}

            {/* Reset Password Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-6 text-lg"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          {/* Back to Sign In */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/signin')}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              disabled={isLoading}
            >
              ← Back to Sign In
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;