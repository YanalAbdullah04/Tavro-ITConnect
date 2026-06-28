import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, Eye, FileText, Filter, Search, User, XCircle } from "lucide-react";

import { applicantApi } from "@/lib/api/applicant";
import { getApiErrorMessages } from "@/lib/api/client";
import type { ApplicantResponse, ApplicantStatus } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusOptions: ApplicantStatus[] = ["Pending", "Interviewed", "Accepted", "Rejected"];

export function ApplicantsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "all">("Pending");
  const [page, setPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantResponse | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ applicant: ApplicantResponse; status: ApplicantStatus } | null>(null);

  const applicantsQuery = useQuery({
    queryKey: ["applicants", { searchQuery, statusFilter, page }],
    queryFn: () => applicantApi.getApplicants({
      SearchString: searchQuery,
      status: statusFilter === "all" ? undefined : statusFilter,
      CurentPage: page,
      PageSize: 5,
    }),
  });

  const applicantDetailsQuery = useQuery({
    queryKey: [
      "applicantDetails",
      selectedApplicant?.applicantId,
      selectedApplicant?.traineeId,
      selectedApplicant?.trainingSessionId,
    ],
    queryFn: () => applicantApi.getApplicantDetails(selectedApplicant!.applicantId, {
      traineeid: selectedApplicant!.traineeId,
      trainingsessionid: selectedApplicant!.trainingSessionId,
    }),
    enabled: !!selectedApplicant,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicantStatus }) => applicantApi.updateApplicantStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicantDetails", variables.id] });
      setSelectedApplicant((current) => current?.applicantId === variables.id ? { ...current, status: variables.status } : current);
      setPendingStatusChange(null);
      toast({ title: "Status updated", description: "Candidate status has been updated." });
    },
    onError: (error) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Status update failed", description: message, variant: "destructive" });
      });
    },
  });

  const applicants = applicantsQuery.data?.items ?? [];
  const isAccepted = (status?: string | null) => status?.toLowerCase() === "accepted";

  const requestStatusChange = (applicant: ApplicantResponse, status: ApplicantStatus) => {
    if (!applicant.applicantId || status === applicant.status) return;

    if (isAccepted(applicant.status)) {
      toast({
        title: "Candidate already accepted",
        description: "Accepted candidates are confirmed in the training program and cannot be changed.",
      });
      return;
    }

    setPendingStatusChange({ applicant, status });
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange?.applicant.applicantId || updateStatusMutation.isPending) return;

    updateStatusMutation.mutate({
      id: pendingStatusChange.applicant.applicantId,
      status: pendingStatusChange.status,
    });
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "accepted": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "interviewed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold">Candidates</h2>
        <p className="text-muted-foreground">Follow candidate status across your opportunity pipeline.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-2"><CardContent className="p-4"><p className="text-3xl font-bold text-primary">{applicantsQuery.data?.totalCount ?? 0}</p><p className="text-sm text-muted-foreground">Total Candidates</p></CardContent></Card>
        <Card className="border-2"><CardContent className="p-4"><p className="text-3xl font-bold text-primary">{applicantsQuery.data?.curentPage ?? page}</p><p className="text-sm text-muted-foreground">Current Page</p></CardContent></Card>
        <Card className="border-2"><CardContent className="p-4"><p className="text-3xl font-bold text-primary">{applicantsQuery.data?.totalPages ?? 0}</p><p className="text-sm text-muted-foreground">Total Pages</p></CardContent></Card>
        <Card className="border-2"><CardContent className="p-4"><p className="text-3xl font-bold text-primary">{applicants.length}</p><p className="text-sm text-muted-foreground">Shown</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
            className="pl-10 border-2 focus:border-primary"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as ApplicantStatus | "all"); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48 border-2">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          {applicantsQuery.isLoading && <p className="p-8 text-center text-muted-foreground">Loading candidates...</p>}
          {applicantsQuery.isError && <p className="p-8 text-center text-destructive">Unable to load candidates.</p>}
          {!applicantsQuery.isLoading && !applicantsQuery.isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden lg:table-cell">Track</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.applicantId ?? `${applicant.traineeEmail}-${applicant.createdAt}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">{(applicant.traineeName || "?")[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{applicant.traineeName || "Unnamed candidate"}</p>
                            <p className="text-xs text-muted-foreground">{applicant.traineeEmail || "No email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{applicant.trackName || "No track"}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(applicant.status)} gap-1`}>
                          {getStatusIcon(applicant.status)}
                          {applicant.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{applicant.createdAt?.slice(0, 10)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedApplicant(applicant)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={applicant.status ?? "Pending"}
                            onValueChange={(status) => requestStatusChange(applicant, status as ApplicantStatus)}
                            disabled={isAccepted(applicant.status) || updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {applicants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-foreground">No candidates in the path yet.</p>
                  <p className="mt-1 text-sm">Candidates will appear here when trainees apply to opportunities.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!applicantsQuery.data?.havePreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
        <Button variant="outline" disabled={!applicantsQuery.data?.haveNextPage} onClick={() => setPage((current) => current + 1)}>Next</Button>
      </div>

      <Dialog open={!!selectedApplicant} onOpenChange={(open) => { if (!open) setSelectedApplicant(null); }}>
        <DialogContent className="sm:max-w-lg border-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Candidate Details</DialogTitle>
            <DialogDescription>Candidate information connected to the selected opportunity path.</DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              {applicantDetailsQuery.isLoading && <p className="text-muted-foreground">Loading candidate details...</p>}
              {applicantDetailsQuery.isError && <p className="text-destructive">Unable to load candidate details.</p>}
              {!applicantDetailsQuery.isLoading && !applicantDetailsQuery.isError && (
                <>
                  <p><span className="text-muted-foreground">Name:</span> {applicantDetailsQuery.data?.traineeName || selectedApplicant.traineeName || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Email:</span> {applicantDetailsQuery.data?.email || selectedApplicant.traineeEmail || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {applicantDetailsQuery.data?.phoneNumber || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Track:</span> {applicantDetailsQuery.data?.trackName || selectedApplicant.trackName || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Training Session:</span> {applicantDetailsQuery.data?.trainingSessionTitle || selectedApplicant.trainingSessionId || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Skills:</span> {applicantDetailsQuery.data?.skills || "Not provided"}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Resume:</span>
                    {applicantDetailsQuery.data?.resumeUrl ? (
                      <a
                        href={applicantDetailsQuery.data.resumeUrl.startsWith("/") ? `${import.meta.env.VITE_API_BASE_URL ?? ""}${applicantDetailsQuery.data.resumeUrl}` : applicantDetailsQuery.data.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Resume
                      </a>
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                  <p><span className="text-muted-foreground">Portfolio:</span> {applicantDetailsQuery.data?.portfolioLink || "Not provided"}</p>
                  <p><span className="text-muted-foreground">Created:</span> {(applicantDetailsQuery.data?.applicationDate || selectedApplicant.createdAt).slice(0, 10)}</p>
                  <Badge className={getStatusColor(applicantDetailsQuery.data?.status || selectedApplicant.status)}>
                    {applicantDetailsQuery.data?.status || selectedApplicant.status || "Unknown"}
                  </Badge>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingStatusChange} onOpenChange={(open) => { if (!open && !updateStatusMutation.isPending) setPendingStatusChange(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              Change {pendingStatusChange?.applicant.traineeName || "this candidate"} from {pendingStatusChange?.applicant.status || "Unknown"} to {pendingStatusChange?.status}?
              {pendingStatusChange?.status === "Accepted"
                ? " Once accepted, the student is confirmed in the training program and the status cannot be changed again."
                : " You can still change this candidate later unless they are accepted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Updating..." : "Confirm Change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
