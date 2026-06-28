import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Building2, Filter, MapPin, Route, Search, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyApi } from "@/lib/api/company";

const discoveryNodes = ["Company", "Track", "Session", "Mentor", "Opportunity", "Candidate"];

function CompaniesTrail() {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/88 p-3 shadow-[0_24px_90px_-65px_hsl(var(--primary))] sm:rounded-3xl sm:p-5">
      <div className="absolute inset-0 tavro-grid-bg opacity-30" />
      <div className="absolute -right-16 top-5 h-40 w-40 rounded-full border border-primary/10" />
      <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
        <div className="absolute left-8 right-8 top-7 hidden h-px bg-gradient-to-r from-primary/45 via-accent/25 to-transparent xl:block" />
        {discoveryNodes.map((node, index) => (
          <div key={node} className="relative rounded-2xl border border-white/10 bg-background/55 p-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono text-xs font-semibold text-primary sm:h-10 sm:w-10">
              0{index + 1}
            </span>
            <p className="mt-3 text-sm font-semibold leading-5 text-foreground">{node}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {index === 0 && "Growth partner"}
              {index === 1 && "Training path"}
              {index === 2 && "Live program"}
              {index === 3 && "Assigned guide"}
              {index === 4 && "Open path"}
              {index === 5 && "Candidate flow"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["companiesList"],
    queryFn: companyApi.getCompanies,
  });

  const companiesData = Array.isArray(data) ? data : [];

  const cities = useMemo(() => {
    return [...new Set(companiesData.map((c) => c.location).filter(Boolean))];
  }, [companiesData]);

  const filteredCompanies = useMemo(() => {
    return companiesData.filter((company) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        company.name.toLowerCase().includes(query) ||
        (company.description && company.description.toLowerCase().includes(query)) ||
        (company.location && company.location.toLowerCase().includes(query));
      const matchesCity = cityFilter === "all" || company.location === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [companiesData, searchTerm, cityFilter]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#07090d]">
      <Navbar />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 tavro-grid-bg opacity-30" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_25%_10%,hsl(var(--primary)/0.18),transparent_36%),radial-gradient(circle_at_78%_12%,hsl(var(--accent)/0.11),transparent_32%)]" />

        <section className="relative px-3 pb-12 pt-28 sm:px-4 sm:pb-16 sm:pt-32">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="animate-fade-up">
                <Badge className="mb-5 border-primary/25 bg-primary/10 text-primary" variant="outline">
                  Tavro company ecosystem
                </Badge>
                <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-6xl">
                  Companies building the next developer paths.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                  Discover IT teams, growth tracks, and opportunities connected through Tavro.
                </p>
              </div>
              <CompaniesTrail />
            </div>
          </div>
        </section>

        <section className="relative px-3 pb-16 sm:px-4 sm:pb-20">
          <div className="container mx-auto max-w-7xl space-y-8">
            <Card className="border-white/10 bg-[#0d1219]/88 shadow-[0_20px_80px_-65px_hsl(var(--primary))]">
              <CardContent className="grid gap-3 p-3 sm:p-4 md:grid-cols-[2fr_1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    type="text"
                    placeholder="Search companies, tracks, or locations..."
                    className="h-11 border-white/10 bg-white/[0.035] pl-10"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="h-11 border-white/10 bg-white/[0.035]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Discovery results</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredCompanies.length}</span> companies connected to trainee growth paths.
                </p>
              </div>
              <Badge variant="outline" className="w-fit border-white/10 text-muted-foreground">
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Live discovery directory
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Fetching companies from the command center...</p>
              </div>
            ) : isError ? (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-12 text-center space-y-4">
                <p className="font-heading text-xl font-semibold text-destructive">Failed to load companies.</p>
                <p className="text-muted-foreground text-sm">Verify the backend server is running and try again.</p>
                <Button onClick={() => refetch()} variant="outline" className="border-destructive/35 text-destructive hover:bg-destructive/10">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-12 text-center">
                <p className="font-heading text-2xl font-semibold text-foreground">No companies matched your path.</p>
                <p className="mt-2 text-muted-foreground">Try adjusting your search or exploring all available opportunities.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCompanies.map((company) => {
                  const logo = company.name.slice(0, 2).toUpperCase();
                  return (
                    <Card key={company.companyId} className="group overflow-hidden border-white/10 bg-[#0d1219]/88 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_70px_-55px_hsl(var(--primary))]">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 font-heading text-base font-semibold text-primary sm:h-14 sm:w-14 sm:text-lg">
                              {logo}
                            </span>
                            <div className="min-w-0">
                              <h2 className="font-heading text-xl font-semibold text-foreground truncate">{company.name}</h2>
                              <p className="mt-1 text-xs text-muted-foreground">{company.email}</p>
                            </div>
                          </div>
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
                        </div>

                        <p className="mt-5 min-h-14 text-sm leading-6 text-muted-foreground line-clamp-3">{company.description || "No description provided."}</p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                            <MapPin className="h-4 w-4 text-primary" />
                            <p className="mt-2 text-sm font-medium text-foreground truncate">{company.location || "Remote"}</p>
                            <p className="text-xs text-muted-foreground">Location</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                            <BriefcaseBusiness className="h-4 w-4 text-accent" />
                            <p className="mt-2 text-sm font-medium text-foreground">{company.numberOfTracks}</p>
                            <p className="text-xs text-muted-foreground">Active Tracks</p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-xs text-primary">
                          <Route className="h-3.5 w-3.5" />
                          <span className="min-w-0">Company &rarr; Track &rarr; Opportunity</span>
                        </div>

                        <Button asChild className="mt-5 w-full">
                          <Link to={`/company/${company.companyId}`}>
                            View company
                            <Building2 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/92 p-4 shadow-[0_24px_90px_-70px_hsl(var(--primary))] sm:rounded-3xl sm:p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Connected paths</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">Find the next company on your path.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Tavro connects company tracks, mentor checkpoints, and opportunities so trainee growth has somewhere real to go.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
                    <Link to="/internships">
                      Explore opportunities
                      <BriefcaseBusiness className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild className="min-h-11 w-full sm:w-auto">
                    <Link to="/signup">
                      Join as a company
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
