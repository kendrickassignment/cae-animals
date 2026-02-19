import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import caeLogoDark from "@/assets/cae-logo-dark.png";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
        toast.success("Account created! Please check your email to verify.");
      } else {
        await signIn(email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - brand */}
      <div className="hidden md:flex w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center">
          <img src={caeLogoDark} alt="CAE Logo" className="h-16 mb-4 mix-blend-multiply" />
          <p className="font-nav text-sm text-primary-foreground/70 tracking-widest mb-6">
            CORPORATE ACCOUNTABILITY ENGINE
          </p>
          <p className="font-body text-primary-foreground/80 max-w-sm mx-auto">
            Exposing corporate greenwashing with AI-powered analysis of sustainability reports.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="md:hidden text-center mb-8">
            <div className="bg-primary rounded-lg p-4 mb-4 inline-block">
              <h1 className="font-display text-3xl text-primary-foreground">CAE</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setIsSignUp(false)}
              className={`font-nav text-xs tracking-widest pb-3 border-b-2 transition-colors duration-affa ${
                !isSignUp ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`font-nav text-xs tracking-widest pb-3 border-b-2 transition-colors duration-affa ${
                isSignUp ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label className="font-body text-sm">Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required className="font-body" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-body text-sm">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required className="font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="font-body" />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label className="font-body text-sm">Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="font-body" />
              </div>
            )}
            <Button type="submit" className="w-full font-body font-bold text-sm py-5" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
