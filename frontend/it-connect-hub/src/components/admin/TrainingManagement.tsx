import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, MapPin, Plus, Trash2, UserCheck, Users } from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { trackApi } from "@/lib/api/track";
import { trainerApi } from "@/lib/api/trainer";
import { trainingSessionApi } from "@/lib/api/trainingSession";
import type { TrainingSessionResponse } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemedDatePicker } from "@/components/ui/themed-date-picker";

const emptyForm = {
  name: "",
  description: "",
  isPaid: false,
  trainingStatus: "",
  location: "",
  startDate: "",
  endDate: "",
  seatsNumber: 20,
  trackId: "",
  trainerId: "",
};

export function TrainingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSessionResponse | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const sessionsQuery = useQuery({ queryKey: ["trainingSessions"], queryFn: trainingSessionApi.getTrainingSessions });
  const tracksQuery = useQuery({ queryKey: ["tracks"], queryFn: trackApi.getTracks });
  const trainersQuery = useQuery({ queryKey: ["trainers", { page: 1, pageSize: 100 }], queryFn: () => trainerApi.getTrainers({ CurentPage: 1, PageSize: 100 }) });

  const showError = (error: unknown) => {
    getApiErrorMessages(error).forEach((message) => {
      toast({ title: "Session request failed", description: message, variant: "destructive" });
    });
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["trainingSessions"] });

  const createMutation = useMutation({
    mutationFn: trainingSessionApi.createTrainingSession,
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Session created", description: "The training session has been created." });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: trainingSessionApi.updateTrainingSession,
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Session updated", description: "The training session has been updated." });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: trainingSessionApi.deleteTrainingSession,
    onSuccess: () => {
      invalidate();
      toast({ title: "Session deleted", description: "The training session has been removed." });
    },
    onError: showError,
  });

  const closeForm = () => {
    setIsOpen(false);
    setEditingSession(null);
    setFormData(emptyForm);
  };

  const openEdit = (session: TrainingSessionResponse) => {
    setEditingSession(session);
    setFormData({
      name: session.trainingSessionName ?? "",
      description: session.description ?? "",
      isPaid: session.isPaid,
      trainingStatus: session.trainingStatus ?? "",
      location: session.location ?? "",
      startDate: session.startDate?.slice(0, 10) ?? "",
      endDate: session.endDate?.slice(0, 10) ?? "",
      seatsNumber: session.seatsNumber ?? 0,
      trackId: session.trackId ?? "",
      trainerId: session.trainerId ?? "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.trackId || !formData.trainerId) {
      toast({
        title: "Session assignments required",
        description: "Select both a track and a mentor before saving the session.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Session dates required",
        description: "Select both a start date and an end date before saving the session.",
        variant: "destructive",
      });
      return;
    }

    if (editingSession) {
      updateMutation.mutate({
        id: editingSession.id,
        name: formData.name,
        description: formData.description,
        isPaid: formData.isPaid,
        trainingStatus: formData.trainingStatus,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        seatsNumber: formData.seatsNumber,
        trackId: formData.trackId,
        trainerId: formData.trainerId,
      });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      isPaid: formData.isPaid,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      seatsNumber: formData.seatsNumber,
      trackId: formData.trackId,
      trainerId: formData.trainerId,
    });
  };

  const sessions = sessionsQuery.data ?? [];
  const tracks = tracksQuery.data ?? [];
  const trainers = trainersQuery.data?.items ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Sessions</h2>
          <p className="text-muted-foreground">Create sessions that connect growth tracks, mentors, and trainees.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (open) setIsOpen(true); else closeForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/25">
              <Plus className="h-5 w-5" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl border-2">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingSession ? "Edit Session" : "Create New Session"}</DialogTitle>
              <DialogDescription>Plan capacity, schedule, location, track, and mentor assignment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select value={formData.trackId} onValueChange={(value) => setFormData({ ...formData, trackId: value })}>
                    <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                    <SelectContent>
                      {tracks.map((track) => track.id && <SelectItem key={track.id} value={track.id}>{track.name || "Untitled track"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mentor</Label>
                  <Select value={formData.trainerId} onValueChange={(value) => setFormData({ ...formData, trainerId: value })}>
                    <SelectTrigger><SelectValue placeholder="Select mentor" /></SelectTrigger>
                    <SelectContent>
                      {trainers.map((trainer) => trainer.userId && (
                        <SelectItem key={trainer.userId} value={trainer.userId}>{trainer.trainerName || trainer.email || "Unnamed mentor"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <ThemedDatePicker
                    value={formData.startDate}
                    onChange={(startDate) => setFormData({ ...formData, startDate })}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <ThemedDatePicker
                    value={formData.endDate}
                    onChange={(endDate) => setFormData({ ...formData, endDate })}
                    placeholder="Select end date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Input type="number" min={1} value={formData.seatsNumber} onChange={(event) => setFormData({ ...formData, seatsNumber: Number(event.target.value) })} required />
                </div>
              </div>
              {editingSession && (
                <div className="flex items-center gap-3 py-2">
                  <Checkbox
                    id="trainingStatus"
                    checked={formData.trainingStatus === "Complete"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        trainingStatus: checked ? "Complete" : (editingSession.trainingStatus === "Complete" ? "Active" : editingSession.trainingStatus || "Active"),
                      })
                    }
                  />
                  <Label htmlFor="trainingStatus" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Mark session as Complete
                  </Label>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={formData.isPaid} onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })} />
                <Label>Paid training</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sessionsQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading training sessions...</p>}
      {sessionsQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load training sessions.</p>}
      {!sessionsQuery.isLoading && !sessionsQuery.isError && sessions.length === 0 && (
        <Card className="border-2">
          <CardContent className="space-y-2 p-10 text-center">
            <p className="font-medium text-foreground">No sessions running yet.</p>
            <p className="text-sm text-muted-foreground">Create a session to connect mentors and trainees.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <Card key={session.id ?? index} className="group border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="rounded-full">{session.trackName || "No track"}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(session)} disabled={!session.id}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => session.id && deleteMutation.mutate(session.id)} disabled={!session.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{session.trainingSessionName || "Untitled training"}</CardTitle>
              <CardDescription className="line-clamp-2">{session.description || "No description provided."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{session.startDate?.slice(0, 10)} to {session.endDate?.slice(0, 10)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{session.location || "No location"}</span>
              </div>
              <div className="rounded-xl bg-muted/50 border p-3 flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Mentor</p>
                  <p className="text-sm font-medium">{session.trainerName || "No mentor assigned"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{session.registeredStudentsCount ?? 0} / {session.seatsNumber ?? 0} seats</span>
                <Badge>{session.trainingStatus || "No status"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
