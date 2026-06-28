import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BellRing, Briefcase, Calendar, CheckCircle, ClipboardList, Clock, FileText, Github, Route, User } from "lucide-react";

import { traineeApi } from "@/lib/api/trainee";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskDetails() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const taskQuery = useQuery({
    queryKey: ["traineeTask", taskId],
    queryFn: () => traineeApi.getTaskDetails(taskId ?? ""),
    enabled: !!taskId,
  });

  const task = taskQuery.data;

  return (
    <DashboardShell
      workspaceLabel="Trainee Workspace"
      title="Mission Details"
      subtitle="Inspect your current mission, due signal, and mentor context."
      searchPlaceholder="Search missions, submissions, opportunities..."
      statusText="Path synced"
      profileHref="/dashboard/profile"
      navItems={[
        { label: "Overview", icon: Route, href: "/dashboard/student#overview" },
        { label: "Tasks", icon: ClipboardList, href: "/dashboard/student#tasks", active: true },
        { label: "GitHub", icon: Github, href: "/dashboard/student#github" },
        { label: "Messages", icon: BellRing, href: "/dashboard/student#messages" },
        { label: "Opportunities", icon: Briefcase, href: "/dashboard/internships" },
        { label: "Profile", icon: User, href: "/dashboard/profile" },
      ]}
    >
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard/student")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Path
          </Button>

          {taskQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading mission...</p>}
          {taskQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load mission details.</p>}
          {!taskQuery.isLoading && !taskQuery.isError && !task && <p className="text-center text-muted-foreground">Mission not found.</p>}

          {task && (
            <div className="grid gap-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {task.status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <CardTitle className="text-2xl mb-2">{task.title || "Untitled mission"}</CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {task.deadline?.slice(0, 10)}</span>
                          <span>Assigned: {task.assignedAt?.slice(0, 10)}</span>
                          <span>Mentor: {task.trainerName || "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                    <Badge>{task.status ? "Completed" : "Open"}</Badge>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{task.description || "No description provided."}</p></CardContent>
              </Card>

              {task.notes && (
                <Card className="border-2">
                  <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground leading-relaxed">{task.notes}</p></CardContent>
                </Card>
              )}

              {task.attachmentUrl && (
                <Card className="border-2">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Attachment</CardTitle></CardHeader>
                  <CardContent>
                    <Button asChild variant="outline">
                      <a href={`${import.meta.env.VITE_API_BASE_URL ?? ""}${task.attachmentUrl}`} target="_blank" rel="noopener noreferrer">Open Attachment</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
    </DashboardShell>
  );
}
