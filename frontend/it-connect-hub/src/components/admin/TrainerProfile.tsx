import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Github, GraduationCap, Mail, Phone, Users } from "lucide-react";

import { trainerApi } from "@/lib/api/trainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TrainerProfileProps {
  trainerId: string;
  onBack: () => void;
}

export function TrainerProfile({ trainerId, onBack }: TrainerProfileProps) {
  const trainerQuery = useQuery({
    queryKey: ["trainer", trainerId],
    queryFn: () => trainerApi.getTrainer(trainerId),
  });

  const trainer = trainerQuery.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Mentor Profile</h2>
          <p className="text-muted-foreground">View mentor details, session assignments, and trainee coverage.</p>
        </div>
      </div>

      {trainerQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading mentor profile...</p>}
      {trainerQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load mentor profile.</p>}
      {!trainerQuery.isLoading && !trainerQuery.isError && !trainer && (
        <Card className="border-2"><CardContent className="p-10 text-center text-muted-foreground">No mentor profile found.</CardContent></Card>
      )}

      {trainer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/30">
                  {(trainer.name || "?")[0]}
                </div>
                <h3 className="text-xl font-bold">{trainer.name || "Unnamed mentor"}</h3>
                <p className="text-muted-foreground">{trainer.specialty || "No specialty"}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-sm">{trainer.email || "Not provided"}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{trainer.phone || "Not provided"}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">GitHub</p><p className="font-medium">{trainer.gitHubAccount || "Not provided"}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainer.totalStudentsCount ?? 0}</p><p className="text-sm text-muted-foreground">Trainees</p></CardContent></Card>
              <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainer.totalTrainingsCount ?? 0}</p><p className="text-sm text-muted-foreground">Sessions</p></CardContent></Card>
              <Card className="border-2"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{trainer.totalTasksCount ?? 0}</p><p className="text-sm text-muted-foreground">Mentor Load</p></CardContent></Card>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-primary" />Sessions</CardTitle>
                <CardDescription>{trainer.trainingsList?.length ?? 0} session(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(trainer.trainingsList ?? []).length === 0 && <p className="text-sm text-muted-foreground">No sessions found.</p>}
                {(trainer.trainingsList ?? []).map((training, index) => (
                  <div key={`${training.title}-${index}`} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{training.title || "Untitled session"}</p>
                        <p className="text-sm text-muted-foreground">{training.location || "No location"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />{training.startDate?.slice(0, 10)} to {training.endDate?.slice(0, 10)}
                        </p>
                      </div>
                      <Badge variant="secondary">{training.studentCount ?? 0} trainees</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />Trainees</CardTitle>
                <CardDescription>{trainer.studentsList?.length ?? 0} trainee(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(trainer.studentsList ?? []).length === 0 && <p className="text-sm text-muted-foreground">No trainees found.</p>}
                {(trainer.studentsList ?? []).map((student, index) => (
                  <div key={`${student.studentName}-${index}`} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <p className="font-medium">{student.studentName || "Unnamed trainee"}</p>
                    <Badge variant="outline">{student.trainingTitle || "No training"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
