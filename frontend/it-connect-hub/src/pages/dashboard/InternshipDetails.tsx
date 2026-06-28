import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BellRing, Briefcase, Building2, Calendar, CheckCircle, ClipboardList, Github, MapPin, Route, User, Users } from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { internshipApi } from "@/lib/api/internship";
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InternshipDetails() {
  const navigate = useNavigate();
  const { internshipId } = useParams<{ internshipId: string }>();
  const { toast } = useToast();

  const internshipQuery = useQuery({
    queryKey: ["internship", internshipId],
    queryFn: () => internshipApi.getInternship(internshipId ?? ""),
    enabled: !!internshipId,
  });

  const applyMutation = useMutation({
    mutationFn: () => internshipApi.apply(internshipId ?? ""),
    onSuccess: () => toast({ title: "Application submitted", description: "Your application was sent successfully." }),
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Application failed", description: message, variant: "destructive" });
      });
    },
  });

  const internship = internshipQuery.data;

  return (
    <DashboardShell
      workspaceLabel="Trainee Workspace"
      title="Opportunity Details"
      subtitle="Inspect the company path, requirements, and application signal before applying."
      searchPlaceholder="Search missions, submissions, opportunities..."
      statusText="Path synced"
      profileHref="/dashboard/profile"
      navItems={[
        { label: "Overview", icon: Route, href: "/dashboard/student#overview" },
        { label: "Tasks", icon: ClipboardList, href: "/dashboard/student#tasks" },
        { label: "GitHub", icon: Github, href: "/dashboard/student#github" },
        { label: "Messages", icon: BellRing, href: "/dashboard/student#messages" },
        { label: "Opportunities", icon: Briefcase, href: "/dashboard/internships", active: true },
        { label: "Profile", icon: User, href: "/dashboard/profile" },
      ]}
    >
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard/internships")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>

          {internshipQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading opportunity...</p>}
          {internshipQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load opportunity details.</p>}
          {!internshipQuery.isLoading && !internshipQuery.isError && !internship && <p className="text-center text-muted-foreground">Opportunity not found.</p>}

          {internship && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-3xl mb-3">{internship.title || "Untitled opportunity"}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{internship.companyName || "Company not provided"}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{internship.location || "No location"}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{internship.applicatantCount ?? 0} candidates</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {internship.startDate?.slice(0, 10)} to {internship.endDate?.slice(0, 10)}
                  </div>
                </CardContent>
              </Card>

              {[
                ["Required Skills", internship.reqSkills],
                ["Responsibilities", internship.responsibility],
                ["Benefits", internship.benefits],
              ].map(([title, value]) => (
                <Card key={title} className="border-2">
                  <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground leading-relaxed">{value || "Not provided."}</p></CardContent>
                </Card>
              ))}

              {!internship.applied && (
                <Button size="lg" className="w-full" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending || applyMutation.isSuccess || !internshipId}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {applyMutation.isPending ? "Applying..." : applyMutation.isSuccess ? "Applied" : "Apply Now"}
                </Button>
              )}
            </div>
          )}
        </div>
    </DashboardShell>
  );
}
