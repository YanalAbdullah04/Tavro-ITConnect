import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, Briefcase, Building2, Calendar, ClipboardList, Github, MapPin, Route, Search, User, Users } from "lucide-react";

import { internshipApi } from "@/lib/api/internship";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function InternshipsBrowse() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [track, setTrack] = useState("");
  const [page, setPage] = useState(1);

  const internshipsQuery = useQuery({
    queryKey: ["internships", { search, location, track, page }],
    queryFn: () => internshipApi.getInternships({
      searchstring: search,
      Location: location,
      Track: track,
      currentpage: page,
      pagesize: 6,
    }),
  });

  const internships = internshipsQuery.data?.items ?? [];

  return (
    <DashboardShell
      workspaceLabel="Trainee Workspace"
      title="Explore Opportunities"
      subtitle="Browse company-connected opportunities that can become the next step in your growth path."
      searchPlaceholder="Search missions, submissions, opportunities..."
      statusText="Path synced"
      profileHref="/dashboard/profile"
      navItems={[
        { label: "Overview", icon: Route, href: "/dashboard/student#overview" },
        { label: "Tasks", icon: ClipboardList, href: "/dashboard/student#tasks" },
        { label: "GitHub", icon: Github, href: "/dashboard/student#github" },
        { label: "Messages", icon: BellRing, href: "/dashboard/student#messages" },
        { label: "Opportunities", icon: Briefcase, href: "/dashboard/internships", active: true },
        { label: "Profile", icon: User, href: "/dashboard/profile" },
      ]}
    >
        <div className="mx-auto max-w-7xl space-y-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard/student")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Path
          </Button>

          <Card className="border-2">
            <CardContent className="p-4 grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search opportunities..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="pl-10" />
              </div>
              <Input placeholder="Location" value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }} />
              <Input placeholder="Track" value={track} onChange={(event) => { setTrack(event.target.value); setPage(1); }} />
            </CardContent>
          </Card>

          {internshipsQuery.isLoading && <p className="rounded-xl border border-border bg-muted/20 p-6 text-muted-foreground">Loading opportunities...</p>}
          {internshipsQuery.isError && <p className="rounded-xl border border-destructive/40 p-6 text-destructive">Unable to load opportunities.</p>}
          {!internshipsQuery.isLoading && !internshipsQuery.isError && internships.length === 0 && (
            <Card className="border-2"><CardContent className="p-10 text-center text-muted-foreground">No opportunities matched yet.</CardContent></Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <Card key={internship.postId ?? internship.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{internship.title || "Untitled opportunity"}</CardTitle>
                  <CardDescription className="flex items-center gap-2"><Building2 className="h-4 w-4" />{internship.companyName || "Company not provided"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{internship.location || "No location"}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{internship.startDate?.slice(0, 10)} to {internship.endDate?.slice(0, 10)}</span>
                  </div>
                  <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{internship.numberOfApplicant ?? 0} candidates</Badge>
                  <Button className="w-full" onClick={() => internship.postId && navigate(`/dashboard/internships/${internship.postId}`)} disabled={!internship.postId}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={!internshipsQuery.data?.havePreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <Button variant="outline" disabled={!internshipsQuery.data?.haveNextPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
    </DashboardShell>
  );
}
