import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  ClipboardList,
  Eye,
  Github,
  GitPullRequestArrow,
  LayoutDashboard,
  MessageSquareText,
  Presentation,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessages } from "@/lib/api/client";
import { traineeApi } from "@/lib/api/trainee";
import { trainerApi } from "@/lib/api/trainer";
import type { TrainerTaskSubmissionsDto } from "@/lib/api/types";
import CodeViewer from "@/components/github/CodeViewer";
import type { SelectedRepo } from "@/lib/api/github";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "—";
}

function getRepoParts(repoUrl?: string | null) {
  if (!repoUrl) return { owner: null, name: null };
  const segments = repoUrl.trim().replace(/\/$/, "").split("/").filter(Boolean);
  const owner = segments.length >= 2 ? segments[segments.length - 2] : null;
  const name = segments.length >= 1 ? segments[segments.length - 1] : null;
  return { owner, name };
}

function getRepoForTask(taskSubmission: TrainerTaskSubmissionsDto): SelectedRepo | null {
  const parsed = getRepoParts(taskSubmission.githubRepoUrl);
  const owner = taskSubmission.githubOwner || parsed.owner;
  const repoName = taskSubmission.githubRepo || parsed.name;
  const branch = taskSubmission.githubBranch;

  if (!owner || !repoName || !branch || !taskSubmission.githubRepoUrl) return null;

  return {
    repoId: taskSubmission.taskAssignmentId || repoName,
    repoName,
    owner,
    fullName: `${owner}/${repoName}`,
    htmlUrl: taskSubmission.githubRepoUrl,
    defaultBranch: null,
    branch,
  };
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase();
  if (normalized === "submitted") return "border-accent/35 bg-accent/10 text-accent";
  if (normalized === "evaluated") return "border-primary/35 bg-primary/10 text-primary";
  return "border-white/10 text-muted-foreground";
}

export default function StudentTasks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { id: routeId, studentId } = useParams();
  const traineeId = studentId ?? routeId ?? "";

  const [activeViewerRepo, setActiveViewerRepo] = useState<SelectedRepo | null>(null);
  const codeViewerRef = useRef<HTMLDivElement | null>(null);
  const [evaluatingTask, setEvaluatingTask] = useState<TrainerTaskSubmissionsDto | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState("");
  const [evaluationGrade, setEvaluationGrade] = useState("");

  const profileQuery = useQuery({
    queryKey: ["mentorTraineeProfile", traineeId],
    queryFn: () => traineeApi.getProfileById(traineeId),
    enabled: !!traineeId,
  });

  const tasksQuery = useQuery({
    queryKey: ["mentorTraineeTasks", traineeId],
    queryFn: () => traineeApi.getTasksByTraineeId(traineeId),
    enabled: !!traineeId,
  });

  const evaluationMutation = useMutation({
    mutationFn: () => {
      if (!evaluatingTask?.taskAssignmentId) throw new Error("Task is unavailable.");

      return trainerApi.evaluateTask(evaluatingTask.taskAssignmentId, {
        feedback: evaluationFeedback.trim() || null,
        grade: evaluationGrade.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mentorTraineeTasks", traineeId] });
      await queryClient.invalidateQueries({ queryKey: ["trainerDashboard"] });
      setEvaluatingTask(null);
      setEvaluationFeedback("");
      setEvaluationGrade("");
      toast({ title: "Evaluation saved", description: "The trainee checkpoint has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Evaluation failed",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    },
  });

  const profile = profileQuery.data;
  const tasks = tasksQuery.data?.trainerTaskSubmissionsDtos ?? [];
  const loading = profileQuery.isLoading || tasksQuery.isLoading;
  const hasError = profileQuery.isError || tasksQuery.isError;

  const refreshTraineeSignals = () => {
    profileQuery.refetch();
    tasksQuery.refetch();
  };

  const openEvaluation = (taskSubmission: TrainerTaskSubmissionsDto) => {
    setEvaluatingTask(taskSubmission);
    setEvaluationFeedback(taskSubmission.feedback ?? "");
    setEvaluationGrade(taskSubmission.grade ?? "");
  };

  const openCodeViewer = (repo: SelectedRepo) => {
    setActiveViewerRepo(repo);
    window.requestAnimationFrame(() => {
      codeViewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const saveEvaluation = () => {
    if (!evaluationFeedback.trim() && !evaluationGrade.trim()) {
      toast({
        title: "Evaluation details required",
        description: "Add feedback or a grade before saving the checkpoint.",
        variant: "destructive",
      });
      return;
    }

    evaluationMutation.mutate();
  };

  return (
    <DashboardShell
      workspaceLabel="Mentor Workspace"
      title="Trainee Tasks"
      subtitle="Inspect a trainee profile, submitted repositories, and mentor checkpoint readiness."
      searchPlaceholder="Search trainees, sessions, checkpoints..."
      statusText="Checkpoint workspace synced"
      navItems={[
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard/trainer#overview" },
        { label: "My Sessions", icon: Presentation, href: "/dashboard/trainer#sessions" },
        { label: "Trainees", icon: Users, href: "/dashboard/trainer#trainees", active: true },
        { label: "Evaluation Center", icon: GitPullRequestArrow, href: "/dashboard/trainer/evaluations" },
        { label: "Announcements", icon: BellRing, href: "/dashboard/trainer#announcements" },
      ]}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button size="sm" variant="secondary" onClick={refreshTraineeSignals} disabled={loading || !traineeId} className="h-9">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {!traineeId ? (
          <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
            Open this screen from a trainee inside one of your assigned sessions to inspect tasks.
          </div>
        ) : null}

        {loading ? (
          <div className="animate-pulse rounded-xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
            Retrieving trainee tasks...
          </div>
        ) : null}

        {hasError ? (
          <div className="flex flex-col gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Some mentor signals could not sync.</p>
              <p className="mt-1 text-sm text-destructive/80">Retry to refresh sessions, trainees, and checkpoint queue.</p>
            </div>
            <Button variant="outline" onClick={refreshTraineeSignals} className="border-destructive/35 text-destructive hover:bg-destructive/10">
              <RefreshCw className="h-4 w-4" />
              Retry sync
            </Button>
          </div>
        ) : null}

        {!loading && !hasError && profile ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card lg:col-span-4">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-muted">
                  {profile.imageUrl ? (
                    <img src={profile.imageUrl} alt={profile.name || "Trainee"} className="h-full w-full object-cover" />
                  ) : (
                    <ClipboardList className="h-10 w-10 text-primary" />
                  )}
                </div>
                <CardTitle className="mt-3 text-lg">{profile.name || "Unnamed trainee"}</CardTitle>
                <CardDescription>{profile.skills || "Trainee"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <span className="font-medium text-foreground">{profile.phone || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">GitHub Installation</span>
                  {profile.githubInstallationId ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                      Linked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive">Unlinked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Task Submissions & Repositories
                  </CardTitle>
                  <CardDescription>Review tasks, inspect submitted repositories, and guide the next mentor checkpoint.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">No tasks waiting yet.</p>
                      <p className="mt-1">Submitted repositories will appear here when trainees are ready for a checkpoint.</p>
                    </div>
                  ) : null}

                  {tasks.map((taskSubmission) => {
                    const repo = getRepoForTask(taskSubmission);
                    const status = taskSubmission.status?.toLowerCase();
                    const canEvaluate = status === "submitted" || status === "evaluated";
                    return (
                      <div key={taskSubmission.taskAssignmentId ?? taskSubmission.taskTitle} className="flex flex-col gap-3 rounded-xl border border-border/65 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground">{taskSubmission.taskTitle || "Untitled task"}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={getStatusClass(taskSubmission.status)}>
                              {taskSubmission.status || "Status unavailable"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Deadline {formatDate(taskSubmission.deadline)}</span>
                            {taskSubmission.submittedAt ? (
                              <span className="text-xs text-muted-foreground">Submitted {formatDate(taskSubmission.submittedAt)}</span>
                            ) : null}
                          </div>
                          {taskSubmission.githubRepoUrl ? (
                            <a
                              href={taskSubmission.githubRepoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-1 truncate text-xs text-primary hover:underline"
                            >
                              <Github className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {taskSubmission.githubRepo || taskSubmission.githubRepoUrl}
                                {taskSubmission.githubBranch ? ` (${taskSubmission.githubBranch})` : ""}
                              </span>
                            </a>
                          ) : null}
                          {taskSubmission.feedback ? (
                            <p className="mt-2 text-xs text-muted-foreground">Mentor checkpoint: {taskSubmission.feedback}</p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {repo ? (
                            <Button size="sm" onClick={() => openCodeViewer(repo)} className="gap-1.5 self-start shadow-sm sm:self-center">
                              <Eye className="h-4 w-4" />
                              View Code
                            </Button>
                          ) : (
                            <span className="flex items-center gap-1 self-start text-xs text-muted-foreground sm:self-center">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              {taskSubmission.githubRepo || taskSubmission.githubRepoUrl ? "Repository metadata incomplete" : "No repository submitted yet"}
                            </span>
                          )}
                          {canEvaluate ? (
                            <Button
                              size="sm"
                              variant={status === "evaluated" ? "outline" : "default"}
                              onClick={() => openEvaluation(taskSubmission)}
                              disabled={!taskSubmission.taskAssignmentId}
                            >
                              <MessageSquareText className="h-4 w-4" />
                              {status === "evaluated" ? "Update Evaluation" : "Evaluate"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {activeViewerRepo ? (
          <div ref={codeViewerRef} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-5 pt-4 duration-300">
            <CodeViewer repo={activeViewerRepo} traineeId={traineeId} onClose={() => setActiveViewerRepo(null)} />
          </div>
        ) : null}

        <Dialog open={!!evaluatingTask} onOpenChange={(open) => { if (!open && !evaluationMutation.isPending) setEvaluatingTask(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{evaluatingTask?.status === "Evaluated" ? "Update Evaluation" : "Evaluate Task"}</DialogTitle>
              <DialogDescription>
                Save mentor feedback for {evaluatingTask?.taskTitle || "this task"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-feedback">Feedback</Label>
                <Textarea
                  id="task-feedback"
                  value={evaluationFeedback}
                  onChange={(event) => setEvaluationFeedback(event.target.value)}
                  placeholder="Summarize what worked and what to improve next."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-grade">Grade</Label>
                <Input
                  id="task-grade"
                  value={evaluationGrade}
                  onChange={(event) => setEvaluationGrade(event.target.value)}
                  placeholder="A, 95, Pass..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEvaluatingTask(null)} disabled={evaluationMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={saveEvaluation} disabled={evaluationMutation.isPending}>
                {evaluationMutation.isPending ? "Saving..." : "Save Evaluation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
