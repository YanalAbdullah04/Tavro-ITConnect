import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Search, UserCheck, Users } from "lucide-react";
import { useState } from "react";

import { trainingSessionApi } from "@/lib/api/trainingSession";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TrainingOverviewProps {
  onViewStudent?: (studentId: string) => void;
}

export function TrainingOverview(_props: TrainingOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const sessionsQuery = useQuery({ queryKey: ["trainingSessions"], queryFn: trainingSessionApi.getTrainingSessions });
  const sessions = sessionsQuery.data ?? [];
  const filteredSessions = sessions.filter((session) => {
    const searchable = `${session.trainingSessionName ?? ""} ${session.trackName ?? ""} ${session.trainerName ?? ""} ${session.location ?? ""}`.toLowerCase();
    return searchable.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Session Overview</h2>
          <p className="text-muted-foreground">Review session capacity, mentor assignments, and trainee registration.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 border-2 focus:border-primary"
          />
        </div>
      </div>

      {sessionsQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading sessions...</p>}
      {sessionsQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load sessions.</p>}
      {!sessionsQuery.isLoading && !sessionsQuery.isError && filteredSessions.length === 0 && (
        <Card className="border-2">
          <CardContent className="space-y-2 p-10 text-center">
            <p className="font-medium text-foreground">No sessions running yet.</p>
            <p className="text-sm text-muted-foreground">Create a session to connect mentors and trainees.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSessions.map((session, index) => (
          <Card key={session.id ?? index} className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{session.trainingSessionName || "Untitled session"}</CardTitle>
                  <CardDescription>{session.description || "No description provided."}</CardDescription>
                </div>
                <Badge>{session.trainingStatus || "No status"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{session.startDate?.slice(0, 10)} to {session.endDate?.slice(0, 10)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{session.location || "No location"}</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Track</p>
                  <p className="font-medium">{session.trackName || "Not assigned"}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><UserCheck className="h-3 w-3" />Mentor</p>
                  <p className="font-medium">{session.trainerName || "Not assigned"}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Seats</p>
                  <p className="font-medium">{session.registeredStudentsCount ?? 0} / {session.seatsNumber ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
