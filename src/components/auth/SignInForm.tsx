import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

interface SignInFormProps {
  onForgotPassword?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      toast.success("Signed in successfully!");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to sign in";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 flex flex-col justify-start items-start">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative w-full">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2 flex flex-col items-start">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative w-full">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pl-10"
            required
          />
        </div>
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium text-sm mt-1"
          >
            Forgot password?
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
