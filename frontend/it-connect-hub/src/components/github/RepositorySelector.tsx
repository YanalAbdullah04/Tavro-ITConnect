import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch, Folder, Star, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/auth";
import { githubApi, type GitHubRepository, type SelectedRepo } from "@/lib/api/github";
import { getApiErrorMessages } from "@/lib/api/client";

interface Repository extends GitHubRepository {
  branches: string[];
}

export type { SelectedRepo } from "@/lib/api/github";

interface RepositorySelectorProps {
  selectedRepo: SelectedRepo | null;
  onSelect: (repo: SelectedRepo) => void;
  refreshToken?: number;
  submitLabel?: string;
}

export default function RepositorySelector({ selectedRepo, onSelect, refreshToken, submitLabel = "Submit Repository" }: RepositorySelectorProps) {
  const { toast } = useToast();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [search, setSearch] = useState("");
  
  const [selectedRepoId, setSelectedRepoId] = useState<string>(selectedRepo?.repoId || "");
  const [selectedBranch, setSelectedBranch] = useState<string>(selectedRepo?.branch || "");

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const traineeId = getUserId();
      if (!traineeId) throw new Error("No trainee ID");
      const reposArray = await githubApi.getRepositories(traineeId);
      
      const mappedRepos: Repository[] = reposArray.map((repository) => {
        const savedBranch = selectedRepo?.repoId === repository.full_name || selectedRepo?.fullName === repository.full_name
          ? selectedRepo.branch
          : null;

        return {
          ...repository,
          branches: Array.from(new Set([repository.default_branch, savedBranch].filter(Boolean) as string[])),
        };
      });
      
      setRepositories(mappedRepos);
      return true;
    } catch (err) {
      toast({
        title: "Repository Fetch Failed",
        description: getApiErrorMessages(err).join(" "),
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, toast]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories, refreshToken]);

  useEffect(() => {
    setSelectedRepoId(selectedRepo?.repoId ?? "");
    setSelectedBranch(selectedRepo?.branch ?? "");
  }, [selectedRepo]);

  const handleRefresh = async () => {
    if (await fetchRepositories()) {
      toast({
        title: "Repositories Refreshed",
        description: "Your repository list has been updated.",
      });
    }
  };

  const handleSubmit = () => {
    const repo = repositories.find(r => r.full_name === selectedRepoId);
    if (!repo || !selectedBranch) return;

    const submission: SelectedRepo = {
      repoId: repo.full_name,
      repoName: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      branch: selectedBranch,
    };

    onSelect(submission);
    toast({
      title: "Repository Configured",
      description: `${repo.name} successfully updated for submission.`,
    });
  };

  const filteredRepos = repositories.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentRepo = repositories.find(r => r.full_name === selectedRepoId);

  const handleRepositorySelect = async (repo: Repository) => {
    setSelectedRepoId(repo.full_name);
    setSelectedBranch("");
    setLoadingBranches(true);
    try {
      const traineeId = getUserId();
      if (!traineeId) throw new Error("Please sign in again to load repository branches.");
      const branches = await githubApi.getBranches(traineeId, repo.owner.login, repo.name);
      const branchNames = branches.map((branch) => branch.name);
      setRepositories((current) => current.map((item) => item.id === repo.id ? { ...item, branches: branchNames } : item));
      setSelectedBranch(branchNames.includes(selectedRepo?.branch ?? "") ? selectedRepo!.branch : branchNames[0] ?? "");
      if (branchNames.length === 0) {
        toast({ title: "No branches found", description: "This repository has no branch available for submission.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Branch Fetch Failed", description: getApiErrorMessages(err).join(" "), variant: "destructive" });
    } finally {
      setLoadingBranches(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
          <Folder className="h-4 w-4 text-primary" />
          Select Repository
        </h4>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 gap-1 text-xs">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {repositories.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No repositories found for this installation. Add repository access in GitHub, then refresh.
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs"
          />

          <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredRepos.map((repo) => {
              const isSelected = selectedRepoId === repo.full_name;
              return (
                <button
                  key={repo.id}
                  onClick={() => handleRepositorySelect(repo)}
                  className={`flex w-full items-start justify-between rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/60 bg-muted/15 hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm">{repo.name}</p>
                      {repo.private && <Badge variant="outline" className="text-[10px] py-0">Private</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{repo.description || "No description"}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{repo.stargazers_count ?? 0}</span>
                      <span>{repo.language || "Unknown"}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />Updated: {repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "Unknown"}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {currentRepo && (
            <Card className="border-border/60 bg-muted/10 p-4 rounded-xl space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Target Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentRepo.branches.map((b) => (
                        <SelectItem key={b} value={b} className="text-xs">
                          <span className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5" />{b}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <Button onClick={handleSubmit} size="sm" className="w-full h-9" disabled={loadingBranches || !selectedBranch}>
                {loadingBranches ? "Loading branches..." : submitLabel}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
