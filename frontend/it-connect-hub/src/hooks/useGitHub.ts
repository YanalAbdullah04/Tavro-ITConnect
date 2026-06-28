import { useState, useEffect, useCallback, useRef } from "react";
import { githubApi, type GitHubStatusResponse, type SelectedRepo, isGitHubCallbackOriginMatch } from "@/lib/api/github";
import { getApiErrorMessages } from "@/lib/api/client";

export interface GitHubUser {
  id?: string | null;
  username: string;
  avatarUrl?: string | null;
  htmlUrl?: string | null;
  repositorySelection?: string | null;
}

/** Payload delivered by the backend callback page via `window.opener.postMessage`. */
interface GitHubInstallationMessage {
  type: "GITHUB_APP_INSTALLATION_RESULT";
  success: boolean;
  message?: string;
}

function isInstallationMessage(data: unknown): data is GitHubInstallationMessage {
  return !!data && typeof data === "object" && (data as Record<string, unknown>).type === "GITHUB_APP_INSTALLATION_RESULT";
}

export function useGitHub() {
  const [status, setStatus] = useState<GitHubStatusResponse>({ isConnected: false, isStale: false });
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [connectionRevision, setConnectionRevision] = useState(0);
  const [statusError, setStatusError] = useState<string | null>(null);
  /** Stores the last installation message so the UI layer can show a toast. */
  const [lastInstallMessage, setLastInstallMessage] = useState<GitHubInstallationMessage | null>(null);

  const refreshConnection = useCallback(async () => {
    setLoading(true);
    try {
      const nextStatus = await githubApi.getStatus();
      setStatus(nextStatus);
      setStatusError(null);
      setConnectionRevision((current) => current + 1);
      return nextStatus;
    } catch (error) {
      setStatusError(getApiErrorMessages(error).join(" "));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConnection().catch(() => undefined);
  }, [refreshConnection]);

  // ── Global message listener ────────────────────────────────────────────
  // Registered at hook level so it survives tab switches that unmount
  // GitHubConnect.  When the popup posts back GITHUB_APP_INSTALLATION_RESULT,
  // we immediately refresh the connection state.
  const refreshRef = useRef(refreshConnection);
  refreshRef.current = refreshConnection;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isGitHubCallbackOriginMatch(event.origin)) return;
      if (!isInstallationMessage(event.data)) return;

      setLastInstallMessage(event.data);

      if (event.data.success) {
        refreshRef.current().catch(() => undefined);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const clearLastInstallMessage = useCallback(() => setLastInstallMessage(null), []);

  const connectGitHub = useCallback(async () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open("", "GitHubIntegrationPopup", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
    if (!popup) throw new Error("The GitHub connection popup was blocked. Allow popups and try again.");

    setActionLoading(true);
    try {
      const response = await githubApi.getInstallUrl();
      popup.location.href = response.installUrl;
      popup.focus();
    } catch (error) {
      popup.close();
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const disconnectGitHub = useCallback(async () => {
    setActionLoading(true);
    try {
      await githubApi.disconnect();
      setSelectedRepo(null);
      await refreshConnection();
    } finally {
      setActionLoading(false);
    }
  }, [refreshConnection]);

  const selectRepository = useCallback((repo: SelectedRepo) => {
    setSelectedRepo(repo);
  }, []);

  const clearRepository = useCallback(() => {
    setSelectedRepo(null);
  }, []);

  const user: GitHubUser | null = status.isConnected
    ? {
        id: status.installationId?.toString(),
        username: status.accountLogin || "GitHub account",
        avatarUrl: status.accountAvatarUrl,
        htmlUrl: status.accountHtmlUrl,
        repositorySelection: status.repositorySelection,
      }
    : null;

  return {
    isConnected: status.isConnected,
    isStale: status.isStale,
    user,
    selectedRepo,
    loading,
    actionLoading,
    connectionRevision,
    statusError,
    lastInstallMessage,
    connectGitHub,
    disconnectGitHub,
    selectRepository,
    clearRepository,
    refreshConnection,
    clearLastInstallMessage,
  };
}
