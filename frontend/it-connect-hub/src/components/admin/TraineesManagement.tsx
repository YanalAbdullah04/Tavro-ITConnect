import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Search, Trash2, UserMinus, X } from "lucide-react";

import { companyApi } from "@/lib/api/company";
import { getApiErrorMessages } from "@/lib/api/client";
import type { CompanyTraineeResponse } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TraineesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [firingTrainee, setFiringTrainee] = useState<CompanyTraineeResponse | null>(null);

  const traineesQuery = useQuery({
    queryKey: ["company-trainees", { searchQuery }],
    queryFn: () => companyApi.getCompanyTrainees(searchQuery || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: companyApi.deleteCompanyTrainee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-trainees"] });
      setFiringTrainee(null);
      toast({ title: "Trainee removed", description: "The trainee has been removed from your company." });
    },
    onError: (error: unknown) => {
      getApiErrorMessages(error).forEach((message) => {
        toast({ title: "Failed to remove trainee", description: message, variant: "destructive" });
      });
    },
  });

  const trainees = traineesQuery.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Trainees</h2>
          <p className="text-muted-foreground">View and manage trainees registered in your training sessions.</p>
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainees by name or training session..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10 border-2 focus:border-primary"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{trainees.length}</p>
            <p className="text-sm text-muted-foreground">Total Trainees</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">
              {new Set(trainees.map((t) => t.trainingSessionName)).size}
            </p>
            <p className="text-sm text-muted-foreground">Training Sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserMinus className="h-4 w-4 text-primary" />
            </span>
            Trainees List
          </CardTitle>
          <CardDescription>{trainees.length} trainee(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {traineesQuery.isLoading && <p className="py-8 text-center text-muted-foreground">Loading trainees...</p>}
          {traineesQuery.isError && <p className="py-8 text-center text-destructive">Unable to load trainees.</p>}
          {!traineesQuery.isLoading && !traineesQuery.isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainee</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Training Session</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainees.map((trainee) => (
                    <TableRow key={trainee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">{(trainee.name || "?")[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{trainee.name || "Unnamed trainee"}</p>
                            <p className="text-xs text-muted-foreground md:hidden flex items-center gap-1">
                              <Mail className="h-3 w-3" />{trainee.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />{trainee.email || "No email"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{trainee.trainingSessionName || "Not assigned"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setFiringTrainee(trainee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {trainees.length === 0 && (
                <div className="space-y-4 py-8 text-center">
                  <p className="font-medium text-foreground">No trainees found.</p>
                  <p className="text-sm text-muted-foreground">Trainees will appear here once they register for your training sessions.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!firingTrainee} onOpenChange={(open) => { if (!open) setFiringTrainee(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Trainee</DialogTitle>
            <DialogDescription>This action will permanently remove the trainee from your company.</DialogDescription>
          </DialogHeader>
          <p>Remove <strong>{firingTrainee?.name || "this trainee"}</strong> from <strong>{firingTrainee?.trainingSessionName || "the training session"}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFiringTrainee(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => firingTrainee?.id && deleteMutation.mutate(firingTrainee.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Fire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
