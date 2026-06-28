import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  ClipboardCheck,
  ClipboardList,
  Eye,
  GitPullRequestArrow,
  LayoutDashboard,
  MessageSquareText,
  Presentation,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { trainerApi } from "@/lib/api/trainer";
import { getApiErrorMessages } from "@/lib/api/client";
import type { TrainerTaskSubmissionsDto } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import CodeViewer from "@/components/github/CodeViewer";
import type { SelectedRepo } from "@/lib/api/github";

const PAGE_SIZE = 8;

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "Date unavailable";
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase();
  if (normalized === "submitted") return "border-accent/35 bg-accent/10 text-accent";
  if (normalized === "evaluated") return "border-primary/35 bg-primary/10 text-primary";
  return "border-white/10 text-muted-foreground";
}

function getRepoParts(repoUrl?: string | null) {
  if (!repoUrl) return { owner: null, name: null };
  const segments = repoUrl.trim().replace(/\/$/, "").split("/").filter(Boolean);
  return {
    owner: segments.length >= 2 ? segments[segments.length - 2] : null,
    name: segments.length >= 1 ? segments[segments.length - 1] : null,
  };
}

function getRepoForTask(taskSubmission: TrainerTaskSubmissionsDto): SelectedRepo | null {
  const parsed = getRepoParts(taskSubmission.githubRepoUrl);
  const owner = taskSubmission.githubOwner || parsed.owner;
  const repoName = taskSubmission.githubRepo || parsed.name;
  const branch = taskSubmission.githubBranch;

  if (!owner || !repoName || !branch || !taskSubmission.githubRepoUrl) return null;

  return {
    repoId: taskSubmission.taskAssignmentId || `${owner}/${repoName}`,
    repoName,
    owner,
    fullName: `${owner}/${repoName}`,
    htmlUrl: taskSubmission.githubRepoUrl,
    defaultBranch: null,
    branch,
  };
}

interface ActiveCodeView {
  repo: SelectedRepo;
  traineeId: string;
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search tasks, trainees, sessions..." className="pl-9" />
    </div>
  );
}

export default function TrainerEvaluations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Submitted");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [traineeFilter, setTraineeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [evaluatingTask, setEvaluatingTask] = useState<TrainerTaskSubmissionsDto | null>(null);
  const [activeCodeView, setActiveCodeView] = useState<ActiveCodeView | null>(null);
  const codeViewerRef = useRef<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["trainerDashboard"],
    queryFn: trainerApi.getDashboard,
  });

  const metaQuery = useQuery({
    queryKey: ["trainerEvaluationMeta"],
    queryFn: trainerApi.getEvaluationMeta,
  });

  const evaluationsQuery = useQuery({
    queryKey: ["trainerEvaluations", { search, statusFilter, sessionFilter, traineeFilter, page }],
    queryFn: () => trainerApi.getEvaluations({
      SearchString: search,
      Status: statusFilter === "all" ? undefined : statusFilter,
      TrainingSessionId: sessionFilter === "all" ? undefined : sessionFilter,
      TraineeId: traineeFilter === "all" ? undefined : traineeFilter,
      CurentPage: page,
      PageSize: PAGE_SIZE,
    }),
  });

  const evaluationMutation = useMutation({
    mutationFn: () => {
      if (!evaluatingTask?.taskAssignmentId) throw new Error("Task is unavailable.");

      return trainerApi.evaluateTask(evaluatingTask.taskAssignmentId, {
        feedback: feedback.trim() || null,
        grade: grade.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trainerEvaluations"] });
      await queryClient.invalidateQueries({ queryKey: ["trainerEvaluationMeta"] });
      await queryClient.invalidateQueries({ queryKey: ["trainerDashboard"] });
      setEvaluatingTask(null);
      setFeedback("");
      setGrade("");
      toast({ title: "Evaluation saved", description: "The deliverable has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Evaluation failed",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    },
  });

  const deliverables = evaluationsQuery.data?.items ?? [];
  const sessions = metaQuery.data?.trainings ?? [];
  const trainees = metaQuery.data?.trainees ?? [];
  const isLoading = dashboardQuery.isLoading || metaQuery.isLoading || evaluationsQuery.isLoading;
  const hasError = dashboardQuery.isError || metaQuery.isError || evaluationsQuery.isError;

  const openEvaluation = (task: TrainerTaskSubmissionsDto) => {
    setEvaluatingTask(task);
    setFeedback(task.feedback ?? "");
    setGrade(task.grade ?? "");
  };

  const openCodeViewer = (repo: SelectedRepo, traineeId?: string | null) => {
    if (!traineeId) {
      toast({
        title: "Repository view unavailable",
        description: "This deliverable is missing trainee information.",
        variant: "destructive",
      });
      return;
    }

    setActiveCodeView({ repo, traineeId });
    window.requestAnimationFrame(() => {
      codeViewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const saveEvaluation = () => {
    if (!feedback.trim() && !grade.trim()) {
      toast({
        title: "Evaluation details required",
        description: "Add feedback or a grade before saving.",
        variant: "destructive",
      });
      return;
    }

    evaluationMutation.mutate();
  };

  const updateFilter = (action: () => void) => {
    action();
    setPage(1);
  };

  return (
    <DashboardShell
      workspaceLabel="Mentor Workspace"
      title="Evaluation Section"
      subtitle="Review every deliverable, filter the queue, and save mentor feedback."
      searchPlaceholder="Search deliverables, trainees, sessions..."
      statusText="Evaluation workspace synced"
      navItems={[
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard/trainer" },
        { label: "My Sessions", icon: Presentation, href: "/dashboard/trainer#sessions" },
        { label: "Trainees", icon: Users, href: "/dashboard/trainer#trainees" },
        { label: "Evaluation Center", icon: GitPullRequestArrow, href: "/dashboard/trainer/evaluations", active: true },
        { label: "Announcements", icon: BellRing, href: "/dashboard/trainer#announcements" },
      ]}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/trainer")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mentor Workspace
        </Button>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-white/10 bg-[#0d1219]/88">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pending evaluations</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{metaQuery.data?.pendingEvaluations ?? dashboardQuery.data?.pendingEvaluationsCount ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#0d1219]/88">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Evaluated</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{metaQuery.data?.evaluated ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#0d1219]/88">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Shown deliverables</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{evaluationsQuery.data?.totalCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-[#0d1219]/88">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Deliverables
            </CardTitle>
            <CardDescription>Filter by status, session, trainee, or task text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_220px_220px]">
              <SearchBox value={search} onChange={(value) => updateFilter(() => setSearch(value))} />
              <Select value={statusFilter} onValueChange={(value) => updateFilter(() => setStatusFilter(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Evaluated">Evaluated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sessionFilter} onValueChange={(value) => updateFilter(() => setSessionFilter(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sessions</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.trainingSessionId} value={session.trainingSessionId}>{session.trainingSessionName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={traineeFilter} onValueChange={(value) => updateFilter(() => setTraineeFilter(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Trainee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All trainees</SelectItem>
                  {trainees.map((trainee) => (
                    <SelectItem key={trainee.traineeId} value={trainee.traineeId}>{trainee.traineeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">Loading deliverables...</p>
            ) : null}

            {hasError ? (
              <div className="flex flex-col gap-3 rounded-xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                <span>Unable to load deliverables.</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    dashboardQuery.refetch();
                    metaQuery.refetch();
                    evaluationsQuery.refetch();
                  }}
                  className="border-destructive/35 text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : null}

            {!isLoading && !hasError && deliverables.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto mb-3 h-8 w-8" />
                <p className="font-medium text-foreground">No deliverables found.</p>
                <p className="mt-1 text-sm">Try a different filter or wait for trainees to submit their repositories.</p>
              </div>
            ) : null}

            <div className="space-y-3">
              {deliverables.map((deliverable) => {
                const status = deliverable.status?.toLowerCase();
                const canEvaluate = status === "submitted" || status === "evaluated";
                const repo = getRepoForTask(deliverable);

                return (
                  <div key={deliverable.taskAssignmentId} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{deliverable.taskTitle || "Untitled task"}</p>
                          <Badge variant="outline" className={getStatusClass(deliverable.status)}>
                            {deliverable.status || "Status unavailable"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {deliverable.traineeName || "Unnamed trainee"} - {deliverable.trainingSessionName || "Session unavailable"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Deadline {formatDate(deliverable.deadline)}</span>
                          {deliverable.submittedAt ? <span>Submitted {formatDate(deliverable.submittedAt)}</span> : null}
                          {deliverable.grade ? <span>Grade {deliverable.grade}</span> : null}
                        </div>
                        {deliverable.feedback ? (
                          <p className="mt-3 rounded-lg border border-primary/15 bg-primary/10 p-3 text-sm text-muted-foreground">{deliverable.feedback}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {repo ? (
                          <Button size="sm" variant="outline" onClick={() => openCodeViewer(repo, deliverable.traineeId)}>
                            <Eye className="h-4 w-4" />
                            Repository
                          </Button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            {deliverable.githubRepoUrl ? "Repository metadata incomplete" : "No repository"}
                          </span>
                        )}
                        {deliverable.trainingSessionId && deliverable.traineeId ? (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/trainer/training/${deliverable.trainingSessionId}/student/${deliverable.traineeId}/tasks`)}>
                            Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {canEvaluate ? (
                          <Button size="sm" onClick={() => openEvaluation(deliverable)}>
                            <MessageSquareText className="h-4 w-4" />
                            {status === "evaluated" ? "Update" : "Evaluate"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeCodeView ? (
              <div ref={codeViewerRef} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-5 border-t border-white/10 pt-4 duration-300">
                <CodeViewer repo={activeCodeView.repo} traineeId={activeCodeView.traineeId} onClose={() => setActiveCodeView(null)} />
              </div>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Page {evaluationsQuery.data?.curentPage ?? page} of {Math.max(evaluationsQuery.data?.totalPages ?? 1, 1)}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!evaluationsQuery.data?.havePreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={!evaluationsQuery.data?.haveNextPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!evaluatingTask} onOpenChange={(open) => { if (!open && !evaluationMutation.isPending) setEvaluatingTask(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{evaluatingTask?.status === "Evaluated" ? "Update Evaluation" : "Evaluate Deliverable"}</DialogTitle>
              <DialogDescription>
                Save feedback for {evaluatingTask?.taskTitle || "this task"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliverable-feedback">Feedback</Label>
                <Textarea
                  id="deliverable-feedback"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Summarize what worked and what to improve next."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverable-grade">Grade</Label>
                <Input
                  id="deliverable-grade"
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
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
