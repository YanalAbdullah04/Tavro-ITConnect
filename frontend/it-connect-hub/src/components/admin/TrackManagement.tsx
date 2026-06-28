import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Code, Edit, GraduationCap, Plus, Trash2, Users } from "lucide-react";

import { trackApi } from "@/lib/api/track";
import { getApiErrorMessages } from "@/lib/api/client";
import type { TrackResponse } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = { name: "", description: "" };

export function TrackManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TrackResponse | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const tracksQuery = useQuery({
    queryKey: ["tracks"],
    queryFn: trackApi.getTracks,
  });

  const showError = (error: unknown) => {
    getApiErrorMessages(error).forEach((message) => {
      toast({ title: "Track request failed", description: message, variant: "destructive" });
    });
  };

  const closeForm = () => {
    setIsOpen(false);
    setEditingTrack(null);
    setFormData(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: trackApi.createTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      closeForm();
      toast({ title: "Track created", description: "The track has been added successfully." });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: trackApi.updateTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      closeForm();
      toast({ title: "Track updated", description: "The track has been updated successfully." });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: trackApi.deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast({ title: "Track deleted", description: "The track has been removed." });
    },
    onError: showError,
  });

  const openEdit = (track: TrackResponse) => {
    setEditingTrack(track);
    setFormData({ name: track.name ?? "", description: track.description ?? "" });
    setIsOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (editingTrack) {
      updateMutation.mutate({ id: editingTrack.id, name: formData.name, description: formData.description });
      return;
    }

    createMutation.mutate({ name: formData.name, description: formData.description });
  };

  const tracks = tracksQuery.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Growth Tracks</h2>
          <p className="text-muted-foreground">Create and manage the training paths your company runs.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (open) setIsOpen(true); else closeForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="h-5 w-5" />
              Create Track
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-2 bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingTrack ? "Edit Track" : "Create Growth Track"}</DialogTitle>
              <DialogDescription>
                {editingTrack ? "Update track information" : "Start a training path that can connect sessions, mentors, and trainees."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="track-name">Track Name</Label>
                <Input
                  id="track-name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="e.g., Frontend Development"
                  className="border-2 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="track-description">Description</Label>
                <Textarea
                  id="track-description"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Technologies and skills covered..."
                  className="border-2 focus:border-primary min-h-[100px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingTrack ? "Save Changes" : "Create Track")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tracksQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading tracks...</p>}

      {tracksQuery.isError && (
        <Card className="border-2">
          <CardContent className="p-6">
            <p className="text-destructive">Unable to load tracks.</p>
            <Button className="mt-4" variant="outline" onClick={() => tracksQuery.refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!tracksQuery.isLoading && !tracksQuery.isError && tracks.length === 0 && (
        <Card className="border-2">
          <CardContent className="space-y-2 p-10 text-center">
            <p className="font-medium text-foreground">No growth tracks yet.</p>
            <p className="text-sm text-muted-foreground">Create your first track to start building a training path.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tracks.map((track, index) => (
          <Card
            key={track.id ?? index}
            className="group border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Code className="h-6 w-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => openEdit(track)} disabled={!track.id}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
                    onClick={() => track.id && deleteMutation.mutate(track.id)}
                    disabled={!track.id || deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl mt-4">{track.name || "Untitled track"}</CardTitle>
              <CardDescription className="line-clamp-2">{track.description || "No description provided."}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {track.numberOfTrainings ?? 0} Sessions
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {track.numberOfTrainees ?? 0} Trainees
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
