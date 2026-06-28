import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, Briefcase, ClipboardList, FileText, Github, Link as LinkIcon, Phone, Route, Save, User } from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { traineeApi } from "@/lib/api/trainee";
import type { TraineeProfileRequestAndResponse } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyProfile: TraineeProfileRequestAndResponse = {
  name: "",
  phone: "",
  portfolioLink: "",
  skills: "",
  resumeUrl: "",
  imageUrl: "",
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<TraineeProfileRequestAndResponse>(emptyProfile);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const profileQuery = useQuery({ queryKey: ["traineeProfile"], queryFn: traineeApi.getProfile });

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: traineeApi.updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["traineeProfile"] });
      setIsEditing(false);
      setResumeFile(null);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Profile update failed", description: message, variant: "destructive" });
      });
    },
  });

  const handleInputChange = (field: keyof TraineeProfileRequestAndResponse, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const skills = (profile.skills ?? "").split(",").map((skill) => skill.trim()).filter(Boolean);
  const saveProfile = () => {
    if (!profile.name.trim()) {
      toast({ title: "Profile update failed", description: "Full name is required.", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ ...profile, name: profile.name.trim(), resumeFile });
  };

  return (
    <DashboardShell
      workspaceLabel="Trainee Workspace"
      title="Profile"
      subtitle="Keep your trainee profile ready for missions, mentor checkpoints, and opportunities."
      searchPlaceholder="Search missions, submissions, opportunities..."
      statusText="Path synced"
      profileHref="/dashboard/profile"
      userLabel={profile.name || undefined}
      navItems={[
        { label: "Overview", icon: Route, href: "/dashboard/student#overview" },
        { label: "Tasks", icon: ClipboardList, href: "/dashboard/student#tasks" },
        { label: "GitHub", icon: Github, href: "/dashboard/student#github" },
        { label: "Messages", icon: BellRing, href: "/dashboard/student#messages" },
        { label: "Opportunities", icon: Briefcase, href: "/dashboard/internships" },
        { label: "Profile", icon: User, href: "/dashboard/profile", active: true },
      ]}
    >
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard/student")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Path
          </Button>

          {profileQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading profile...</p>}
          {profileQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load profile.</p>}

          {!profileQuery.isLoading && !profileQuery.isError && (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 overflow-hidden">
                  {profile.imageUrl ? <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl font-bold text-primary">{(profile.name || "?")[0]}</span>}
                </div>
                <h1 className="text-2xl font-bold mt-4">{profile.name || "Unnamed trainee"}</h1>
              </div>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { setIsEditing(false); setProfile(profileQuery.data ?? emptyProfile); setResumeFile(null); }}>Cancel</Button>
                      <Button onClick={saveProfile} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Full Name</Label>
                    {isEditing ? <Input required value={profile.name ?? ""} onChange={(event) => handleInputChange("name", event.target.value)} /> : <p className="p-2 bg-muted/50 rounded-lg">{profile.name || "Not provided"}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />Phone Number</Label>
                    {isEditing ? <Input value={profile.phone ?? ""} onChange={(event) => handleInputChange("phone", event.target.value)} /> : <p className="p-2 bg-muted/50 rounded-lg">{profile.phone || "Not provided"}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    {isEditing ? <Input value={profile.skills ?? ""} onChange={(event) => handleInputChange("skills", event.target.value)} placeholder="React, TypeScript, CSS" /> : (
                      <div className="flex flex-wrap gap-2">
                        {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills provided.</p>}
                        {skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground" />Portfolio Link</Label>
                    {isEditing ? <Input value={profile.portfolioLink ?? ""} onChange={(event) => handleInputChange("portfolioLink", event.target.value)} /> : <p className="p-2 bg-muted/50 rounded-lg">{profile.portfolioLink || "Not provided"}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Resume</Label>
                    {isEditing ? (
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setResumeFile(file);
                        }}
                      />
                    ) : (
                      <div>
                        {profile.resumeUrl ? (
                          <a
                            href={profile.resumeUrl.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${profile.resumeUrl}` : profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            View Resume
                          </a>
                        ) : (
                          <p className="p-2 bg-muted/50 rounded-lg text-muted-foreground text-sm">Not provided</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
    </DashboardShell>
  );
}
