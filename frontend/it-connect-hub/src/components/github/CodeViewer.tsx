import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, ChevronRight, ChevronDown, GitBranch, Github, X, Loader2, ExternalLink } from "lucide-react";
import { githubApi, type GitHubContentItem, type GitHubContentResponse, type SelectedRepo } from "@/lib/api/github";
import { getApiErrorMessages } from "@/lib/api/client";

interface CodeViewerProps {
  repo: SelectedRepo;
  traineeId: string;
  onClose?: () => void;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileNode[];
  isExpanded?: boolean;
}

function toFileNodes(items: GitHubContentItem[]): FileNode[] {
  return items.map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type === "dir" ? "dir" : "file"
  }));
}

function getContentItem(data: GitHubContentResponse) {
  return Array.isArray(data) ? data[0] : data;
}

function decodeBase64Text(content: string) {
  const binary = atob(content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.includes(0)) throw new Error("Binary files cannot be displayed in the code viewer.");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function CodeViewer({ repo, traineeId, onClose }: CodeViewerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("Select a file from the sidebar to view its contents.");
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [loadingTree, setLoadingTree] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = useCallback(async (path: string = ""): Promise<FileNode[]> => {
    try {
      const data = path
        ? await githubApi.getContentByPath(traineeId, repo.owner, repo.repoName, repo.branch, path)
        : await githubApi.getContent(traineeId, repo.owner, repo.repoName, repo.branch);
      const items = Array.isArray(data) ? data : [data];
      return toFileNodes(items);
    } catch (err) {
      setError(getApiErrorMessages(err).join(" "));
      return [];
    }
  }, [traineeId, repo]);

  useEffect(() => {
    const loadRoot = async () => {
      setLoadingTree(true);
      setError(null);
      const rootItems = await loadDirectory();
      setFileTree(rootItems);
      setLoadingTree(false);
    };
    loadRoot();
  }, [loadDirectory]);

  const toggleDirectory = async (node: FileNode) => {
    const updateTreeRecursive = async (nodes: FileNode[]): Promise<FileNode[]> => {
      return Promise.all(
        nodes.map(async (n) => {
          if (n.path === node.path) {
            const isExpanding = !n.isExpanded;
            let children = n.children;
            if (isExpanding && !children) {
              children = await loadDirectory(n.path);
            }
            return { ...n, isExpanded: isExpanding, children };
          } else if (n.children) {
            return { ...n, children: await updateTreeRecursive(n.children) };
          }
          return n;
        })
      );
    };

    const updated = await updateTreeRecursive(fileTree);
    setFileTree(updated);
  };

  const loadFileContent = async (node: FileNode) => {
    setSelectedFilePath(node.path);
    setLoadingContent(true);
    setError(null);
    try {
      const data = getContentItem(await githubApi.getContentByPath(traineeId, repo.owner, repo.repoName, repo.branch, node.path));
      
      if (data?.content && data.encoding === "base64") {
        setFileContent(decodeBase64Text(data.content));
      } else {
        setFileContent(data?.content || "This file is binary, too large, or uses an unsupported GitHub content encoding.");
      }
    } catch (err) {
      const message = getApiErrorMessages(err).join(" ");
      setError(message);
      setFileContent(message);
    } finally {
      setLoadingContent(false);
    }
  };

  const renderNodes = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isDir = node.type === "dir";
      const isSelected = selectedFilePath === node.path;
      return (
        <div key={node.path} style={{ paddingLeft: `${depth * 12}px` }}>
          {isDir ? (
            <button
              onClick={() => toggleDirectory(node)}
              className="flex w-full items-center gap-1.5 py-1.5 px-2 rounded-md text-sm text-muted-foreground hover:bg-muted/35 hover:text-foreground transition-colors text-left"
            >
              {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Folder className="h-4 w-4 text-sky-400 fill-sky-400/15" />
              <span className="truncate">{node.name}</span>
            </button>
          ) : (
            <button
              onClick={() => loadFileContent(node)}
              className={`flex w-full items-center gap-1.5 py-1.5 px-2 rounded-md text-sm transition-colors text-left ${
                isSelected
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/35 hover:text-foreground"
              }`}
            >
              <ChevronRight className="h-4 w-4 opacity-0" />
              <File className="h-4 w-4 text-amber-400 fill-amber-400/15" />
              <span className="truncate">{node.name}</span>
            </button>
          )}
          {isDir && node.isExpanded && node.children && (
            <div className="space-y-0.5">{renderNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="border-border/60 bg-card overflow-hidden shadow-2xl relative h-[650px] flex flex-col">
      {/* Header */}
      <div className="border-b border-border/60 p-4 flex items-center justify-between bg-muted/15 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
              {repo.repoName}
              <Badge variant="outline" className="text-xs bg-muted/40 font-normal">
                <GitBranch className="h-3 w-3 mr-1" />
                {repo.branch}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Trainee Code Evaluator Proxy</p>
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Open repository
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Split Pane */}
      <div className="flex flex-1 min-h-0 divide-x divide-border/60">
        {/* Left Tree Explorer Sidebar */}
        <div className="w-64 sm:w-72 shrink-0 flex flex-col bg-muted/10 h-full">
          <div className="p-3 border-b border-border/60 bg-muted/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</p>
          </div>
          <ScrollArea className="flex-1 p-3">
            {loadingTree ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Reading repository tree...</p>
              </div>
            ) : fileTree.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">{error || "Empty repository or directory."}</p>
            ) : (
              <div className="space-y-0.5">{renderNodes(fileTree)}</div>
            )}
          </ScrollArea>
        </div>

        {/* Right Code Pane */}
        <div className="flex-1 flex flex-col bg-[#0d0f12] h-full overflow-hidden">
          {/* Code Header Tab */}
          <div className="h-10 border-b border-white/5 bg-[#12151a] px-4 flex items-center shrink-0">
            <p className="text-xs font-mono text-white/50 truncate">
              {selectedFilePath || "No file active"}
            </p>
          </div>

          {error ? <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div> : null}

          <div className="flex-1 min-h-0 relative">
            {loadingContent ? (
              <div className="absolute inset-0 bg-[#0d0f12]/80 z-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-white/60 font-mono">Parsing file stream...</p>
              </div>
            ) : null}
            
            <ScrollArea className="h-full w-full">
              <pre className="p-5 font-mono text-xs sm:text-sm text-[#e2e8f0] leading-relaxed whitespace-pre overflow-x-auto selection:bg-primary/30">
                <code>{fileContent}</code>
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Card>
  );
}
