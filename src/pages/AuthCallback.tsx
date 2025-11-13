import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "recovery">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash from the URL (contains access_token after verification)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        console.log(
          "Auth callback - Type:",
          type,
          "Has access_token:",
          !!accessToken
        );

        // After Supabase verifies the email link, it redirects here with:
        // - access_token (session token)
        // - type=signup (for email verification) or type=recovery (for password reset)
        // The verification already happened server-side
        if (accessToken && (type === "signup" || type === "recovery")) {
          if (type === "recovery") {
            // Password recovery flow - establish session from tokens first
            console.log(
              "Password recovery verified, establishing session..."
            );
            
            // Manually set the session from the tokens since detectSessionInUrl is false
            if (refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              console.log("Session established from tokens");
            }
            
            setStatus("recovery");
            return;
          } else {
            // Email verification flow (signup)
            setStatus("success");
            setMessage("✅ Email verified successfully! You can now sign in.");

            // Sign out immediately so user must sign in manually
            console.log("Email verified, signing out user...");
            await supabase.auth.signOut().catch((e) => {
              console.warn("Sign out error:", e);
            });

            console.log("User signed out, ready to sign in");
          }
        } else {
          // No valid tokens in URL - invalid or expired link
          setStatus("error");
          setMessage(
            "❌ Invalid or expired verification link. Please request a new one."
          );
          console.log("Invalid callback - no access token or wrong type");
        }
      } catch (error) {
        console.error("Unexpected error during email verification:", error);
        setStatus("error");
        setMessage(
          `❌ Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Strategize+
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8">
          {status === "recovery" && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <ResetPasswordForm
                onSuccess={() => {
                  sessionStorage.setItem("authFormMode", "signin");
                  window.location.href = "/";
                }}
                onBack={() => {
                  window.location.href = "/";
                }}
              />
            </div>
          )}

          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-700 font-medium text-center">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <Alert className="border-green-200 bg-green-50 mb-4">
                <AlertDescription className="text-green-800 font-medium">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="space-y-3 mt-6">
                <p className="text-sm text-gray-600">
                  Your email has been verified. You can now sign in with your
                  credentials.
                </p>
                <button
                  onClick={() => {
                    sessionStorage.setItem("authFormMode", "signin");
                    window.location.href = "/";
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Go to Sign In
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="font-medium">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="space-y-3 mt-6">
                <p className="text-sm text-gray-600">
                  Please try again or contact support if the issue persists.
                </p>
                <button
                  onClick={() => {
                    sessionStorage.setItem("authFormMode", "signup");
                    window.location.href = "/";
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Back to Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
