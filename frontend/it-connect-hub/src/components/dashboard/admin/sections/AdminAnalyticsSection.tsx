import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { trackApi } from "@/lib/api/track";
import { trainingSessionApi } from "@/lib/api/trainingSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAnalyticsSection() {
  const tracksQuery = useQuery({ queryKey: ["tracks"], queryFn: trackApi.getTracks });
  const sessionsQuery = useQuery({ queryKey: ["trainingSessions"], queryFn: trainingSessionApi.getTrainingSessions });
  const tracks = tracksQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];

  const trackChartData = tracks.map((track) => ({
    track: track.name || "Untitled",
    trainees: track.numberOfTrainees ?? 0,
    sessions: track.numberOfTrainings ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Growth Tracks</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{tracks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sessions</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Registered Trainees</p>
            <p className="mt-2 text-3xl font-semibold text-primary">
              {sessions.reduce((sum, session) => sum + (session.registeredStudentsCount ?? 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Growth Track Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          {trackChartData.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No growth track analytics are available yet.</p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="track" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Bar dataKey="trainees" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="sessions" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
