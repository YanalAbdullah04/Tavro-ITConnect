import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BellRing,
  Briefcase,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Eye,
  Github,
  GitPullRequestArrow,
  MessageSquareText,
  Route,
  User,
} from "lucide-react";

import { ApiError, getApiErrorMessages } from "@/lib/api/client";
import { traineeApi } from "@/lib/api/trainee";
import type { TaskSubmissionDto } from "@/lib/api/types";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/auth";
import { useGitHub } from "@/hooks/useGitHub";
import GitHubConnect from "@/components/github/GitHubConnect";
import RepositorySelector from "@/components/github/RepositorySelector";
import CodeViewer from "@/components/github/CodeViewer";
import type { SelectedRepo } from "@/lib/api/github";
import { cn } from "@/lib/utils";

interface MissionTask {
  taskAssignmentId?: string | null;
  taskTitle?: string | null;
  status?: string | null;
  assigedAtDate?: string | null;
  backendSubmission?: TaskSubmissionDto | null;
  savedSubmission?: SelectedRepo | null;
  isSubmitted: boolean;
  feedback?: string | null;
  grad?: string | null;
}

function getRepoParts(repoUrl?: string | null) {
  if (!repoUrl) return { owner: null, name: null };
  const segments = repoUrl.trim().replace(/\/$/, "").split("/").filter(Boolean);
  return {
    owner: segments.length >= 2 ? segments[segments.length - 2] : null,
    name: segments.length >= 1 ? segments[segments.length - 1] : null,
  };
}

function getSubmissionRepo(taskAssignmentId: string | null | undefined, submission?: TaskSubmissionDto | null) {
  if (!submission) return null;

  const parsed = getRepoParts(submission.githubRepoUrl);
  const owner = parsed.owner;
  const repoName = submission.githubRepo || parsed.name;
  const branch = submission.githubBranch;

  if (!taskAssignmentId || !owner || !repoName || !branch) return null;

  return {
    repoId: `${owner}/${repoName}`,
    repoName,
    owner,
    fullName: `${owner}/${repoName}`,
    htmlUrl: submission.githubRepoUrl,
    defaultBranch: null,
    branch,
  } satisfies SelectedRepo;
}

function isSubmittedStatus(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("submitted") || normalized.includes("approved") || normalized.includes("complete");
}

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "Not assigned";
}

function durationText(start?: string | null, end?: string | null) {
  if (!start || !end) return "Not assigned";

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime <= startTime) return "Not assigned";

  const days = Math.ceil((endTime - startTime) / 86_400_000);
  if (days >= 60) return `${Math.round(days / 30)} months`;
  if (days >= 14) return `${Math.round(days / 7)} weeks`;
  return `${days} days`;
}

function statusClass(task: MissionTask) {
  if (task.status === "Completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (task.isSubmitted) return "border-primary/30 bg-primary/10 text-primary";
  return "border-accent/30 bg-accent/10 text-accent";
}

function SummaryCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#0d1219]/88">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const submitPanelRef = useRef<HTMLDivElement | null>(null);
  const codeViewerRef = useRef<HTMLDivElement | null>(null);
  const [selectedTask, setSelectedTask] = useState("");
  const [activeViewerRepo, setActiveViewerRepo] = useState<SelectedRepo | null>(null);
  const [activeTab, setActiveTab] = useState("github");
  const [activeShortcut, setActiveShortcut] = useState("overview");
  const [evaluationTask, setEvaluationTask] = useState<MissionTask | null>(null);

  const {
    isConnected: githubConnected,
    isStale: githubStale,
    user: githubUser,
    selectedRepo,
    actionLoading: githubActionLoading,
    connectionRevision,
    statusError: githubStatusError,
    lastInstallMessage,
    connectGitHub,
    disconnectGitHub,
    selectRepository,
    clearRepository,
    refreshConnection,
    clearLastInstallMessage,
  } = useGitHub();

  const dashboardQuery = useQuery({
    queryKey: ["traineeDashboard"],
    queryFn: traineeApi.getDashboard,
  });

  const dashboard = dashboardQuery.data;
  const rawTasks = useMemo(() => dashboard?.traineeTaskAssigenmentDtos ?? [], [dashboard?.traineeTaskAssigenmentDtos]);
  const announcements = dashboard?.traineeAnnouncementDtos ?? [];

  const submissionQueries = useQueries({
    queries: rawTasks.map((task) => ({
      queryKey: ["traineeSubmission", task.taskAssignmentId],
      queryFn: async () => {
        try {
          return await traineeApi.getSubmission(task.taskAssignmentId ?? "");
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }
      },
      enabled: !!task.taskAssignmentId,
      retry: (failureCount: number, error: unknown) => !(error instanceof ApiError && error.status === 404) && failureCount < 2,
    })),
  });

  const submissionDataString = JSON.stringify(
    submissionQueries.map((q) => q.data ? { id: q.data.taskAssignmentId, repo: q.data.githubRepoUrl, branch: q.data.githubBranch } : null)
  );

  const backendSubmissionsByTaskId = useMemo(() => {
    const map = new Map<string, TaskSubmissionDto | null>();
    rawTasks.forEach((task, index) => {
      if (task.taskAssignmentId) map.set(task.taskAssignmentId, submissionQueries[index]?.data ?? null);
    });
    return map;
  }, [rawTasks, submissionDataString]);

  const tasks: MissionTask[] = useMemo(
    () =>
      rawTasks.map((task) => {
        const backendSubmission = task.taskAssignmentId ? backendSubmissionsByTaskId.get(task.taskAssignmentId) ?? null : null;
        const savedSubmission = getSubmissionRepo(task.taskAssignmentId, backendSubmission);
        const status = task.status === "Completed" ? "Completed" : (backendSubmission ? "Submitted" : task.status);

        return {
          ...task,
          backendSubmission,
          savedSubmission,
          status,
          isSubmitted: Boolean(backendSubmission) || isSubmittedStatus(status),
        };
      }),
    [backendSubmissionsByTaskId, rawTasks],
  );

  const selectedTaskData = tasks.find((task) => task.taskAssignmentId === selectedTask);
  const submittedTasks = tasks.filter((task) => task.isSubmitted);
  const progress = tasks.length ? Math.round((submittedTasks.length / tasks.length) * 100) : 0;
  const submissionSyncLoading = submissionQueries.some((query) => query.isLoading);
  const hasPathError = dashboardQuery.isError || submissionQueries.some((query) => query.isError);
  const isPathLoading = dashboardQuery.isLoading || submissionSyncLoading;

  const savedSubmissionKey = selectedTaskData?.savedSubmission
    ? `${selectedTaskData.savedSubmission.repoId}-${selectedTaskData.savedSubmission.branch}`
    : "";

  useEffect(() => {
    if (!selectedTask) {
      clearRepository();
      return;
    }

    if (selectedTaskData?.savedSubmission) {
      selectRepository(selectedTaskData.savedSubmission);
    } else {
      clearRepository();
    }
  }, [clearRepository, selectedTask, savedSubmissionKey, selectRepository]);

  useEffect(() => {
    if (activeTab !== "tasks") {
      setActiveViewerRepo(null);
    }
  }, [activeTab]);

  const prepareSubmission = (taskId?: string | null) => {
    if (!taskId) return;
    setSelectedTask(taskId);
    setActiveTab("github");
    setActiveShortcut("github");
    window.requestAnimationFrame(() => {
      submitPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleReviewCode = async (taskAssignmentId: string) => {
    try {
      const submission = await traineeApi.getSubmission(taskAssignmentId);
      const repo = getSubmissionRepo(taskAssignmentId, submission);
      if (!repo) throw new Error("Submission repository metadata is incomplete.");
      setActiveViewerRepo(repo);
      window.requestAnimationFrame(() => {
        codeViewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      toast({
        title: "Repository view unavailable",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    }
  };

  const handleRepoSelect = async (repo: SelectedRepo) => {
    if (!selectedTask) return;

    try {
      await traineeApi.submitTask({
        taskAssignmentId: selectedTask,
        githubRepo: repo.repoName,
        githubBranch: repo.branch,
        githubCommitSha: null,
        githubRepoUrl: repo.htmlUrl,
      });

      selectRepository(repo);
      toast({
        title: selectedTaskData?.isSubmitted ? "Submission updated" : "Repository submitted",
        description: "Your repository is saved and waiting for mentor checkpoint.",
      });

      queryClient.invalidateQueries({ queryKey: ["traineeDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["traineeSubmission", selectedTask] });
      queryClient.invalidateQueries({ queryKey: ["traineeTask", selectedTask] });
      setActiveTab("tasks");
      setActiveShortcut("tasks");
      window.requestAnimationFrame(() => {
        document.getElementById("student-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    }
  };

  const retrySync = () => {
    dashboardQuery.refetch();
    submissionQueries.forEach((query) => query.refetch());
  };

  const showWorkspaceArea = (area: string) => {
    if (area === "overview") {
      setActiveShortcut("overview");
      document.getElementById("student-overview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setActiveTab(area);
    setActiveShortcut(area);
    document.getElementById("student-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const hashTarget = location.hash.replace("#", "");
    if (!hashTarget) return;

    const timeout = window.setTimeout(() => {
      if (["overview", "tasks", "github", "messages"].includes(hashTarget)) {
        showWorkspaceArea(hashTarget === "overview" ? "overview" : hashTarget);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveShortcut(value);
  };

  const shellActions = (
    <>
      <Button variant="outline" onClick={() => navigate("/dashboard/profile")}>
        <User className="h-4 w-4" />
        My Profile
      </Button>
      <Button onClick={() => navigate("/dashboard/internships")}>
        <Briefcase className="h-4 w-4" />
        Browse Internships
      </Button>
    </>
  );

  return (
    <DashboardShell
      workspaceLabel="Trainee Workspace"
      title="Trainee Dashboard"
      subtitle="A simple view of your training, missions, GitHub submission, and messages."
      searchPlaceholder="Search missions, submissions, messages..."
      statusText="Path synced"
      profileHref="/dashboard/profile"
      actions={shellActions}
      navItems={[
        { label: "Overview", icon: Route, onClick: () => showWorkspaceArea("overview"), active: activeShortcut === "overview" },
        { label: "Tasks", icon: ClipboardList, onClick: () => showWorkspaceArea("tasks"), active: activeShortcut === "tasks" },
        { label: "GitHub", icon: Github, onClick: () => showWorkspaceArea("github"), active: activeShortcut === "github" },
        { label: "Messages", icon: BellRing, onClick: () => showWorkspaceArea("messages"), active: activeShortcut === "messages" },
        { label: "Opportunities", icon: Briefcase, href: "/dashboard/internships" },
        { label: "Profile", icon: User, href: "/dashboard/profile" },
      ]}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section id="student-overview" className="scroll-mt-24 space-y-6">
          {isPathLoading ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d1219]/88 p-5 text-sm text-muted-foreground">
              Loading your dashboard...
            </div>
          ) : null}

          {hasPathError ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Some Trainee signals could not sync.</p>
                <p className="mt-1 text-destructive/80">Retry to refresh missions and submissions.</p>
              </div>
              <Button variant="outline" onClick={retrySync} className="border-destructive/35 text-destructive hover:bg-destructive/10">
                Retry
              </Button>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard title="Training Progress" icon={GitPullRequestArrow}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="font-mono text-sm font-semibold text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {submittedTasks.length} of {tasks.length} mission{submittedTasks.length === 1 ? "" : "s"} submitted
                </p>
              </div>
            </SummaryCard>

            <SummaryCard title="Company & Mentor" icon={User}>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Program</span>
                  <span className="truncate font-medium text-foreground">{dashboard?.trainingSessionTitle || "Not assigned"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Mentor</span>
                  <span className="truncate font-medium text-foreground">{dashboard?.trainerName || "Not assigned"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">GitHub</span>
                  {dashboard?.trainerGitHubAccount ? (
                    <a href={dashboard.trainerGitHubAccount} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                      Mentor profile
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              </div>
            </SummaryCard>

            <SummaryCard title="Training Period" icon={CalendarDays}>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Start</span>
                  <span className="font-medium text-foreground">{formatDate(dashboard?.startDate)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">End</span>
                  <span className="font-medium text-foreground">{formatDate(dashboard?.endDate)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{durationText(dashboard?.startDate, dashboard?.endDate)}</span>
                </div>
              </div>
            </SummaryCard>
          </div>
        </section>

        <Tabs id="student-tabs" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl border border-white/10 bg-[#0d1219]/88 p-1">
            <TabsTrigger value="tasks" className="rounded-lg">Tasks</TabsTrigger>
            <TabsTrigger value="github" className="rounded-lg">GitHub</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-3">
            <Card className="border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Tasks
                </CardTitle>
                <CardDescription>Review your assigned missions and submission state.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
                    No missions assigned yet.
                  </div>
                ) : null}

                {tasks.map((task) => (
                  <div key={task.taskAssignmentId ?? task.taskTitle} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => task.taskAssignmentId && navigate(`/dashboard/task/${task.taskAssignmentId}`)}>
                      <p className="truncate text-sm font-semibold text-foreground transition hover:text-primary">{task.taskTitle || "Untitled mission"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", statusClass(task))}>
                          {task.status || "Pending"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Assigned {formatDate(task.assigedAtDate)}</span>
                      </div>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => task.taskAssignmentId && navigate(`/dashboard/task/${task.taskAssignmentId}`)} disabled={!task.taskAssignmentId}>
                        View
                      </Button>
                      {task.status === "Completed" ? (
                        <Button size="sm" onClick={() => setEvaluationTask(task)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                          Evaluation
                        </Button>
                      ) : null}
                      {task.isSubmitted && task.taskAssignmentId ? (
                        <Button size="sm" variant="outline" onClick={() => handleReviewCode(task.taskAssignmentId!)} className="border-primary/25 text-primary hover:bg-primary/10">
                          <Eye className="h-3.5 w-3.5" />
                          Repository
                        </Button>
                      ) : null}
                      <Button size="sm" onClick={() => prepareSubmission(task.taskAssignmentId)} disabled={!githubConnected || !task.taskAssignmentId}>
                        {task.isSubmitted ? "Update" : "Submit"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {activeViewerRepo ? (
              <div ref={codeViewerRef} className="scroll-mt-24 border-t border-border/40 pt-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <CodeViewer repo={activeViewerRepo} traineeId={getUserId() || ""} onClose={() => setActiveViewerRepo(null)} />
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="github" className="space-y-4">
            <GitHubConnect
              isConnected={githubConnected}
              isStale={githubStale}
              user={githubUser}
              actionLoading={githubActionLoading}
              statusError={githubStatusError}
              lastInstallMessage={lastInstallMessage}
              onConnect={connectGitHub}
              onDisconnect={disconnectGitHub}
              onRefresh={refreshConnection}
              onClearInstallMessage={clearLastInstallMessage}
            />

            <Card ref={submitPanelRef} className="scroll-mt-24 border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Github className="h-5 w-5 text-primary" />
                  Code Submission
                </CardTitle>
                <CardDescription>Select a mission, choose a repository, and submit it for mentor review.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Task to submit</label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task to submit" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.filter((task) => task.taskAssignmentId).map((task) => (
                        <SelectItem key={task.taskAssignmentId} value={task.taskAssignmentId!}>
                          {task.taskTitle || "Untitled mission"}{task.isSubmitted ? " (submitted)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!githubConnected ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
                    Connect GitHub above before selecting a repository.
                  </div>
                ) : selectedTask ? (
                  <RepositorySelector
                    selectedRepo={selectedRepo}
                    onSelect={handleRepoSelect}
                    refreshToken={connectionRevision}
                    submitLabel={selectedTaskData?.isSubmitted ? "Update Submission" : "Submit Repository"}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
                    Select a task to unlock repository submission.
                  </div>
                )}

                {selectedTaskData?.savedSubmission ? (
                  <div className="rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm text-muted-foreground">
                    Current submission: {selectedTaskData.savedSubmission.owner}/{selectedTaskData.savedSubmission.repoName} ({selectedTaskData.savedSubmission.branch})
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  Messages
                </CardTitle>
                <CardDescription>Training announcements from your current program.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
                    No messages yet.
                  </div>
                ) : null}
                {announcements.map((announcement) => (
                  <div key={announcement.announcementId ?? announcement.title} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="font-medium text-foreground">{announcement.title || "Untitled message"}</p>
                    {announcement.createdAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(announcement.createdAt)}</p>
                    ) : null}
                    {announcement.message ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{announcement.message}</p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!evaluationTask} onOpenChange={(open) => !open && setEvaluationTask(null)}>
        <DialogContent className="border-white/10 bg-[#0d1219] text-foreground sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
              Task Evaluation
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review your mentor's feedback and grade for this assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Title</label>
              <p className="mt-1 text-sm font-medium text-foreground">{evaluationTask?.taskTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Date</label>
                <p className="mt-1 text-sm text-foreground">{formatDate(evaluationTask?.assigedAtDate)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <div className="mt-1">
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Grade</label>
                <p className="mt-1 text-lg font-extrabold text-white">
                  {evaluationTask?.grad || <span className="text-sm font-normal text-muted-foreground italic">No grade provided</span>}
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Feedback</label>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {evaluationTask?.feedback || <span className="italic text-muted-foreground/60">No written feedback provided.</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setEvaluationTask(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
