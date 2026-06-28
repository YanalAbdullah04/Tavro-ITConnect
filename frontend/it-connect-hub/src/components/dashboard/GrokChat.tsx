import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Minimize2, Maximize2, Trash2 } from "lucide-react";
import { getUserIdFromToken } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROK_MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = `You are an AI assistant integrated into Tavro — a full-stack training and internship management platform that connects companies, trainers/mentors, and trainees in one structured workspace.

## About Tavro (ITConnect Platform)

Tavro is designed around three main dashboards:

1. **Company Workspace** — Manage tracks, training sessions, trainers, internship posts, and applicants.
2. **Trainer / Mentor Workspace** — View training sessions, assign tasks to trainees (all or selected), track submissions, and review GitHub code.
3. **Trainee / Student Workspace** — View dashboard, profile, tasks, internships. Connect GitHub, select a real repository/branch, and submit task work.

## Core Features
- Role-based access: Company, Trainer, Trainee
- Training session management (paid/unpaid)
- Task assignment with optional file attachments and trainee selection
- Trainee task submission via GitHub repository data (repo, branch, commit SHA)
- GitHub App integration for real code review
- Internship browsing and application

## Tech Stack
- **Frontend**: React, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: ASP.NET Core / .NET 8, Entity Framework Core, ASP.NET Identity, FluentValidation
- **Database**: SQL Server (MSSQLSERVER01)
- **Auth**: JWT tokens stored in localStorage (key: itConnectToken)

## Task Submission Flow
Trainees submit tasks with: taskAssignmentId, githubRepo, githubBranch, githubRepoUrl, optional githubCommitSha.

## GitHub Integration Flow
Trainee clicks Connect GitHub → GET /api/GitHub/install-url → GitHub App install popup → callback saves installationId → trainee can select real repos and branches.

## API Base URL
Backend runs on http://localhost:5231. All endpoints require Bearer JWT token except public auth endpoints.

---

You are here to help the **trainee** with:
- Understanding their tasks, assignments, and how to submit them
- Learning programming concepts (frontend: React, TypeScript, Tailwind; backend: .NET, SQL)
- GitHub workflow: repos, branches, commits, pull requests, code review
- Career advice and professional development
- Any technical or platform-related questions

Be concise, helpful, and encouraging. Respond in the same language the trainee uses (Arabic, English, or Darija).`;


function getChatKey(userId: string) {
  return `grok_chat_${userId}`;
}

function loadMessages(userId: string): Message[] {
  try {
    const raw = localStorage.getItem(getChatKey(userId));
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(userId: string, messages: Message[]) {
  localStorage.setItem(getChatKey(userId), JSON.stringify(messages));
}

async function sendToGrok(messages: Message[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
  const res = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "No response.";
}

export function GrokChat() {
  const userId = getUserIdFromToken();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() =>
    userId ? loadMessages(userId) : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  if (!userId) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    saveMessages(userId, next);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendToGrok(next);
      const assistantMsg: Message = { role: "assistant", content: reply, timestamp: Date.now() };
      const final = [...next, assistantMsg];
      setMessages(final);
      saveMessages(userId, final);
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      const final = [...next, errMsg];
      setMessages(final);
      saveMessages(userId, final);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    saveMessages(userId, []);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_8px_32px_-8px_hsl(var(--primary))] transition-transform hover:scale-110"
        >
          <Bot className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-white/10 bg-[#0d1219] shadow-[0_24px_70px_-12px_rgba(0,0,0,0.8)] transition-all duration-200",
            minimized ? "h-14 w-80" : "h-[560px] w-[380px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl border-b border-white/10 bg-primary/10 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Grok AI</p>
              {!minimized && (
                <p className="text-xs text-muted-foreground">Tavro Assistant</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!minimized && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMinimized(!minimized)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                {minimized ? (
                  <Maximize2 className="h-3.5 w-3.5" />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Grok AI Assistant</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Ask me anything about your tasks, code, or career.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-white/10 bg-white/[0.04] text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-3">
                <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Grok anything..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    style={{ maxHeight: "96px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
