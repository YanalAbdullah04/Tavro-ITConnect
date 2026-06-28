import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { traineeApi } from "@/lib/api/trainee";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const profileQuery = useQuery({
    queryKey: ["traineeProfile", studentId],
    queryFn: () => traineeApi.getProfileById(studentId),
  });

  const profile = profileQuery.data;
  const skills = (profile?.skills ?? "").split(",").map((skill) => skill.trim()).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Trainee Profile</h2>
          <p className="text-muted-foreground">Profile data from /api/Trainee/Profile/{'{id}'}.</p>
        </div>
      </div>

      {profileQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading trainee profile...</p>}
      {profileQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load trainee profile.</p>}
      {!profileQuery.isLoading && !profileQuery.isError && !profile && <p className="text-muted-foreground">No trainee profile found.</p>}

      {profile && (
        <Card className="border-2">
          <CardHeader><CardTitle>{profile.name || "Unnamed trainee"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p><span className="text-muted-foreground">Phone:</span> {profile.phone || "Not provided"}</p>
            <p><span className="text-muted-foreground">Portfolio:</span> {profile.portfolioLink || "Not provided"}</p>
            <p><span className="text-muted-foreground">Resume:</span> {profile.resumeUrl || "Not provided"}</p>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills provided.</p>}
              {skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
