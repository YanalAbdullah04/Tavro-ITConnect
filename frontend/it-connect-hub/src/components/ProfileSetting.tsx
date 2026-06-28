import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, Github } from "lucide-react";
import { setAuthSession } from "@/lib/api/auth";
import { accountApi } from "@/lib/api/account";
import { getApiErrorMessages } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import {
  AuthCommandButton,
  AuthFormPanel,
  AuthShell,
  AuthStoryPanel,
} from "@/components/public/TavroAuth";
import { AuthTextField } from "@/components/public/TavroAuth";

export function ProfileSetting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    gitHubAccount: "",
  });

  // Extract email from JWT Token and store session
  useEffect(() => {
    if (token) {
      setAuthSession(token);
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const parsedPayload = JSON.parse(decodedPayload);
        const userEmail =
          parsedPayload.email ||
          parsedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
          "";
        setEmail(userEmail);
      } catch (error) {
        console.error("Failed to parse token payload:", error);
      }
    }
  }, [token]);

  const updateMutation = useMutation({
    mutationFn: accountApi.setTrainerProfile,
    onSuccess: () => {
      toast({ title: "Setup complete", description: "Your password and GitHub account have been saved." });
      navigate("/dashboard/trainer", { replace: true });
    },
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Setup failed", description: message, variant: "destructive" });
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      toast({ title: "Setup failed", description: "Password is required.", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      password: formData.password,
      gitHubAccount: formData.gitHubAccount || null,
    });
  };

  return (
    <AuthShell visual={<AuthStoryPanel variant="login" />} hideNavbar>
      <AuthFormPanel
        eyebrow="Trainer onboarding"
        title="Complete Profile Setup"
        description={email ? `Set up your password and credentials for ${email}` : "Set up your credentials to get started"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthTextField
            id="password"
            label="Password"
            icon={LockKeyhole}
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <AuthTextField
            id="github"
            label="GitHub Account"
            icon={Github}
            type="text"
            placeholder="Enter your github username"
            value={formData.gitHubAccount}
            onChange={(e) => setFormData({ ...formData, gitHubAccount: e.target.value })}
          />

          <AuthCommandButton type="submit" isLoading={updateMutation.isPending} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Setting up path..." : "Save and Continue"}
          </AuthCommandButton>
        </form>
      </AuthFormPanel>
    </AuthShell>
  );
}
