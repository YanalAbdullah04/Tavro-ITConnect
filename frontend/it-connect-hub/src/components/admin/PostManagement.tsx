import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, FileText, Plus, Tag, Trash2, Users } from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { postApi } from "@/lib/api/post";
import { trainingSessionApi } from "@/lib/api/trainingSession";
import type { PostResponse, PostStatus } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ThemedDatePicker } from "@/components/ui/themed-date-picker";

const emptyForm = {
  title: "",
  description: "",
  deadline: "",
  reqSkills: "",
  responsibility: "",
  benefits: "",
  status: "Pending" as PostStatus,
  trainingSessionId: "",
};

const postStatusOptions: PostStatus[] = ["Pending", "Published", "Unpublished"];

export function PostManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState(emptyForm);

  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: postApi.getPosts });
  const sessionsQuery = useQuery({ queryKey: ["trainingSessions"], queryFn: trainingSessionApi.getTrainingSessions });

  const showError = (error: unknown) => {
    getApiErrorMessages(error).forEach((message) => {
      toast({ title: "Opportunity request failed", description: message, variant: "destructive" });
    });
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["posts"] });

  const createMutation = useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Opportunity created", description: "The opportunity has been created." });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: postApi.updatePost,
    onSuccess: () => {
      invalidate();
      closeForm();
      toast({ title: "Opportunity updated", description: "The opportunity has been updated." });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: postApi.deletePost,
    onSuccess: () => {
      invalidate();
      toast({ title: "Opportunity deleted", description: "The opportunity has been removed." });
    },
    onError: showError,
  });

  const closeForm = () => {
    setIsOpen(false);
    setEditingPost(null);
    setFormData(emptyForm);
  };

  const openEdit = (post: PostResponse) => {
    setEditingPost(post);
    setFormData({
      title: post.title ?? "",
      description: post.description ?? "",
      deadline: post.deadline?.slice(0, 10) ?? "",
      reqSkills: post.reqSkills ?? "",
      responsibility: post.responsibility ?? "",
      benefits: post.benefits ?? "",
      status: post.status,
      trainingSessionId: post.trainingSessionId ?? "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.trainingSessionId) {
      toast({
        title: "Training session required",
        description: "Select the training session connected to this opportunity.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.deadline) {
      toast({
        title: "Deadline required",
        description: "Select a deadline before saving the opportunity.",
        variant: "destructive",
      });
      return;
    }

    const body = {
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      reqSkills: formData.reqSkills,
      responsibility: formData.responsibility,
      benefits: formData.benefits,
      status: formData.status,
      trainingSessionId: formData.trainingSessionId,
    };

    if (editingPost) {
      updateMutation.mutate({ ...body, id: editingPost.id });
      return;
    }

    createMutation.mutate(body);
  };

  const posts = postsQuery.data ?? [];
  const filteredPosts = statusFilter === "all" ? posts : posts.filter((post) => post.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Opportunities</h2>
          <p className="text-muted-foreground">Publish openings connected to training sessions and candidate flow.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (open) setIsOpen(true); else closeForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/25">
              <Plus className="h-5 w-5" />
              Publish Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl border-2">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingPost ? "Edit Opportunity" : "Publish Opportunity"}</DialogTitle>
              <DialogDescription>Connect an opening to a training session and candidate pipeline.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <ThemedDatePicker
                    value={formData.deadline}
                    onChange={(deadline) => setFormData({ ...formData, deadline })}
                    placeholder="Select deadline"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Training Session</Label>
                <Select value={formData.trainingSessionId} onValueChange={(value) => setFormData({ ...formData, trainingSessionId: value })}>
                  <SelectTrigger><SelectValue placeholder="Select training session" /></SelectTrigger>
                  <SelectContent>
                    {(sessionsQuery.data ?? []).map((session) => session.id && (
                      <SelectItem key={session.id} value={session.id}>{session.trainingSessionName || "Untitled session"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <Input value={formData.reqSkills} onChange={(event) => setFormData({ ...formData, reqSkills: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: PostStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {postStatusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsibility</Label>
                  <Textarea value={formData.responsibility} onChange={(event) => setFormData({ ...formData, responsibility: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <Textarea value={formData.benefits} onChange={(event) => setFormData({ ...formData, benefits: event.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Opportunity"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...Array.from(new Set(posts.map((post) => post.status)))].map((status) => (
          <Button key={status} variant={statusFilter === status ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(status)} className="rounded-full capitalize">
            {status}
          </Button>
        ))}
      </div>

      {postsQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading opportunities...</p>}
      {postsQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load opportunities.</p>}
      {!postsQuery.isLoading && !postsQuery.isError && filteredPosts.length === 0 && (
        <Card className="border-2">
          <CardContent className="space-y-2 p-10 text-center">
            <p className="font-medium text-foreground">No opportunities published yet.</p>
            <p className="text-sm text-muted-foreground">Publish an opportunity when a training path is ready for candidates.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <Card key={post.id ?? index} className="group border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary/40" />
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <Badge>{post.status || "No status"}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)} disabled={!post.id}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => post.id && deleteMutation.mutate(post.id)} disabled={!post.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2">{post.title || "Untitled opportunity"}</CardTitle>
              <CardDescription className="line-clamp-2">{post.description || "No description provided."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Deadline: {post.deadline?.slice(0, 10)}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{post.numberOfApplicants ?? 0} candidates</span>
              </div>
              {post.reqSkills && (
                <Badge variant="outline" className="rounded-full gap-1">
                  <Tag className="h-3 w-3" />
                  {post.reqSkills}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
