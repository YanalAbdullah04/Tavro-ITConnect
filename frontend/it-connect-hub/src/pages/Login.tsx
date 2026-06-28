import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/account";
import { getApiErrorMessages } from "@/lib/api/client";
import { clearAuthSession, getDashboardPathForRole, getRoleFromToken, setAuthSession } from "@/lib/api/auth";
import {
  AuthCommandButton,
  AuthFormPanel,
  AuthShell,
  AuthStoryPanel,
  authInputClass,
  authLabelClass,
} from "@/components/public/TavroAuth";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const loginMutation = useMutation({
    mutationFn: accountApi.login,
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Login failed", description: message, variant: "destructive" });
      });
    },
    onSuccess: (response) => {
      if (!response.isSuccess) {
        (response.errors?.length ? response.errors : ["Login failed. Please check your credentials."]).forEach((message) => {
          toast({ title: "Login failed", description: message, variant: "destructive" });
        });
        return;
      }

      if (!response.token) {
        toast({
          title: "Login failed",
          description: "Login succeeded but no token was returned.",
          variant: "destructive",
        });
        return;
      }

      setAuthSession(response.token, response.expiration);
      localStorage.setItem("userEmail", formData.email.trim());
      // TODO: Swagger LoginAuthResponse has no userRole while RegistrationAuthResponse does.
      // The backend must include a role in LoginAuthResponse or JWT claims.
      const role = getRoleFromToken(response.token);

      if (!role) {
        clearAuthSession();
        toast({
          title: "Login failed",
          description: "Cannot determine user role from token. Backend must include role in LoginAuthResponse or JWT claims.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Login successful", description: "Welcome back. Redirecting to your dashboard..." });
      navigate(getDashboardPathForRole(role), { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <AuthShell visual={<AuthStoryPanel variant="login" />}>
      <AuthFormPanel
        eyebrow="Return checkpoint"
        title="Continue your path."
        description="Your missions, checkpoints, and progress are waiting."
        footer={
          <p className="text-sm text-muted-foreground">
            New to Tavro?{" "}
            <Link to="/signup" className="font-medium text-primary transition hover:text-primary/80">
              Choose your path
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group space-y-2">
            <Label htmlFor="email" className={authLabelClass}>
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${authInputClass} pl-11`}
                required
              />
            </div>
          </div>

          <div className="group space-y-2">
            <Label htmlFor="password" className={authLabelClass}>
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${authInputClass} pl-11`}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <label className="flex min-h-11 items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/15 bg-white/[0.04] accent-[hsl(var(--primary))]"
              />
              <span>Remember this route</span>
            </label>
            <a href="#" className="inline-flex min-h-11 items-center font-medium text-primary transition hover:text-primary/80">
              Forgot password?
            </a>
          </div>

          <AuthCommandButton type="submit" isLoading={loginMutation.isPending} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Opening path..." : "Continue path"}
          </AuthCommandButton>
        </form>
      </AuthFormPanel>
    </AuthShell>
  );
}
