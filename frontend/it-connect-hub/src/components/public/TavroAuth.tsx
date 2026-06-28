import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  GitBranch,
  GraduationCap,
  Laptop,
  Loader2,
  MessageSquareText,
  Route,
  ShieldCheck,
} from "lucide-react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const authInputClass =
  "h-12 rounded-2xl border-white/10 bg-white/[0.035] px-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-muted-foreground/70 hover:border-white/20 focus-visible:border-primary/45 focus-visible:bg-white/[0.055] focus-visible:ring-primary/35";

export const authLabelClass = "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

export const signupRoleOptions = [
  {
    value: "student",
    label: "Trainee Path",
    shortLabel: "Trainee",
    mobileDescription: "Missions + GitHub",
    description: "Build experience through missions, GitHub submissions, and visible progress.",
    selectedDescription: "Build experience through missions, GitHub submissions, and visible progress.",
    icon: GraduationCap,
    tone: "primary",
  },
  {
    value: "company",
    label: "Company Path",
    shortLabel: "Company",
    mobileDescription: "Tracks + mentors",
    description: "Create tracks, manage sessions, invite mentors, and connect training to opportunities.",
    selectedDescription: "Create tracks, manage sessions, invite mentors, and connect training to opportunities.",
    icon: Building2,
    tone: "cool",
  },
] as const;

export type SignupRole = (typeof signupRoleOptions)[number]["value"];
type Tone = "primary" | "accent" | "cool" | "neutral";

interface AuthShellProps {
  children: ReactNode;
  visual: ReactNode;
  hideNavbar?: boolean;
}

export function AuthShell({ children, visual, hideNavbar = false }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 tavro-grid-bg opacity-35" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-primary/[0.035] to-transparent" />
      <div className="absolute -left-24 top-44 h-72 w-72 rounded-full border border-primary/10 bg-primary/[0.025] blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full border border-accent/10 bg-accent/[0.025] blur-3xl" />

      {!hideNavbar && <Navbar />}

      <main className={cn("relative z-10 px-3 pb-10 sm:px-4 md:pb-16", hideNavbar ? "pt-10 md:pt-16" : "pt-24 md:pt-32")}>
        <div className="container mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-stretch">
          <div className="order-1">{children}</div>
          <div className="order-2">{visual}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface AuthFormPanelProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthFormPanel({ eyebrow, title, description, children, footer, className }: AuthFormPanelProps) {
  return (
    <section
      className={cn(
        "relative h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/88 p-4 shadow-[0_30px_90px_-65px_hsl(var(--primary))] backdrop-blur-xl sm:rounded-[1.5rem] sm:p-5 md:p-7",
        className,
      )}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-primary/10" />
      <div className="relative">
        <p className="tavro-kicker">{eyebrow}</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-foreground sm:mt-5 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
      </div>

      <div className="relative mt-7">{children}</div>

      {footer ? <div className="relative mt-7 border-t border-white/10 pt-5 text-center">{footer}</div> : null}
    </section>
  );
}

interface AuthTextFieldProps extends ComponentProps<typeof Input> {
  label: string;
  icon: LucideIcon;
}

export function AuthTextField({ label, icon: Icon, id, className, ...props }: AuthTextFieldProps) {
  return (
    <div className="group space-y-2">
      <Label htmlFor={id} className={authLabelClass}>
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />
        <Input id={id} className={cn(authInputClass, "pl-11", className)} {...props} />
      </div>
    </div>
  );
}

interface AuthCommandButtonProps extends ButtonProps {
  isLoading?: boolean;
  tone?: "primary" | "accent";
}

export function AuthCommandButton({ children, className, isLoading = false, tone = "primary", ...props }: AuthCommandButtonProps) {
  return (
    <Button
      size="lg"
      className={cn(
        "group relative h-14 w-full overflow-hidden rounded-full px-7 text-sm font-semibold transition duration-300 active:translate-y-0",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-10px_22px_rgba(0,0,0,0.18)] hover:-translate-y-0.5",
        tone === "accent"
          ? "border border-accent/45 bg-accent text-accent-foreground hover:bg-accent/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-10px_22px_rgba(0,0,0,0.2),0_26px_58px_-34px_hsl(var(--accent))]"
          : "border border-primary/45 bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-10px_22px_rgba(0,0,0,0.2),0_28px_60px_-30px_hsl(var(--primary))]",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-1 rounded-full border border-white/25" />
      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
        {!isLoading ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
      </span>
    </Button>
  );
}

interface RolePathSelectorProps {
  activeRole: SignupRole;
}

export function RolePathSelector({ activeRole }: RolePathSelectorProps) {
  const active = signupRoleOptions.find((role) => role.value === activeRole) ?? signupRoleOptions[0];

  return (
    <div className="mb-6 md:mb-7">
      <div className="mb-3 hidden flex-wrap items-center justify-between gap-2 sm:flex sm:gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">select.route</p>
        <p className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-muted-foreground">
          Active: <span className="text-foreground">{active.shortLabel}</span>
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-[12%] right-[12%] top-11 hidden h-px bg-gradient-to-r from-primary/35 via-accent/25 to-sky-300/20 sm:block" />
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:gap-3">
          {signupRoleOptions.map((role, index) => {
            const Icon = role.icon;
            const isActive = role.value === activeRole;

            return (
              <TabsTrigger
                key={role.value}
                value={role.value}
                className={cn(
                  "group relative h-auto min-h-[104px] flex-col items-start justify-start rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.055] data-[state=active]:shadow-[0_22px_70px_-52px_currentColor] sm:min-h-[132px] sm:p-4",
                  isActive && role.tone === "accent" && "border-accent/45 bg-accent/10 text-accent",
                  isActive && role.tone === "cool" && "border-sky-300/30 bg-sky-300/10 text-sky-100",
                  isActive && role.tone === "primary" && "border-primary/45 bg-primary/10 text-primary",
                )}
              >
                <span className="mb-3 flex w-full items-center justify-between gap-2 sm:mb-4">
                  <span className="font-mono text-[11px] text-muted-foreground">0{index + 1}</span>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                      toneClasses(role.tone, isActive),
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </span>
                <span className="text-sm font-semibold text-foreground">{role.label}</span>
                <span className="mt-2 block whitespace-normal text-xs leading-5 text-muted-foreground sm:hidden">{role.mobileDescription}</span>
                <span className="mt-2 hidden whitespace-normal text-xs leading-5 text-muted-foreground sm:block">{role.description}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <div className="mt-4 hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:block">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{active.label}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.selectedDescription}</p>
      </div>
    </div>
  );
}

interface AuthStoryPanelProps {
  variant: "login" | "signup";
  activeRole?: SignupRole;
}

export function AuthStoryPanel({ variant, activeRole = "student" }: AuthStoryPanelProps) {
  const isSignup = variant === "signup";
  const activeRoleOption = signupRoleOptions.find((role) => role.value === activeRole) ?? signupRoleOptions[0];
  const storyNodes = isSignup ? signupStoryNodes(activeRole) : loginStoryNodes;
  const signupPanelCopy = {
    student: "Start from real missions.",
    company: "Build the paths teams grow through.",
  };

  return (
    <aside className="relative min-h-[330px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/82 p-4 shadow-[0_30px_90px_-65px_hsl(var(--primary))] backdrop-blur-xl sm:min-h-[440px] sm:rounded-[1.5rem] sm:p-5 md:min-h-[620px] md:p-7">
      <div className="absolute inset-0 tavro-grid-bg opacity-45" />
      <div className="absolute -left-20 top-20 h-56 w-56 rounded-full border border-primary/10" />
      <div className="absolute -right-24 bottom-20 h-64 w-64 rounded-full border border-accent/10" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {isSignup ? "tavro.choose_path()" : "tavro.resume_path()"}
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-foreground sm:mt-3 sm:text-2xl md:text-3xl">
            {isSignup ? "One trail, two ways to start." : "Your route is still here."}
          </h2>
          {isSignup ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{signupPanelCopy[activeRole]}</p> : null}
        </div>
        <div className="hidden rounded-2xl border border-white/10 bg-background/60 px-3 py-2 text-right backdrop-blur-md sm:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">checkpoint</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{isSignup ? activeRoleOption.shortLabel : "Welcome back"}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 h-[170px] sm:mt-7 sm:h-[280px] md:h-[380px]">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 760 420" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M18 126 C 116 74, 174 116, 220 166 S 322 260, 414 210 S 520 84, 628 122 C 714 152, 702 256, 574 274 C 456 290, 434 334, 520 390"
            className="tavro-trail-line"
            fill="none"
          />
          <path
            d="M18 126 C 116 74, 174 116, 220 166 S 322 260, 414 210 S 520 84, 628 122 C 714 152, 702 256, 574 274 C 456 290, 434 334, 520 390"
            className="tavro-trail-active"
            fill="none"
          />
        </svg>

        {storyNodes.map((node, index) => {
          const Icon = node.icon;

          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.x, top: node.y }}
            >
              <div className="tavro-trail-node" style={{ animationDelay: `${index * 160 + 260}ms` }}>
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", toneClasses(node.tone, node.active))}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-2 hidden max-w-32 rounded-full border border-white/10 bg-background/70 px-3 py-1 text-center text-[11px] font-medium text-foreground backdrop-blur-md sm:block">
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}

        <AuthDeveloperFigure variant={variant} />
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
        {(isSignup
          ? [
              { label: "Real missions", icon: Code2 },
              { label: "Company invite", icon: MessageSquareText },
              { label: "Team-ready signal", icon: ShieldCheck },
            ]
          : [
              { label: "Path saved", icon: Route },
              { label: "Checkpoints close", icon: MessageSquareText },
              { label: "Progress visible", icon: CheckCircle2 },
            ]
        ).map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-2.5 sm:p-3">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-[11px] font-medium leading-4 text-foreground sm:text-xs">{item.label}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

const loginStoryNodes: StoryNode[] = [
  { label: "Mission waiting", x: "12%", y: "30%", icon: Code2, tone: "primary", active: true },
  { label: "Checkpoint ready", x: "35%", y: "47%", icon: MessageSquareText, tone: "accent", active: true },
  { label: "Path saved", x: "62%", y: "28%", icon: Route, tone: "primary", active: true },
  { label: "Welcome back", x: "82%", y: "64%", icon: CheckCircle2, tone: "primary", active: true },
];

interface StoryNode {
  label: string;
  x: string;
  y: string;
  icon: LucideIcon;
  tone: Tone;
  active: boolean;
}

function signupStoryNodes(activeRole: SignupRole): StoryNode[] {
  return [
    { label: "Trainee", x: "12%", y: "30%", icon: GraduationCap, tone: "primary", active: activeRole === "student" },
    { label: "Company", x: "55%", y: "28%", icon: Building2, tone: "cool", active: activeRole === "company" },
    { label: "Start", x: "82%", y: "64%", icon: GitBranch, tone: "primary", active: true },
  ];
}

function toneClasses(tone: Tone, active = true) {
  if (!active) {
    return "border-white/10 bg-white/[0.035] text-muted-foreground";
  }

  if (tone === "accent") {
    return "border-accent/35 bg-accent/10 text-accent shadow-[0_16px_42px_-30px_hsl(var(--accent))]";
  }

  if (tone === "cool") {
    return "border-sky-300/25 bg-sky-300/10 text-sky-100 shadow-[0_16px_42px_-30px_rgb(125_211_252)]";
  }

  return "border-primary/35 bg-primary/10 text-primary shadow-[0_16px_42px_-30px_hsl(var(--primary))]";
}

function AuthDeveloperFigure({ variant }: { variant: "login" | "signup" }) {
  return (
    <div className="absolute bottom-0 left-1/2 h-40 w-48 -translate-x-1/2 sm:h-48 sm:w-56 md:h-56 md:w-64">
      <div className="absolute bottom-0 left-1/2 h-56 w-64 origin-bottom -translate-x-1/2 scale-[0.72] sm:scale-[0.86] md:scale-100">
        <div className="absolute bottom-6 left-1/2 h-28 w-36 -translate-x-1/2 rounded-[2rem] border border-primary/15 bg-gradient-to-b from-[#202938] to-[#111722] shadow-[0_30px_70px_-55px_hsl(var(--primary))]" />
        <div className="absolute bottom-[118px] left-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#c7a587] shadow-[0_18px_48px_-38px_hsl(var(--primary))]">
          <div className="absolute inset-x-0 top-0 h-8 rounded-b-[1.1rem] bg-[#292735]" />
          <div className="absolute left-5 top-10 h-1.5 w-1.5 rounded-full bg-[#171a22]" />
          <div className="absolute right-5 top-10 h-1.5 w-1.5 rounded-full bg-[#171a22]" />
          <div className="absolute bottom-5 left-1/2 h-px w-5 -translate-x-1/2 bg-[#171a22]/60" />
        </div>
        <div className="absolute bottom-[92px] left-1/2 h-10 w-16 -translate-x-1/2 rounded-b-2xl bg-[#c7a587]" />
        <div className="absolute bottom-0 left-1/2 h-24 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0f151e]/95 p-4 shadow-[0_24px_70px_-52px_hsl(var(--primary))] backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary/70" />
              <span className="h-2 w-2 rounded-full bg-accent/70" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </div>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-28 rounded-full bg-primary/45" />
            <div className="h-1.5 w-40 rounded-full bg-white/15" />
            <div className="h-1.5 w-32 rounded-full bg-accent/35" />
          </div>
        </div>
        <div className="absolute left-4 top-16 rounded-full border border-white/10 bg-background/70 px-3 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
          {variant === "login" ? "saved route" : "path fork"}
        </div>
      </div>
    </div>
  );
}
