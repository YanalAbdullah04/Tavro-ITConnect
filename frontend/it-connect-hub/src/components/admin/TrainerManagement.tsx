import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Mail, Pencil, Phone, Plus, Search, Trash2, UserCog, X } from "lucide-react";

import { accountApi } from "@/lib/api/account";
import { getApiErrorMessages } from "@/lib/api/client";
import { trainerApi } from "@/lib/api/trainer";
import type { TrainerRegistrationRequest, TrainerResponse } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TrainerManagementProps {
  onViewTrainer?: (trainerId: string) => void;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  githubUsername: "",
};

const emptyInviteForm: TrainerRegistrationRequest = {
  fullName: "",
  email: "",
  phone: "",
  specialization: "",
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function TrainerManagement({ onViewTrainer }: TrainerManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editingTrainer, setEditingTrainer] = useState<TrainerResponse | null>(null);
  const [deletingTrainer, setDeletingTrainer] = useState<TrainerResponse | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<TrainerRegistrationRequest>(emptyInviteForm);

  const trainersQuery = useQuery({
    queryKey: ["trainers", { searchQuery, page }],
    queryFn: () => trainerApi.getTrainers({ SearchString: searchQuery, CurentPage: page, PageSize: 5 }),
  });

  const showError = (error: unknown) => {
    getApiErrorMessages(error).forEach((message) => {
      toast({ title: "Mentor request failed", description: message, variant: "destructive" });
    });
  };

  const updateMutation = useMutation({
    mutationFn: trainerApi.updateTrainerManagement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setEditingTrainer(null);
      setFormData(emptyForm);
      toast({ title: "Mentor updated", description: "Mentor profile has been updated." });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: trainerApi.deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setDeletingTrainer(null);
      toast({ title: "Mentor deleted", description: "Mentor has been removed." });
    },
    onError: showError,
  });

  const inviteMutation = useMutation({
    mutationFn: accountApi.inviteMentor,
    onSuccess: (response) => {
      if (!response.isSuccess) {
        const messages = response.errors?.length
          ? response.errors
          : ["Could not send invite. Please check the details and try again."];

        messages.forEach((message) => {
          toast({ title: "Could not send invite.", description: message, variant: "destructive" });
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setIsInviteOpen(false);
      setInviteForm(emptyInviteForm);
      toast({
        title: "Invitation sent.",
        description: "The mentor will receive an email link to complete their Tavro profile.",
      });
    },
    onError: (error: unknown) => {
      const messages = getApiErrorMessages(error);
      toast({
        title: "Could not send invite.",
        description: messages[0] ?? "Please check the details and try again.",
        variant: "destructive",
      });
    },
  });

  const trainers = trainersQuery.data?.items ?? [];

  const openEdit = (trainer: TrainerResponse) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.trainerName ?? "",
      email: trainer.email ?? "",
      phone: trainer.phone ?? "",
      specialization: trainer.specialization ?? "",
      githubUsername: "",
    });
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate({
      trainerId: editingTrainer?.userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
      githubUsername: formData.githubUsername,
    });
  };

  const handleInviteSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const fullName = inviteForm.fullName?.trim() ?? "";
    const email = inviteForm.email?.trim() ?? "";
    const phone = inviteForm.phone?.trim() ?? "";
    const specialization = inviteForm.specialization?.trim() ?? "";

    if (!fullName || !email || !phone) {
      toast({
        title: "Invite details required",
        description: "Enter the mentor name, email, and phone number before sending the invite.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Valid email required",
        description: "Enter a valid mentor email address.",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate({
      fullName,
      email,
      phone,
      specialization: specialization || null,
    });
  };

  const closeInviteDialog = () => {
    if (inviteMutation.isPending) return;
    setIsInviteOpen(false);
    setInviteForm(emptyInviteForm);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Mentors</h2>
          <p className="text-muted-foreground">Manage the mentors who guide sessions and trainee checkpoints.</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Invite Mentor
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, email, or specialization..."
                value={searchQuery}
                onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
                className="pl-10 border-2 focus:border-primary"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainersQuery.data?.totalCount ?? 0}</p><p className="text-sm text-muted-foreground">Total Mentors</p></CardContent></Card>
        <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainers.reduce((sum, trainer) => sum + (trainer.trainingSessionsCount ?? 0), 0)}</p><p className="text-sm text-muted-foreground">Shown Sessions</p></CardContent></Card>
        <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainers.reduce((sum, trainer) => sum + (trainer.countStudents ?? 0), 0)}</p><p className="text-sm text-muted-foreground">Shown Trainees</p></CardContent></Card>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCog className="h-4 w-4 text-primary" />
            </span>
            Mentors List
          </CardTitle>
          <CardDescription>{trainersQuery.data?.totalCount ?? 0} mentor(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {trainersQuery.isLoading && <p className="py-8 text-center text-muted-foreground">Loading mentors...</p>}
          {trainersQuery.isError && <p className="py-8 text-center text-destructive">Unable to load mentors.</p>}
          {!trainersQuery.isLoading && !trainersQuery.isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="hidden lg:table-cell">Sessions</TableHead>
                    <TableHead className="hidden lg:table-cell">Trainees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((trainer) => (
                    <TableRow key={trainer.userId ?? trainer.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">{(trainer.trainerName || "?")[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{trainer.trainerName || "Unnamed mentor"}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{trainer.email || "No email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{trainer.email || "No email"}</p>
                          <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{trainer.phone || "No phone"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{trainer.specialization || "Not provided"}</TableCell>
                      <TableCell className="hidden lg:table-cell"><Badge variant="secondary">{trainer.trainingSessionsCount ?? 0}</Badge></TableCell>
                      <TableCell className="hidden lg:table-cell"><Badge variant="outline">{trainer.countStudents ?? 0}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => trainer.userId && onViewTrainer?.(trainer.userId)} disabled={!trainer.userId}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(trainer)} disabled={!trainer.userId}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingTrainer(trainer)} disabled={!trainer.userId}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {trainers.length === 0 && (
                <div className="space-y-4 py-8 text-center">
                  <p className="font-medium text-foreground">No mentors assigned yet.</p>
                  <p className="text-sm text-muted-foreground">Invite mentors to guide your training sessions.</p>
                  <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Invite Mentor
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!trainersQuery.data?.havePreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
        <Button variant="outline" disabled={!trainersQuery.data?.haveNextPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={(open) => { if (open) setIsInviteOpen(true); else closeInviteDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Mentor</DialogTitle>
            <DialogDescription>Send a profile setup link so this mentor can join your Tavro workspace.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-mentor-name">Full name</Label>
                <Input
                  id="invite-mentor-name"
                  value={inviteForm.fullName ?? ""}
                  onChange={(event) => setInviteForm({ ...inviteForm, fullName: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-mentor-email">Email</Label>
                <Input
                  id="invite-mentor-email"
                  type="email"
                  value={inviteForm.email ?? ""}
                  onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-mentor-phone">Phone number</Label>
                <Input
                  id="invite-mentor-phone"
                  type="tel"
                  value={inviteForm.phone ?? ""}
                  onChange={(event) => setInviteForm({ ...inviteForm, phone: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-mentor-specialization">Specialization</Label>
                <Input
                  id="invite-mentor-specialization"
                  value={inviteForm.specialization ?? ""}
                  onChange={(event) => setInviteForm({ ...inviteForm, specialization: event.target.value })}
                />
              </div>
            </div>
            <p className="rounded-xl border border-primary/15 bg-primary/10 p-3 text-sm leading-6 text-muted-foreground">
              Mentors join through an email link and complete their profile after opening it.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeInviteDialog} disabled={inviteMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending invite..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTrainer} onOpenChange={(open) => { if (!open) setEditingTrainer(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>Update mentor profile details used for training session assignments.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} required /></div>
              <div className="space-y-2"><Label>Specialization</Label><Input value={formData.specialization} onChange={(event) => setFormData({ ...formData, specialization: event.target.value })} /></div>
              <div className="space-y-2"><Label>GitHub Username</Label><Input value={formData.githubUsername} onChange={(event) => setFormData({ ...formData, githubUsername: event.target.value })} /></div>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTrainer} onOpenChange={(open) => { if (!open) setDeletingTrainer(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mentor</DialogTitle>
            <DialogDescription>This removes the mentor from the company workspace.</DialogDescription>
          </DialogHeader>
          <p>Delete {deletingTrainer?.trainerName || "this mentor"}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTrainer(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingTrainer?.userId && deleteMutation.mutate(deletingTrainer.userId)} disabled={deleteMutation.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
