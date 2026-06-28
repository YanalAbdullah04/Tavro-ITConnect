import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Building2, LockKeyhole, Mail, Phone, UserRound, Github } from "lucide-react";

import {
  AuthCommandButton,
  AuthFormPanel,
  AuthShell,
  AuthStoryPanel,
  AuthTextField,
  RolePathSelector,
  type SignupRole,
} from "@/components/public/TavroAuth";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/account";
import { getApiErrorMessages } from "@/lib/api/client";
import { getDashboardPathForRole, getRoleFromToken, setAuthSession } from "@/lib/api/auth";
import type { RegistrationAuthResponse } from "@/lib/api/types";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<SignupRole>("student");
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    githubUsername: ""
  });
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const handleRegistrationSuccess = (response: RegistrationAuthResponse) => {
    if (!response.isSuccess) {
      (response.errors?.length ? response.errors : ["Registration failed."]).forEach((message) => {
        toast({ title: "Registration failed", description: message, variant: "destructive" });
      });
      return;
    }

    if (!response.token) {
      toast({
        title: "Account created",
        description: "Your account was created. Please sign in to continue.",
      });
      navigate("/login", { replace: true });
      return;
    }

    setAuthSession(response.token, response.expiration);
    const role = response.userRole ?? getRoleFromToken(response.token);

    if (!role) {
      toast({
        title: "Account created",
        description: "Your account was created, but no role was returned. Please sign in.",
      });
      navigate("/login", { replace: true });
      return;
    }

    const label = activeRole === "student" ? studentData.name.trim() || studentData.email.trim() : companyData.name.trim() || companyData.email.trim();
    localStorage.setItem("userDisplayName", label);
    localStorage.setItem("userEmail", activeRole === "student" ? studentData.email.trim() : companyData.email.trim());

    toast({ title: "Account created", description: "Welcome to Tavro. Redirecting to your dashboard..." });
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  const mutationOptions = {
    onSuccess: handleRegistrationSuccess,
    onError: (error: unknown) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Registration failed", description: message, variant: "destructive" });
      });
    },
  };

  const studentMutation = useMutation({ mutationFn: accountApi.registerTrainee, ...mutationOptions });
  const companyMutation = useMutation({ mutationFn: accountApi.registerCompany, ...mutationOptions });

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    studentMutation.mutate(studentData);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    companyMutation.mutate(companyData);
  };

  return (
    <AuthShell visual={<AuthStoryPanel variant="signup" activeRole={activeRole} />}>
      <AuthFormPanel
        eyebrow="New Tavro route"
        title="Choose your Tavro path."
        description={
          <>
            <span className="sm:hidden">Start as a trainee or create a company workspace.</span>
            <span className="hidden sm:inline">
              Start as a trainee or create a company workspace. Mentors join through a company email invite.
            </span>
          </>
        }
        footer={
          <p className="text-sm text-muted-foreground">
            Already on a path?{" "}
            <Link to="/login" className="font-medium text-primary transition hover:text-primary/80">
              Continue your path
            </Link>
          </p>
        }
      >
        <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as SignupRole)} className="w-full">
          <RolePathSelector activeRole={activeRole} />

          <TabsContent value="student" className="mt-0">
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Account details</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AuthTextField
                  id="student-name"
                  label="Full name"
                  icon={UserRound}
                  placeholder="Your name"
                  value={studentData.name}
                  onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                  required
                />
                <AuthTextField
                  id="student-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@email.com"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  required
                />
                <AuthTextField
                  id="student-phone"
                  label="Phone number"
                  icon={Phone}
                  type="tel"
                  placeholder="+20 123 456 7890"
                  value={studentData.phone}
                  onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                  required
                />
                <AuthTextField
                  id="student-github"
                  label="GitHub username"
                  icon={Github}
                  placeholder="Your GitHub username"
                  value={studentData.githubUsername}
                  onChange={(e) => setStudentData({ ...studentData, githubUsername: e.target.value })}
                  required
                />
                <AuthTextField
                  id="student-password"
                  label="Password"
                  icon={LockKeyhole}
                  type="password"
                  placeholder="Create a strong password"
                  value={studentData.password}
                  onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  required
                />
              </div>
              <AuthCommandButton type="submit" isLoading={studentMutation.isPending} disabled={studentMutation.isPending}>
                {studentMutation.isPending ? "Starting path..." : "Start trainee path"}
              </AuthCommandButton>
            </form>
          </TabsContent>

          <TabsContent value="company" className="mt-0">
            <form onSubmit={handleCompanySubmit} className="space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Account details</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AuthTextField
                  id="company-name"
                  label="Company name"
                  icon={Building2}
                  placeholder="Company name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  required
                />
                <AuthTextField
                  id="company-email"
                  label="Company email"
                  icon={Mail}
                  type="email"
                  placeholder="company@business.com"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  required
                />
                <AuthTextField
                  id="company-phone"
                  label="Phone number"
                  icon={Phone}
                  type="tel"
                  placeholder="+20 123 456 7890"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  required
                />
                <AuthTextField
                  id="company-password"
                  label="Password"
                  icon={LockKeyhole}
                  type="password"
                  placeholder="Create a strong password"
                  value={companyData.password}
                  onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
                  required
                />
              </div>
              <AuthCommandButton type="submit" isLoading={companyMutation.isPending} disabled={companyMutation.isPending}>
                {companyMutation.isPending ? "Starting path..." : "Create company path"}
              </AuthCommandButton>
            </form>
          </TabsContent>

          <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/10 p-3 sm:p-4">
            <p className="text-sm font-semibold text-foreground">Mentor joining Tavro?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              <span className="sm:hidden">Mentors join by company email link.</span>
              <span className="hidden sm:inline">Mentors join through an email link sent by their company.</span>
            </p>
          </div>
        </Tabs>
      </AuthFormPanel>
    </AuthShell>
  );
}
