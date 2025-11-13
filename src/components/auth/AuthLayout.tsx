import React, { useState, useEffect } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  onSignUpSuccess?: () => void;
}

type AuthMode = "signin" | "signup" | "forgot-password" | "reset-password";

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onSignUpSuccess }) => {
  // Persist form state in sessionStorage to prevent loss on remount
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const saved = sessionStorage.getItem("authFormMode");
    if (saved === "signup") return "signup";
    return "signin";
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

  // Check if user is in password reset flow (has access_token in URL)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      setIsResetPasswordMode(true);
      setAuthMode("reset-password");
    }
  }, []);

  const handleToggle = (newMode: AuthMode) => {
    setAuthMode(newMode);
    if (newMode === "signup") {
      sessionStorage.setItem("authFormMode", "signup");
    } else if (newMode === "signin") {
      sessionStorage.setItem("authFormMode", "signin");
    }
  };

  const handleSignUpSuccess = () => {
    setSignUpSuccess(true);
    // Clear the saved form mode on successful signup
    sessionStorage.removeItem("authFormMode");
  };

  const handleForgotPassword = () => {
    setAuthMode("forgot-password");
  };

  const handleBackToSignIn = () => {
    setAuthMode("signin");
  };

  const handleResetPasswordSuccess = () => {
    setAuthMode("signin");
    setIsResetPasswordMode(false);
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
            {authMode === "signin" && (
              <SignInForm onForgotPassword={handleForgotPassword} />
            )}
            {authMode === "signup" && (
              <SignUpForm onSuccess={handleSignUpSuccess} />
            )}
            {authMode === "forgot-password" && (
              <ForgotPasswordForm onBack={handleBackToSignIn} />
            )}
            {authMode === "reset-password" && (
              <ResetPasswordForm
                onSuccess={handleResetPasswordSuccess}
                onBack={handleBackToSignIn}
              />
            )}

            {!signUpSuccess && authMode !== "reset-password" && (
              <div className="mt-6 text-center">
                {authMode === "signin" && (
                  <>
                    <p className="text-sm text-gray-600">
                      Don't have an account?
                    </p>
                    <Button
                      variant="link"
                      onClick={() => handleToggle("signup")}
                      className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
                {authMode === "signup" && (
                  <>
                    <p className="text-sm text-gray-600">
                      Already have an account?
                    </p>
                    <Button
                      variant="link"
                      onClick={() => handleToggle("signin")}
                      className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                    >
                      Sign In
                    </Button>
                  </>
                )}
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
