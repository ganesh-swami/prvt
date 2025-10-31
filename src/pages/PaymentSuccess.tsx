import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
