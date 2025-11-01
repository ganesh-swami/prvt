import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Simulate checking payment status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium">Processing your payment...</p>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your subscription</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success case
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Your subscription has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Thank you for subscribing! Your payment has been processed successfully.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground font-mono break-all">
                  Session ID: {sessionId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">What's next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Access all premium features</li>
                <li>Create unlimited projects</li>
                <li>Export your data in multiple formats</li>
                <li>Get priority support</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => navigate("/pricing")} 
                variant="outline"
                className="w-full"
              >
                View Plan Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Canceled case
  if (canceled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <XCircle className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Payment Canceled</CardTitle>
            <CardDescription className="text-base">
              Your subscription process was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                You canceled the payment process. No charges have been made to your account.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Want to try again?</h4>
              <p className="text-sm text-muted-foreground">
                You can always upgrade your plan later from the pricing page.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={() => navigate("/pricing")} 
                className="w-full"
                size="lg"
              >
                View Plans & Pricing
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error/Unknown case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <AlertCircle className="h-10 w-10 text-gray-600" />
          </div>
          <CardTitle className="text-2xl">Payment Status Unknown</CardTitle>
          <CardDescription className="text-base">
            We couldn't determine your payment status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              If you completed a payment, please check your email for confirmation or contact support.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/pricing")} 
              variant="outline"
              className="w-full"
            >
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
