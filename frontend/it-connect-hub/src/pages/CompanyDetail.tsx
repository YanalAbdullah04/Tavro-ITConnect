import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { MapPin, Mail, ArrowLeft, Briefcase, RefreshCw } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { companyApi } from "@/lib/api/company";
import type { CompanyTrackResponse } from "@/lib/api/types";

export default function CompanyDetail() {
  const { id } = useParams();
  const [selectedTrack, setSelectedTrack] = useState<CompanyTrackResponse | null>(null);

  const { data: rawCompanies = [], isLoading: isLoadingCompany, isError: isCompanyError } = useQuery({
    queryKey: ["companiesList"],
    queryFn: companyApi.getCompanies,
  });

  const companies = Array.isArray(rawCompanies) ? rawCompanies : [];

  const company = companies.find((c) => c.companyId === id);

  const { data: rawTracks = [], isLoading: isLoadingTracks, isError: isTracksError, refetch: refetchTracks } = useQuery({
    queryKey: ["companyTracks", id],
    queryFn: () => companyApi.getCompanyTracks(id ?? ""),
    enabled: !!id,
  });

  const tracks = Array.isArray(rawTracks) ? rawTracks : [];

  const isLoading = isLoadingCompany || isLoadingTracks;
  const isError = isCompanyError || isTracksError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading company profile and growth paths...</p>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center space-y-4 px-4">
        <p className="font-heading text-xl font-semibold text-destructive">Failed to load company profile.</p>
        <p className="text-muted-foreground text-sm text-center">Verify the company exists and the backend server is running.</p>
        <Link to="/companies">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  const logo = company.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Link to="/companies">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
            </Button>
          </Link>

          <div className="animate-fade-up">
            <Card className="border-2">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-4xl">{logo}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <CardTitle className="text-4xl">{company.name}</CardTitle>
                      <Badge variant="secondary" className="text-base">Growth Partner</Badge>
                    </div>
                    <CardDescription className="text-lg mb-4">{company.description || "No description provided."}</CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{company.numberOfTracks} Active Tracks</span>
                      </div>
                      {company.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{company.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Growth Opportunities</h2>
              {tracks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-12 text-center">
                  <p className="font-heading text-xl font-semibold text-foreground">No active tracks yet.</p>
                  <p className="mt-2 text-muted-foreground">Check back later for new programs from this company.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tracks.map((track) => (
                    <Card 
                      key={track.id} 
                      className="border-2 hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
                      onClick={() => setSelectedTrack(track)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="default">Active Track</Badge>
                        </div>
                        <CardTitle className="text-lg">{track.name}</CardTitle>
                        <CardDescription className="line-clamp-4 mt-2">
                          {track.description || "No description available."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-primary font-medium mt-4">
                          View details &rarr;
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTrack && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">Active Track</Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedTrack.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" />
                  Growth track by {company.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedTrack.description || "No details provided."}</p>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-end">
                  <Button onClick={() => setSelectedTrack(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
