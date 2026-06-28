import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Link, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessages } from "@/lib/api/client";

interface GitHubUser {
  id?: string | null;
  username: string;
  avatarUrl?: string | null;
  htmlUrl?: string | null;
  repositorySelection?: string | null;
}

interface GitHubConnectProps {
  isConnected: boolean;
  isStale: boolean;
  user: GitHubUser | null;
  actionLoading: boolean;
  statusError?: string | null;
  lastInstallMessage?: { success: boolean; message?: string } | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRefresh: () => Promise<unknown>;
  onClearInstallMessage?: () => void;
}

export default function GitHubConnect({ isConnected, isStale, user, actionLoading, statusError, lastInstallMessage, onConnect, onDisconnect, onRefresh, onClearInstallMessage }: GitHubConnectProps) {
  const { toast } = useToast();

  // Show a toast whenever the hook delivers a new installation result.
  // The actual postMessage listener lives in useGitHub so it survives
  // component unmounts caused by tab switches.
  useEffect(() => {
    if (!lastInstallMessage) return;

    if (lastInstallMessage.success) {
      toast({
        title: "GitHub connected",
        description: lastInstallMessage.message || "Your GitHub App installation is ready.",
      });
    } else {
      toast({
        title: "GitHub connection failed",
        description: lastInstallMessage.message || "GitHub could not complete the connection.",
        variant: "destructive",
      });
    }

    onClearInstallMessage?.();
  }, [lastInstallMessage, toast, onClearInstallMessage]);

  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: getApiErrorMessages(error).join(" "),
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      toast({ title: "GitHub disconnected", description: "This Tavro profile is no longer linked to the GitHub App installation." });
    } catch (error) {
      toast({ title: "Disconnect failed", description: getApiErrorMessages(error).join(" "), variant: "destructive" });
    }
  };

  if (isConnected && user) {
    return (
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-background to-background">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="h-12 w-12 rounded-full border border-emerald-500/30 object-cover shadow-md" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                  <Github className="h-6 w-6" />
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white ring-2 ring-background">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            </div>
          <div>
            <div className="flex items-center gap-2">
              {user.htmlUrl ? (
                <a href={user.htmlUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary hover:underline">
                  @{user.username}
                </a>
              ) : (
                <h3 className="font-semibold text-foreground">@{user.username}</h3>
              )}
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                Connected
              </Badge>
            </div>
              <p className="text-xs text-muted-foreground mt-0.5">Ready to submit repositories for your missions.</p>
              {user.repositorySelection ? <p className="mt-1 text-xs text-muted-foreground">Repository access: {user.repositorySelection}</p> : null}
              {statusError ? <p className="mt-1 text-xs text-destructive">Status verification failed: {statusError}</p> : null}
          </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={actionLoading}
            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive group"
          >
            {actionLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4 transition-transform group-hover:scale-110" />}
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden">
      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-primary">
          <Github className="h-5 w-5" />
          <CardTitle className="text-lg">GitHub Sync</CardTitle>
        </div>
        <CardDescription>
          GitHub is not connected yet. Connect GitHub to submit real repositories for mentor checkpoints.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusError ? (
          <div className="rounded-lg border border-destructive/35 bg-destructive/10 p-3 text-xs text-destructive">
            GitHub connection status could not be verified: {statusError}
          </div>
        ) : null}
        {isStale ? (
          <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-amber-600">
            The previous GitHub installation is no longer available. Connect again to restore repository access.
          </div>
        ) : null}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground space-y-2">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Link className="h-4 w-4 text-primary" />
            How GitHub fits into your path:
          </p>
          <ul className="list-inside list-disc pl-1 space-y-1 text-xs">
            <li>Connect through the secure GitHub App flow.</li>
            <li>Choose the repository for your active mission.</li>
            <li>Submit it to unlock the mentor checkpoint.</li>
          </ul>
        </div>
        <Button onClick={handleConnect} disabled={actionLoading} className="w-full sm:w-auto shadow-md">
          {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
          {actionLoading ? "Preparing connection..." : "Connect GitHub"}
        </Button>
      </CardContent>
    </Card>
  );
}
