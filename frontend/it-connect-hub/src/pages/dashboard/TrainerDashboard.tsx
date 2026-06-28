import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  ClipboardCheck,
  ClipboardList,
  GitPullRequestArrow,
  LayoutDashboard,
  MessageSquareText,
  Presentation,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { trainerApi } from "@/lib/api/trainer";
import type { StudentWithinTraining, TrainingDtoInTrainerOverview } from "@/lib/api/types";
import { getApiErrorMessages } from "@/lib/api/client";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 5;

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "Date unavailable";
}

function formatSignal(value: number | null | undefined) {
  return typeof value === "number" ? value : "-";
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "accent";
}) {
  return (
    <Card className="border-white/10 bg-[#0d1219]/88">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <span className={tone === "accent" ? "flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent" : "flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, copy, icon: Icon }: { title: string; copy: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md">{copy}</p>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  );
}

function Pager({
  page,
  totalPages,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages?: number;
  canPrevious?: boolean;
  canNext?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Page {page} of {Math.max(totalPages ?? 1, 1)}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!canPrevious} onClick={onPrevious}>Previous</Button>
        <Button variant="outline" size="sm" disabled={!canNext} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sessions");
  const [activeShortcut, setActiveShortcut] = useState("overview");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionPage, setSessionPage] = useState(1);
  const [traineeSearch, setTraineeSearch] = useState("");
  const [traineeSessionFilter, setTraineeSessionFilter] = useState("all");
  const [traineePage, setTraineePage] = useState(1);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementSessionFilter, setAnnouncementSessionFilter] = useState("all");
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [announcementForm, setAnnouncementForm] = useState({ trainingSessionId: "", title: "", message: "" });

  const dashboardQuery = useQuery({
    queryKey: ["trainerDashboard"],
    queryFn: trainerApi.getDashboard,
  });

  const sessionsQuery = useQuery({
    queryKey: ["trainerSessions", { sessionSearch, sessionPage }],
    queryFn: () => trainerApi.getSessions({ SearchString: sessionSearch, CurentPage: sessionPage, PageSize: PAGE_SIZE }),
  });

  const traineesQuery = useQuery({
    queryKey: ["trainerTrainees", { traineeSearch, traineeSessionFilter, traineePage }],
    queryFn: () => trainerApi.getTrainees({
      SearchString: traineeSearch,
      TrainingSessionId: traineeSessionFilter === "all" ? undefined : traineeSessionFilter,
      CurentPage: traineePage,
      PageSize: PAGE_SIZE,
    }),
  });

  const announcementsQuery = useQuery({
    queryKey: ["trainerAnnouncements", { announcementSearch, announcementSessionFilter, announcementPage }],
    queryFn: () => trainerApi.getAnnouncements({
      SearchString: announcementSearch,
      TrainingSessionId: announcementSessionFilter === "all" ? undefined : announcementSessionFilter,
      CurentPage: announcementPage,
      PageSize: PAGE_SIZE,
    }),
  });

  const dashboardSessions = dashboardQuery.data?.trainingDto ?? [];
  const sessions = sessionsQuery.data?.items ?? [];
  const trainees = traineesQuery.data?.items ?? [];
  const announcements = announcementsQuery.data?.items ?? [];
  const sessionCount = dashboardQuery.data?.totalTraningCount ?? sessionsQuery.data?.totalCount ?? sessions.length;
  const traineeCount = dashboardQuery.data?.assigingStudentsCount ?? traineesQuery.data?.totalCount ?? trainees.length;
  const taskCount = dashboardSessions.some((session) => typeof session.taskCount === "number")
    ? dashboardSessions.reduce((total, session) => total + (session.taskCount ?? 0), 0)
    : null;
  const pendingCheckpointCount = dashboardQuery.data?.pendingEvaluationsCount ?? null;
  const isWorkspaceLoading = dashboardQuery.isLoading || sessionsQuery.isLoading || traineesQuery.isLoading;
  const hasSyncError = dashboardQuery.isError || sessionsQuery.isError || traineesQuery.isError;
  const selectedAnnouncementSessionId = announcementForm.trainingSessionId || dashboardSessions[0]?.id || "";

  const announcementMutation = useMutation({
    mutationFn: () => trainerApi.createAnnouncement({
      trainingSessionId: selectedAnnouncementSessionId,
      title: announcementForm.title.trim(),
      message: announcementForm.message.trim(),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trainerAnnouncements"] });
      setAnnouncementForm({ trainingSessionId: selectedAnnouncementSessionId, title: "", message: "" });
      toast({ title: "Announcement sent", description: "Trainees in this session can now see it." });
    },
    onError: (error) => {
      toast({
        title: "Announcement failed",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    },
  });

  const retrySync = () => {
    dashboardQuery.refetch();
    sessionsQuery.refetch();
    traineesQuery.refetch();
    announcementsQuery.refetch();
  };

  const submitAnnouncement = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedAnnouncementSessionId || !announcementForm.title.trim() || !announcementForm.message.trim()) {
      toast({
        title: "Announcement details required",
        description: "Choose a session and add both a title and a message.",
        variant: "destructive",
      });
      return;
    }

    announcementMutation.mutate();
  };

  const showWorkspaceArea = (area: string) => {
    if (area === "overview") {
      setActiveShortcut("overview");
      document.getElementById("overview")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const nextTab = area === "evaluations" ? "checkpoints" : area;
    setActiveTab(nextTab);
    setActiveShortcut(area);
    document.getElementById("mentor-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const hashTarget = location.hash.replace("#", "");
    if (!hashTarget) return;

    const timeout = window.setTimeout(() => {
      if (["overview", "sessions", "trainees", "evaluations", "announcements"].includes(hashTarget)) {
        showWorkspaceArea(hashTarget);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveShortcut(value === "checkpoints" ? "evaluations" : value);
  };

  const shellActions = (
    <>
      <Button variant="outline" onClick={() => navigate("/dashboard/trainer/evaluations")}>
        <GitPullRequestArrow className="h-4 w-4" />
        Evaluations
      </Button>
      <Button onClick={() => navigate("/dashboard/trainer/profile")}>
        <UserRound className="h-4 w-4" />
        My Profile
      </Button>
    </>
  );

  return (
    <DashboardShell
      workspaceLabel="Mentor Workspace"
      title="Mentor Dashboard"
      subtitle="A clear view of your sessions, trainees, tasks, announcements, and checkpoint work."
      searchPlaceholder="Search trainees, sessions, checkpoints..."
      statusText="Checkpoint workspace synced"
      profileHref="/dashboard/trainer/profile"
      actions={shellActions}
      navItems={[
        { label: "Overview", icon: LayoutDashboard, onClick: () => showWorkspaceArea("overview"), active: activeShortcut === "overview" },
        { label: "My Sessions", icon: Presentation, onClick: () => showWorkspaceArea("sessions"), active: activeShortcut === "sessions" },
        { label: "Trainees", icon: Users, onClick: () => showWorkspaceArea("trainees"), active: activeShortcut === "trainees" },
        { label: "Evaluation Center", icon: GitPullRequestArrow, href: "/dashboard/trainer/evaluations", active: activeShortcut === "evaluations" },
        { label: "Announcements", icon: BellRing, onClick: () => showWorkspaceArea("announcements"), active: activeShortcut === "announcements" },
      ]}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section id="overview" className="scroll-mt-24 space-y-6">
          {isWorkspaceLoading ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d1219]/88 p-5 text-sm text-muted-foreground">
              Loading mentor workspace...
            </div>
          ) : null}

          {hasSyncError ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-destructive/35 bg-destructive/10 p-5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Some mentor signals could not sync.</p>
                <p className="mt-1 text-destructive/80">Retry to refresh sessions, trainees, and checkpoint queue.</p>
              </div>
              <Button variant="outline" onClick={retrySync} className="border-destructive/35 text-destructive hover:bg-destructive/10">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-4">
            <SummaryCard title="Assigned Sessions" value={formatSignal(sessionCount)} description="Training programs you guide." icon={Presentation} />
            <SummaryCard title="Active Trainees" value={formatSignal(traineeCount)} description="People in your sessions." icon={Users} />
            <SummaryCard title="Tasks" value={formatSignal(taskCount)} description="Visible task load." icon={ClipboardCheck} />
            <SummaryCard title="Checkpoints" value={formatSignal(pendingCheckpointCount)} description="Submissions waiting for review." icon={GitPullRequestArrow} tone="accent" />
          </div>
        </section>

        <Tabs id="mentor-tabs" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid h-11 w-full grid-cols-4 rounded-xl border border-white/10 bg-[#0d1219]/88 p-1">
            <TabsTrigger value="sessions" className="rounded-lg">Sessions</TabsTrigger>
            <TabsTrigger value="trainees" className="rounded-lg">Trainees</TabsTrigger>
            <TabsTrigger value="checkpoints" className="rounded-lg">Evaluations</TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-lg">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card className="border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Presentation className="h-5 w-5 text-primary" />
                  My Sessions
                </CardTitle>
                <CardDescription>{sessionsQuery.data?.totalCount ?? 0} session(s) found</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SearchBox
                  value={sessionSearch}
                  onChange={(value) => {
                    setSessionSearch(value);
                    setSessionPage(1);
                  }}
                  placeholder="Filter sessions by name, track, or location..."
                />

                {sessionsQuery.isLoading ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">Loading sessions...</p>
                ) : null}

                {!sessionsQuery.isLoading && sessions.length === 0 ? (
                  <EmptyState title="No sessions found." copy="Try a different filter or wait for your company to assign a program." icon={Presentation} />
                ) : null}

                <div className="space-y-3">
                  {sessions.map((session: TrainingDtoInTrainerOverview) => (
                    <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{session.name || "Untitled session"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(session.startDate)} to {formatDate(session.endDate)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{session.totalStudents ?? 0} trainees</Badge>
                          <Badge variant="outline">{session.taskCount ?? 0} tasks</Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/dashboard/trainer/training/${session.id}`)}>
                        Open Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Pager
                  page={sessionsQuery.data?.curentPage ?? sessionPage}
                  totalPages={sessionsQuery.data?.totalPages}
                  canPrevious={sessionsQuery.data?.havePreviousPage}
                  canNext={sessionsQuery.data?.haveNextPage}
                  onPrevious={() => setSessionPage((current) => Math.max(1, current - 1))}
                  onNext={() => setSessionPage((current) => current + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainees">
            <Card className="border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Trainees
                </CardTitle>
                <CardDescription>{traineesQuery.data?.totalCount ?? 0} trainee(s) found</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <SearchBox
                    value={traineeSearch}
                    onChange={(value) => {
                      setTraineeSearch(value);
                      setTraineePage(1);
                    }}
                    placeholder="Filter trainees by name, email, or session..."
                  />
                  <Select
                    value={traineeSessionFilter}
                    onValueChange={(value) => {
                      setTraineeSessionFilter(value);
                      setTraineePage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All sessions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sessions</SelectItem>
                      {dashboardSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>{session.name || "Untitled session"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {traineesQuery.isLoading ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">Loading trainees...</p>
                ) : null}

                {!traineesQuery.isLoading && trainees.length === 0 ? (
                  <EmptyState title="No trainees found." copy="Try a different filter or session selection." icon={Users} />
                ) : null}

                <div className="space-y-3">
                  {trainees.map((trainee: StudentWithinTraining) => (
                    <div key={`${trainee.trainingId ?? "session"}-${trainee.studentId}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{trainee.studentName || "Unnamed trainee"}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{trainee.email || "Email unavailable"} - {trainee.trainingTitle || "No session assigned"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{trainee.numberOfTasks ?? 0} tasks</Badge>
                        {trainee.studentId && trainee.trainingId ? (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/trainer/training/${trainee.trainingId}/student/${trainee.studentId}/tasks`)}>
                            View Tasks
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <Pager
                  page={traineesQuery.data?.curentPage ?? traineePage}
                  totalPages={traineesQuery.data?.totalPages}
                  canPrevious={traineesQuery.data?.havePreviousPage}
                  canNext={traineesQuery.data?.haveNextPage}
                  onPrevious={() => setTraineePage((current) => Math.max(1, current - 1))}
                  onNext={() => setTraineePage((current) => current + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkpoints">
            <Card className="border-white/10 bg-[#0d1219]/88">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitPullRequestArrow className="h-5 w-5 text-primary" />
                  Evaluation Center
                </CardTitle>
                <CardDescription>Submitted repositories and feedback work in one place.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-accent/25 bg-accent/10 p-4">
                  <p className="text-sm font-semibold text-foreground">{formatSignal(pendingCheckpointCount)} deliverables need evaluation.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Open the dedicated evaluation section to filter by task, trainee, session, and status.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => navigate("/dashboard/trainer/evaluations")}>
                    Open Evaluation Section
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("trainees")}>
                    View Trainees
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-white/10 bg-[#0d1219]/88">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Send className="h-5 w-5 text-primary" />
                    Send Announcement
                  </CardTitle>
                  <CardDescription>Send a message to trainees in one assigned session.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitAnnouncement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcement-session">Session</Label>
                      <Select
                        value={selectedAnnouncementSessionId}
                        onValueChange={(value) => setAnnouncementForm((current) => ({ ...current, trainingSessionId: value }))}
                        disabled={dashboardSessions.length === 0}
                      >
                        <SelectTrigger id="announcement-session">
                          <SelectValue placeholder="Choose session" />
                        </SelectTrigger>
                        <SelectContent>
                          {dashboardSessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>{session.name || "Untitled session"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcement-title">Title</Label>
                      <Input
                        id="announcement-title"
                        value={announcementForm.title}
                        onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Schedule update"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcement-message">Message</Label>
                      <Textarea
                        id="announcement-message"
                        value={announcementForm.message}
                        onChange={(event) => setAnnouncementForm((current) => ({ ...current, message: event.target.value }))}
                        placeholder="Share the update trainees need to see."
                      />
                    </div>
                    <Button type="submit" disabled={announcementMutation.isPending || dashboardSessions.length === 0} className="w-full">
                      <Send className="h-4 w-4" />
                      {announcementMutation.isPending ? "Sending..." : "Send Announcement"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-[#0d1219]/88">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BellRing className="h-5 w-5 text-primary" />
                    Announcement History
                  </CardTitle>
                  <CardDescription>{announcementsQuery.data?.totalCount ?? 0} announcement(s) found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                    <SearchBox
                      value={announcementSearch}
                      onChange={(value) => {
                        setAnnouncementSearch(value);
                        setAnnouncementPage(1);
                      }}
                      placeholder="Filter announcements..."
                    />
                    <Select
                      value={announcementSessionFilter}
                      onValueChange={(value) => {
                        setAnnouncementSessionFilter(value);
                        setAnnouncementPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sessions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sessions</SelectItem>
                        {dashboardSessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>{session.name || "Untitled session"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {announcementsQuery.isLoading ? (
                    <p className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">Loading announcements...</p>
                  ) : null}

                  {!announcementsQuery.isLoading && announcements.length === 0 ? (
                    <EmptyState title="No announcements found." copy="Sent announcements will appear here for review." icon={BellRing} />
                  ) : null}

                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.announcementId} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{announcement.title || "Untitled announcement"}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{announcement.trainingSessionName || "Session unavailable"} - {formatDate(announcement.createdAt)}</p>
                          </div>
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{announcement.message}</p>
                      </div>
                    ))}
                  </div>

                  <Pager
                    page={announcementsQuery.data?.curentPage ?? announcementPage}
                    totalPages={announcementsQuery.data?.totalPages}
                    canPrevious={announcementsQuery.data?.havePreviousPage}
                    canNext={announcementsQuery.data?.haveNextPage}
                    onPrevious={() => setAnnouncementPage((current) => Math.max(1, current - 1))}
                    onNext={() => setAnnouncementPage((current) => current + 1)}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
