import React, { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  onSignUpSuccess?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onSignUpSuccess }) => {
  // Persist form state in sessionStorage to prevent loss on remount
  const [isSignUp, setIsSignUp] = useState(() => {
    const saved = sessionStorage.getItem('authFormMode');
    return saved === 'signup';
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleToggle = (newMode: boolean) => {
    setIsSignUp(newMode);
    sessionStorage.setItem('authFormMode', newMode ? 'signup' : 'signin');
  };

  const handleSignUpSuccess = () => {
    setSignUpSuccess(true);
    // Clear the saved form mode on successful signup
    sessionStorage.removeItem('authFormMode');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Strategize+
          </h1>
          <p className="text-gray-600 mt-2">
            Build your business plans with AI-powered insights
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {isSignUp ? (
              <SignUpForm onSuccess={handleSignUpSuccess} />
            ) : (
              <SignInForm />
            )}

            {!signUpSuccess && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>
                <Button
                  variant="link"
                  onClick={() => handleToggle(!isSignUp)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
