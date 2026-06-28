import { AlertTriangle, ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, Plus, RefreshCw, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { applicantApi } from "@/lib/api/applicant";
import { postApi } from "@/lib/api/post";
import { trackApi } from "@/lib/api/track";
import { trainerApi } from "@/lib/api/trainer";
import { trainingSessionApi } from "@/lib/api/trainingSession";
import type { ApplicantResponse, PostResponse, TrackResponse, TrainingSessionResponse } from "@/lib/api/types";
import { MetricCard } from "@/components/dashboard/widgets/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function countSignal(isLoading: boolean, isError: boolean, value: number) {
  if (isLoading) return "...";
  if (isError) return "-";
  return value;
}

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "Not scheduled";
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() || "unknown";
}

function statusCount<T>(items: T[], status: string, getStatus: (item: T) => string | null | undefined) {
  const target = normalize(status);
  return items.filter((item) => normalize(getStatus(item)) === target).length;
}

function getAvailableSeats(session: TrainingSessionResponse) {
  return Math.max((session.seatsNumber ?? 0) - (session.registeredStudentsCount ?? 0), 0);
}

function getCapacityPercent(session: TrainingSessionResponse) {
  if (!session.seatsNumber) return 0;
  return Math.min(100, Math.round(((session.registeredStudentsCount ?? 0) / session.seatsNumber) * 100));
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 px-4 py-5 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; to: string };
  children: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#0d1219]/88">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {action ? (
            <Button asChild variant="outline" size="sm">
              <Link to={action.to}>
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function ShortcutLink({
  to,
  label,
  detail,
  icon: Icon,
  tone = "primary",
}: {
  to: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  tone?: "primary" | "accent";
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4 transition duration-200 hover:border-primary/35 hover:bg-primary/10"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
          tone === "accent" ? "border-accent/30 bg-accent/10 text-accent" : "border-primary/25 bg-primary/10 text-primary",
        )}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </Link>
  );
}

function CandidateRow({ applicant }: { applicant: ApplicantResponse }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{applicant.traineeName || "Unnamed candidate"}</p>
        <p className="truncate text-xs text-muted-foreground">{applicant.trackName || "No track"} - {formatDate(applicant.createdAt)}</p>
      </div>
      <Badge variant="outline">{applicant.status || "Unknown"}</Badge>
    </div>
  );
}

function OpportunityRow({ post }: { post: PostResponse }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{post.title || "Untitled opportunity"}</p>
        <p className="truncate text-xs text-muted-foreground">{post.numberOfApplicants ?? 0} applicant(s)</p>
      </div>
      <Badge variant="outline">{post.status || "Unknown"}</Badge>
    </div>
  );
}

function TrackRow({ track }: { track: TrackResponse }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{track.name || "Untitled track"}</p>
        <p className="truncate text-xs text-muted-foreground">{track.description || "No description provided"}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Badge variant="secondary">{track.numberOfTrainings ?? 0} sessions</Badge>
        <Badge variant="outline">{track.numberOfTrainees ?? 0} trainees</Badge>
      </div>
    </div>
  );
}

export function AdminOverviewSection() {
  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: postApi.getPosts });
  const sessionsQuery = useQuery({ queryKey: ["trainingSessions"], queryFn: trainingSessionApi.getTrainingSessions });
  const tracksQuery = useQuery({ queryKey: ["tracks"], queryFn: trackApi.getTracks });
  const trainersQuery = useQuery({ queryKey: ["trainers", { page: 1, pageSize: 5 }], queryFn: () => trainerApi.getTrainers({ CurentPage: 1, PageSize: 5 }) });
  const applicantsQuery = useQuery({ queryKey: ["applicants", { page: 1, pageSize: 100 }], queryFn: () => applicantApi.getApplicants({ CurentPage: 1, PageSize: 100 }) });

  const posts = postsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const tracks = tracksQuery.data ?? [];
  const trainers = trainersQuery.data;
  const applicants = applicantsQuery.data;
  const loadedApplicants = applicants?.items ?? [];

  const isError = postsQuery.isError || sessionsQuery.isError || tracksQuery.isError || trainersQuery.isError || applicantsQuery.isError;
  const totalRegisteredTrainees = sessions.reduce((sum, session) => sum + (session.registeredStudentsCount ?? 0), 0);
  const totalSeats = sessions.reduce((sum, session) => sum + (session.seatsNumber ?? 0), 0);
  const availableSeats = Math.max(totalSeats - totalRegisteredTrainees, 0);
  const activeSessions = sessions.filter((session) => normalize(session.trainingStatus) === "active");
  const atCapacitySessions = sessions.filter((session) => (session.seatsNumber ?? 0) > 0 && getAvailableSeats(session) === 0);
  const pendingCandidates = statusCount<ApplicantResponse>(loadedApplicants, "Pending", (item) => item.status);
  const acceptedCandidates = statusCount<ApplicantResponse>(loadedApplicants, "Accepted", (item) => item.status);
  const publishedPosts = statusCount<PostResponse>(posts, "Published", (item) => item.status);
  const draftPosts = posts.length - publishedPosts;
  const candidateCount = applicants?.totalCount ?? 0;
  const mentorCount = trainers?.totalCount ?? 0;
  const tracksWithoutSessions = tracks.filter((track) => (track.numberOfTrainings ?? 0) === 0);
  const sessionsByCapacity = [...sessions].sort((a, b) => getCapacityPercent(b) - getCapacityPercent(a)).slice(0, 5);
  const recentApplicants = [...loadedApplicants]
    .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
    .slice(0, 5);
  const recentPosts = posts.slice(0, 5);
  const visibleTracks = tracks.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isError ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-destructive">Some workspace signals could not sync.</p>
                <p className="mt-1 text-sm text-muted-foreground">Retry to refresh tracks, sessions, mentors, opportunities, and candidates.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-destructive/30 bg-background/40 text-destructive hover:bg-destructive/10"
              onClick={() => {
                postsQuery.refetch();
                sessionsQuery.refetch();
                tracksQuery.refetch();
                trainersQuery.refetch();
                applicantsQuery.refetch();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Retry sync
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Sessions" value={countSignal(sessionsQuery.isLoading, sessionsQuery.isError, activeSessions.length)} note={`${availableSeats} open seats`} icon={GraduationCap} />
        <MetricCard label="Candidates" value={countSignal(applicantsQuery.isLoading, applicantsQuery.isError, candidateCount)} note={`${pendingCandidates} pending review`} icon={UserCheck} trend={pendingCandidates > 0 ? "up" : "neutral"} />
        <MetricCard label="Published Opportunities" value={countSignal(postsQuery.isLoading, postsQuery.isError, publishedPosts)} note={`${draftPosts} draft or paused`} icon={BriefcaseBusiness} />
        <MetricCard label="Mentors" value={countSignal(trainersQuery.isLoading, trainersQuery.isError, mentorCount)} note={`${totalRegisteredTrainees} trainees enrolled`} icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <ShortcutLink to="/dashboard/company/trainings" label="Plan Session" detail="Create or update session capacity" icon={Plus} />
        <ShortcutLink to="/dashboard/company/applicants" label="Review Candidates" detail={`${pendingCandidates} waiting for decision`} icon={UserCheck} tone="accent" />
        <ShortcutLink to="/dashboard/company/posts" label="Publish Opportunity" detail="Open or update company paths" icon={BriefcaseBusiness} />
        <ShortcutLink to="/dashboard/company/trainers" label="Assign Mentors" detail="Check mentor coverage" icon={Users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Session Capacity" action={{ label: "Sessions", to: "/dashboard/company/trainings" }}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{totalRegisteredTrainees}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{totalSeats}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs text-muted-foreground">At Capacity</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{atCapacitySessions.length}</p>
            </div>
          </div>

          {sessionsByCapacity.length === 0 ? (
            <EmptyState title="No sessions yet." description="Create a session to start tracking capacity and trainee enrollment." />
          ) : null}

          {sessionsByCapacity.map((session) => (
            <div key={session.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{session.trainingSessionName || "Untitled session"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(session.startDate)} to {formatDate(session.endDate)}</p>
                </div>
                <Badge variant="outline">{getCapacityPercent(session)}%</Badge>
              </div>
              <Progress value={getCapacityPercent(session)} className="mt-3 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">{session.registeredStudentsCount ?? 0} of {session.seatsNumber ?? 0} seats filled</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Candidate Pipeline" action={{ label: "Candidates", to: "/dashboard/company/applicants" }}>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{pendingCandidates}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-muted-foreground">Accepted</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{acceptedCandidates}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{candidateCount}</p>
            </div>
          </div>

          {recentApplicants.length === 0 ? (
            <EmptyState title="No candidates yet." description="Candidates will appear when trainees apply to opportunities." />
          ) : null}

          {recentApplicants.map((applicant) => (
            <CandidateRow key={applicant.applicantId ?? `${applicant.traineeEmail}-${applicant.createdAt}`} applicant={applicant} />
          ))}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Growth Tracks" action={{ label: "Tracks", to: "/dashboard/company/tracks" }}>
          {tracksWithoutSessions.length > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 p-3 text-sm text-accent">
              <AlertTriangle className="h-4 w-4" />
              {tracksWithoutSessions.length} track(s) do not have sessions yet.
            </div>
          ) : tracks.length > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Tracks are connected to sessions.
            </div>
          ) : null}

          {visibleTracks.length === 0 ? (
            <EmptyState title="No tracks yet." description="Create a track before launching sessions and opportunities." />
          ) : null}

          {visibleTracks.map((track) => (
            <TrackRow key={track.id ?? track.name} track={track} />
          ))}
        </SectionCard>

        <SectionCard title="Opportunities" action={{ label: "Opportunities", to: "/dashboard/company/posts" }}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{publishedPosts}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs text-muted-foreground">Needs Attention</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{draftPosts}</p>
            </div>
          </div>

          {recentPosts.length === 0 ? (
            <EmptyState title="No opportunities yet." description="Publish an opportunity to start receiving candidates." />
          ) : null}

          {recentPosts.map((post) => (
            <OpportunityRow key={post.id ?? post.title} post={post} />
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
