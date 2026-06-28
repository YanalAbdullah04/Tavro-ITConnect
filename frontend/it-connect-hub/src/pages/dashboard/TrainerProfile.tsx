import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BellRing,
  FileText,
  Github,
  LayoutDashboard,
  Presentation,
  Users,
  GitPullRequestArrow,
  UserRound,
  Phone,
  Save,
  Mail,
  Award,
} from "lucide-react";

import { getApiErrorMessages } from "@/lib/api/client";
import { trainerApi } from "@/lib/api/trainer";
import { getUserIdFromToken } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocalProfileState {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  gitHubAccount: string;
}

const emptyProfile: LocalProfileState = {
  id: "",
  name: "",
  email: "",
  phone: "",
  specialty: "",
  gitHubAccount: "",
};

export default function TrainerProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const trainerId = getUserIdFromToken() || "";

  const [profile, setProfile] = useState<LocalProfileState>(emptyProfile);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["trainerProfile", trainerId],
    queryFn: () => trainerApi.getTrainer(trainerId),
    enabled: !!trainerId,
  });

  useEffect(() => {
    if (trainerId) {
      setResumeFileName(localStorage.getItem(`trainer_resume_${trainerId}`) || null);
      setResumeUrl(localStorage.getItem(`trainer_resume_data_${trainerId}`) || null);
    }
  }, [trainerId]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile({
        id: profileQuery.data.id || trainerId,
        name: profileQuery.data.name || "",
        email: profileQuery.data.email || "",
        phone: profileQuery.data.phone || "",
        specialty: profileQuery.data.specialty || "",
        gitHubAccount: profileQuery.data.gitHubAccount || "",
      });
    }
  }, [profileQuery.data, trainerId]);

  const updateMutation = useMutation({
    mutationFn: trainerApi.updateTrainerManagement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trainerProfile", trainerId] });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your mentor profile has been saved." });
    },
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Profile update failed", description: message, variant: "destructive" });
      });
    },
  });

  const handleInputChange = (field: keyof LocalProfileState, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const skills = (profile.specialty ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const saveProfile = () => {
    if (!profile.name.trim()) {
      toast({ title: "Profile update failed", description: "Full name is required.", variant: "destructive" });
      return;
    }
    if (!profile.email.trim()) {
      toast({ title: "Profile update failed", description: "Email address is required.", variant: "destructive" });
      return;
    }
    if (!profile.phone.trim()) {
      toast({ title: "Profile update failed", description: "Phone number is required.", variant: "destructive" });
      return;
    }

    const proceedWithSave = () => {
      updateMutation.mutate({
        trainerId: profile.id,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        specialization: profile.specialty.trim(),
        githubUsername: profile.gitHubAccount.trim(),
        imgUrl: null,
      });
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        localStorage.setItem(`trainer_resume_${trainerId}`, selectedFile.name);
        localStorage.setItem(`trainer_resume_data_${trainerId}`, base64Data);
        setResumeFileName(selectedFile.name);
        setResumeUrl(base64Data);
        setSelectedFile(null);
        setSelectedFileName(null);
        proceedWithSave();
      };
      reader.readAsDataURL(selectedFile);
    } else {
      proceedWithSave();
    }
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      toast({ title: "Resume staged", description: `${file.name} selected. Click Save to complete upload.` });
    }
  };

  const handleViewResume = () => {
    if (!resumeUrl) return;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Resume - ${profile.name}</title>
            <style>
              body { margin: 0; padding: 0; background: #0f172a; height: 100vh; overflow: hidden; }
              iframe { border: none; width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <iframe src="${resumeUrl}"></iframe>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <DashboardShell
      workspaceLabel="Mentor Workspace"
      title="Profile"
      subtitle="Keep your profile information up to date for your courses, trainees, and evaluation duties."
      searchPlaceholder="Search trainees, sessions, checkpoints..."
      statusText="Checkpoint workspace synced"
      profileHref="/dashboard/trainer/profile"
      userLabel={profile.name || undefined}
      navItems={[
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard/trainer#overview" },
        { label: "My Sessions", icon: Presentation, href: "/dashboard/trainer#sessions" },
        { label: "Trainees", icon: Users, href: "/dashboard/trainer#trainees" },
        { label: "Evaluation Center", icon: GitPullRequestArrow, href: "/dashboard/trainer/evaluations" },
        { label: "Announcements", icon: BellRing, href: "/dashboard/trainer#announcements" },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard/trainer")} className="mb-6 hover:bg-white/5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {profileQuery.isLoading && (
          <p className="rounded-xl border border-white/10 bg-[#0d1219]/80 p-6 text-muted-foreground">
            Loading profile...
          </p>
        )}
        {profileQuery.isError && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
            Unable to load profile.
          </p>
        )}

        {!profileQuery.isLoading && !profileQuery.isError && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 overflow-hidden">
                <span className="text-5xl font-bold text-primary">
                  {(profile.name || "?")[0].toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-4 text-foreground">{profile.name || "Unnamed Mentor"}</h1>
              <p className="text-sm text-muted-foreground mt-1">Mentor Access</p>
            </div>

            <Card className="border-white/10 bg-[#0d1219]/80 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" className="border-white/10 bg-white/[0.035] hover:bg-white/10" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/[0.035] hover:bg-white/10"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedFile(null);
                        setSelectedFileName(null);
                        if (profileQuery.data) {
                          setProfile({
                            id: profileQuery.data.id || trainerId,
                            name: profileQuery.data.name || "",
                            email: profileQuery.data.email || "",
                            phone: profileQuery.data.phone || "",
                            specialty: profileQuery.data.specialty || "",
                            gitHubAccount: profileQuery.data.gitHubAccount || "",
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveProfile} disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      required
                      className="border-white/10 bg-white/[0.035] focus-visible:ring-primary/50 text-foreground"
                      value={profile.name}
                      onChange={(event) => handleInputChange("name", event.target.value)}
                    />
                  ) : (
                    <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-foreground">
                      {profile.name || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      required
                      type="email"
                      className="border-white/10 bg-white/[0.035] focus-visible:ring-primary/50 text-foreground"
                      value={profile.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                    />
                  ) : (
                    <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-foreground">
                      {profile.email || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      required
                      className="border-white/10 bg-white/[0.035] focus-visible:ring-primary/50 text-foreground"
                      value={profile.phone}
                      onChange={(event) => handleInputChange("phone", event.target.value)}
                    />
                  ) : (
                    <p className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-foreground">
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Award className="h-4 w-4" />
                    Skills / Specialization
                  </Label>
                  {isEditing ? (
                    <Input
                      className="border-white/10 bg-white/[0.035] focus-visible:ring-primary/50 text-foreground"
                      value={profile.specialty}
                      onChange={(event) => handleInputChange("specialty", event.target.value)}
                      placeholder="e.g. .NET Core, React, SQL Server, Architecture"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl min-h-[46px] items-center">
                      {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills listed.</p>}
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-white/10 text-foreground hover:bg-white/15">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Github className="h-4 w-4" />
                    GitHub Account (Portfolio)
                  </Label>
                  {isEditing ? (
                    <Input
                      className="border-white/10 bg-white/[0.035] focus-visible:ring-primary/50 text-foreground"
                      value={profile.gitHubAccount}
                      onChange={(event) => handleInputChange("gitHubAccount", event.target.value)}
                      placeholder="GitHub username"
                    />
                  ) : (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-foreground">
                      {profile.gitHubAccount ? (
                        <a
                          href={`https://github.com/${profile.gitHubAccount}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          github.com/{profile.gitHubAccount}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Resume
                  </Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        className="border-white/10 bg-white/[0.035] text-muted-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:opacity-90 cursor-pointer"
                        onChange={handleResumeChange}
                      />
                      {selectedFileName && (
                        <p className="text-xs text-primary font-medium">
                          Selected file: {selectedFileName} (Click Save to apply)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl min-h-[50px] flex items-center">
                      {resumeFileName ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                          onClick={handleViewResume}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Resume ({resumeFileName})
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">No resume uploaded</p>
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
