import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BellRing, Calendar, ClipboardList, GitPullRequestArrow, LayoutDashboard, Plus, Presentation, RefreshCw, Users } from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { trainerApi } from "@/lib/api/trainer";
import { trainingSessionApi } from "@/lib/api/trainingSession";
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemedDatePicker } from "@/components/ui/themed-date-picker";

const emptyTaskForm = {
  taskTitle: "",
  description: "",
  notes: "",
  deadline: "",
  attachment: null as File | null,
  traineesId: [] as string[],
  includeAll: true,
};

function formatDate(value?: string | null) {
  return value?.slice(0, 10) || "Date unavailable";
}

export default function TrainingSessionDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const params = useParams();
  const trainingId = params.trainingId ?? params.id;
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const sessionQuery = useQuery({
    queryKey: ["trainerTrainingSession", trainingId],
    queryFn: () => trainerApi.getTrainingSessionById(trainingId ?? ""),
    enabled: !!trainingId,
  });
  const session = sessionQuery.data;
  const trainees = session?.studentsWithinTraining ?? [];
  const assignTaskMutation = useMutation({
    mutationFn: () => trainingSessionApi.createTaskForSession(trainingId ?? "", {
      taskTitle: taskForm.taskTitle.trim(),
      description: taskForm.description.trim(),
      notes: taskForm.notes.trim() || null,
      deadline: new Date(taskForm.deadline).toISOString(),
      attachment: taskForm.attachment,
      traineesId: taskForm.includeAll ? [] : taskForm.traineesId,
      includeAll: taskForm.includeAll,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainerDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainerTrainingSession", trainingId] });
      setTaskForm(emptyTaskForm);
      setIsAssignOpen(false);
      toast({ title: "Task assigned", description: "The trainee task queue has been refreshed." });
    },
    onError: (error: unknown) => {
      const messages = getApiErrorMessages(error);
      toast({
        title: "Could not assign task",
        description: messages.join(" "),
        variant: "destructive",
      });
    },
  });

  const handleAssignTask = (event: React.FormEvent) => {
    event.preventDefault();

    if (!trainingId || !taskForm.taskTitle.trim() || !taskForm.description.trim() || !taskForm.deadline) {
      toast({
        title: "Task details required",
        description: "Enter a title, description, and deadline before assigning the task.",
        variant: "destructive",
      });
      return;
    }

    if (!taskForm.includeAll && taskForm.traineesId.length === 0) {
      toast({
        title: "Select at least one trainee",
        description: "Choose trainees or enable Assign to all trainees.",
        variant: "destructive",
      });
      return;
    }

    assignTaskMutation.mutate();
  };

  const toggleTrainee = (traineeId: string, checked: boolean) => {
    setTaskForm((current) => ({
      ...current,
      traineesId: checked
        ? [...current.traineesId, traineeId]
        : current.traineesId.filter((id) => id !== traineeId),
    }));
  };

  return (
    <DashboardShell
      workspaceLabel="Mentor Workspace"
      title="Session details"
      subtitle="Review the assigned session, trainee capacity, and connected training path."
      searchPlaceholder="Search trainees, sessions, checkpoints..."
      statusText="Checkpoint workspace synced"
      navItems={[
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard/trainer#overview" },
        { label: "My Sessions", icon: Presentation, href: "/dashboard/trainer#sessions", active: true },
        { label: "Trainees", icon: Users, href: "/dashboard/trainer#trainees" },
        { label: "Evaluation Center", icon: GitPullRequestArrow, href: "/dashboard/trainer/evaluations" },
        { label: "Announcements", icon: BellRing, href: "/dashboard/trainer#announcements" },
      ]}
    >
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {sessionQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading session details...</p>}
          {sessionQuery.isError && (
            <div className="flex flex-col gap-4 rounded-xl border border-destructive/40 p-6 text-destructive sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Some mentor signals could not sync.</p>
                <p className="mt-1 text-sm text-destructive/80">Retry to refresh sessions, trainees, and checkpoint queue.</p>
              </div>
              <Button variant="outline" onClick={() => sessionQuery.refetch()} className="border-destructive/35 text-destructive hover:bg-destructive/10">
                <RefreshCw className="h-4 w-4" />
                Retry sync
              </Button>
            </div>
          )}
          {!sessionQuery.isLoading && !sessionQuery.isError && !session && (
            <Card className="border-2"><CardContent className="p-10 text-center text-muted-foreground">Session details are unavailable.</CardContent></Card>
          )}
          {session && (
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-3xl">{session.trainingSessionName || "Untitled session"}</CardTitle>
                      <p className="mt-2 text-muted-foreground">Session details, trainees, tasks, and mentor checkpoints.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge>Mentor session</Badge>
                      <Button size="sm" onClick={() => setIsAssignOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Assign Task
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(session.startDate)} to {formatDate(session.endDate)}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{session.numberOfStudents ?? trainees.length} trainees</span>
                    <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4" />{session.taskCount ?? 0} tasks</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Active trainees</p><p className="font-medium">{session.numberOfStudents ?? trainees.length}</p></div>
                    <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Tasks</p><p className="font-medium">{session.taskCount ?? 0}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-5 w-5 text-primary" />Trainees</CardTitle>
                </CardHeader>
                <CardContent>
                  {trainees.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                      <p className="font-medium text-foreground">No trainees assigned yet.</p>
                      <p className="mt-1 text-sm">Trainees will appear here when you are assigned to a session.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {trainees.map((trainee) => (
                        <div key={trainee.studentId ?? trainee.email ?? trainee.studentName} className="rounded-xl border border-border/65 bg-muted/20 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{trainee.studentName || "Unnamed trainee"}</p>
                              <p className="truncate text-xs text-muted-foreground">{trainee.email || "Email unavailable"}</p>
                            </div>
                            <Badge variant="outline">{trainee.numberOfTasks ?? 0} tasks</Badge>
                          </div>
                          {trainee.studentId ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-4 w-full"
                              onClick={() => navigate(`/dashboard/trainer/training/${trainingId}/student/${trainee.studentId}/tasks`)}
                            >
                              View Tasks
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><GitPullRequestArrow className="h-5 w-5 text-primary" />Mentor Checkpoints</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Submitted repositories and checkpoint readiness are shown from each trainee's task view. Checkpoint decisions will appear here when checkpoint data is available.
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Dialog
          open={isAssignOpen}
          onOpenChange={(open) => {
            setIsAssignOpen(open);
            if (!open && !assignTaskMutation.isPending) setTaskForm(emptyTaskForm);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign trainee task</DialogTitle>
              <DialogDescription>
                Create a task for {session?.trainingSessionName || "this session"}. Notes and attachment are optional.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignTask} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={taskForm.taskTitle}
                    onChange={(event) => setTaskForm({ ...taskForm, taskTitle: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-deadline">Deadline</Label>
                  <ThemedDatePicker
                    id="task-deadline"
                    value={taskForm.deadline}
                    onChange={(deadline) => setTaskForm({ ...taskForm, deadline })}
                    placeholder="Select deadline"
                    mode="datetime"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-notes">Notes (optional)</Label>
                <Textarea
                  id="task-notes"
                  value={taskForm.notes}
                  onChange={(event) => setTaskForm({ ...taskForm, notes: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-attachment">Attachment (optional)</Label>
                <Input
                  id="task-attachment"
                  type="file"
                  onChange={(event) => setTaskForm({ ...taskForm, attachment: event.target.files?.[0] ?? null })}
                />
              </div>
              <div className="space-y-3 rounded-xl border border-border/65 p-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="task-include-all"
                    checked={taskForm.includeAll}
                    onCheckedChange={(checked) => setTaskForm({
                      ...taskForm,
                      includeAll: checked === true,
                      traineesId: checked === true ? [] : taskForm.traineesId,
                    })}
                  />
                  <Label htmlFor="task-include-all">Assign to all trainees</Label>
                </div>
                {!taskForm.includeAll ? (
                  trainees.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {trainees.map((trainee) => (
                        <label key={trainee.studentId} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 text-sm">
                          <Checkbox
                            checked={taskForm.traineesId.includes(trainee.studentId)}
                            onCheckedChange={(checked) => toggleTrainee(trainee.studentId, checked === true)}
                          />
                          <span className="truncate">{trainee.studentName || trainee.email}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No trainees are available for individual assignment.</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Every trainee currently assigned to this session will receive the task.</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)} disabled={assignTaskMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignTaskMutation.isPending}>
                  {assignTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </DashboardShell>
  );
}
