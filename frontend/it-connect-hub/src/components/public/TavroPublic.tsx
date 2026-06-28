import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FileCheck2,
  GitBranch,
  GraduationCap,
  MessageSquareText,
  Route,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

export { BrandLogo as TavroMark };

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      {eyebrow ? <p className="tavro-kicker">{eyebrow}</p> : null}
      <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base md:text-lg md:leading-7">{description}</p> : null}
    </div>
  );
}

const trailNodes = [
  { label: "Real Missions", x: "11%", y: "28%", icon: Code2, tone: "primary" },
  { label: "GitHub Submit", x: "35%", y: "40%", icon: GitBranch, tone: "cool" },
  { label: "Mentor Check", x: "52%", y: "24%", icon: MessageSquareText, tone: "accent" },
  { label: "Visible Progress", x: "75%", y: "40%", icon: Route, tone: "primary" },
  { label: "Team Ready", x: "97%", y: "50%", icon: CheckCircle2, tone: "primary" },
];

export function TavroTrail() {
  return (
    <div className="tavro-reveal mx-auto mt-4 max-w-5xl md:mt-5" style={{ animationDelay: "190ms" }}>
      <div className="relative hidden min-h-[235px] sm:block lg:min-h-[255px]">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1000 340" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M-40 94 C 80 62, 130 90, 190 118 S 278 196, 362 178 S 448 70, 548 88 S 640 190, 724 172 S 816 70, 930 98 C 1000 116, 960 230, 800 232 C 690 234, 626 226, 585 260 C 548 292, 500 316, 454 288 C 408 260, 346 238, 282 254 C 204 274, 178 318, 244 334 C 326 356, 428 332, 500 340"
            className="tavro-trail-shadow"
            fill="none"
          />
          <path
            d="M-40 94 C 80 62, 130 90, 190 118 S 278 196, 362 178 S 448 70, 548 88 S 640 190, 724 172 S 816 70, 930 98 C 1000 116, 960 230, 800 232 C 690 234, 626 226, 585 260 C 548 292, 500 316, 454 288 C 408 260, 346 238, 282 254 C 204 274, 178 318, 244 334 C 326 356, 428 332, 500 340"
            className="tavro-trail-line"
            fill="none"
          />
          <path
            d="M-40 94 C 80 62, 130 90, 190 118 S 278 196, 362 178 S 448 70, 548 88 S 640 190, 724 172 S 816 70, 930 98 C 1000 116, 960 230, 800 232 C 690 234, 626 226, 585 260 C 548 292, 500 316, 454 288 C 408 260, 346 238, 282 254 C 204 274, 178 318, 244 334 C 326 356, 428 332, 500 340"
            className="tavro-trail-active"
            fill="none"
          />
        </svg>

        {trailNodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.x, top: node.y }}
            >
              <div className="tavro-trail-node" style={{ animationDelay: `${index * 170 + 360}ms` }}>
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl border shadow-[0_16px_40px_-30px_currentColor]",
                    node.tone === "accent"
                      ? "border-accent/35 bg-accent/10 text-accent"
                      : node.tone === "cool"
                        ? "border-sky-300/25 bg-sky-300/10 text-sky-200"
                        : "border-primary/35 bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-2 block rounded-full border border-white/10 bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md">
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}

        <div className="absolute left-1/2 top-[72%] w-full max-w-[32rem] -translate-x-1/2 -translate-y-1/2 px-2">
          <TrailButtons />
        </div>

        <div className="absolute bottom-[-0.35rem] left-1/2 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 to-transparent" />
        <div className="absolute bottom-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-primary/45 bg-background shadow-[0_0_22px_hsl(var(--primary)_/_0.35)]" />
      </div>

      <div className="sm:hidden">
        <div className="rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/82 p-3 min-[380px]:p-4">
          <div className="grid grid-cols-2 gap-2">
            {trailNodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div key={node.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <span className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-xl border", node.tone === "accent" ? "border-accent/30 bg-accent/10 text-accent" : "border-primary/30 bg-primary/10 text-primary")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-medium text-foreground">{node.label}</p>
                  {index < trailNodes.length - 1 ? <div className="mt-3 h-px bg-gradient-to-r from-primary/35 to-transparent" /> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <TrailButtons />
          </div>
          <div className="mx-auto mt-4 h-12 w-px bg-gradient-to-b from-primary/45 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function TrailButtons() {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-background/70 p-2.5 shadow-[0_24px_70px_-56px_hsl(var(--primary))] backdrop-blur-xl sm:rounded-full">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/signup"
          className="group relative flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-primary/55 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.38),inset_0_-12px_24px_rgba(0,0,0,0.2),0_24px_54px_-30px_hsl(var(--primary))] transition duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-12px_24px_rgba(0,0,0,0.22),0_30px_66px_-28px_hsl(var(--primary))] active:translate-y-0 active:shadow-[inset_0_2px_18px_rgba(0,0,0,0.22),0_16px_40px_-34px_hsl(var(--primary))] sm:min-h-[3.9rem] sm:px-6 sm:py-4"
        >
          <span className="absolute inset-1 rounded-full border border-white/25" />
          <span className="relative flex items-center gap-2.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary-foreground/35 bg-primary-foreground/15 shadow-[0_0_18px_rgba(7,9,13,0.18)]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            </span>
            Start Path
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          to="/services"
          className="group relative flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-[#10151d] px-5 py-3 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-12px_24px_rgba(0,0,0,0.24),0_18px_48px_-38px_hsl(var(--accent))] transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-12px_24px_rgba(0,0,0,0.24),0_26px_56px_-42px_hsl(var(--accent))] active:translate-y-0 active:shadow-[inset_0_2px_18px_rgba(0,0,0,0.26)] sm:min-h-[3.9rem] sm:px-6 sm:py-4"
        >
          <span className="absolute inset-1 rounded-full border border-accent/20" />
          <span className="relative flex items-center gap-2.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-accent/45 bg-accent/10 shadow-[0_0_16px_hsl(var(--accent)_/_0.18)]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            View Journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

const mapNodes = [
  { label: "Join a track", meta: "Track", x: "15%", y: "60%", icon: Route, tone: "neutral" },
  { label: "First mission", meta: "Mission", x: "27%", y: "35%", icon: Code2, tone: "mint", mobileHidden: true },
  { label: "GitHub submission", meta: "Repo", x: "42%", y: "50%", icon: GitBranch, tone: "cool" },
  { label: "Mentor checkpoint", meta: "Mentor", x: "56%", y: "29%", icon: MessageSquareText, tone: "amber", mobileHidden: true },
  { label: "Checkpoint", meta: "Signal", x: "67%", y: "58%", icon: FileCheck2, tone: "amber" },
  { label: "Opportunity", meta: "Company", x: "80%", y: "38%", icon: BriefcaseBusiness, tone: "neutral", mobileHidden: true },
  { label: "Team ready", meta: "Outcome", x: "88%", y: "62%", icon: CheckCircle2, tone: "mint" },
];

const mobileMapNodes = [
  { label: "Mission", icon: Code2, tone: "mint" },
  { label: "GitHub Submit", icon: GitBranch, tone: "cool" },
  { label: "Mentor Checkpoint", icon: MessageSquareText, tone: "amber" },
  { label: "Opportunity", icon: BriefcaseBusiness, tone: "neutral" },
];

export function GrowthMap() {
  const toneClass = {
    amber: "border-accent/30 bg-accent/10 text-accent",
    cool: "border-sky-300/25 bg-sky-300/10 text-sky-200",
    mint: "border-primary/25 bg-primary/10 text-primary",
    neutral: "border-white/10 bg-white/[0.04] text-muted-foreground",
  };

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -left-16 top-1/2 hidden h-px w-32 bg-gradient-to-l from-primary/45 to-transparent md:block" />
      <div className="absolute -right-16 top-[34%] hidden h-px w-32 bg-gradient-to-r from-primary/45 to-transparent md:block" />
      <div className="absolute -left-6 top-20 hidden h-3 w-3 rounded-full border border-primary/40 bg-background shadow-[0_0_26px_hsl(var(--primary)_/_0.35)] md:block" />
      <div className="absolute -right-7 bottom-28 hidden h-3 w-3 rounded-full border border-accent/45 bg-background shadow-[0_0_24px_hsl(var(--accent)_/_0.24)] md:block" />

      <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/82 p-4 shadow-[0_30px_90px_-60px_hsl(var(--primary))] backdrop-blur-xl sm:hidden">
        <div className="absolute inset-0 tavro-grid-bg opacity-45" />
        <div className="absolute -right-20 top-8 h-44 w-44 rounded-full border border-primary/10" />
        <div className="absolute -left-20 bottom-8 h-36 w-36 rounded-full border border-accent/10" />

        <div className="relative z-10 flex items-center justify-between rounded-full border border-white/10 bg-background/40 px-3 py-2">
          <span className="font-mono text-xs text-primary">tavro.path</span>
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.55)]" />
        </div>

        <div className="relative z-10 mt-5">
          <div className="absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-primary via-primary/35 to-accent/25" />
          <div className="space-y-3">
            {mobileMapNodes.map((node, index) => {
              const Icon = node.icon;

              return (
                <div key={node.label} className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111720]/86 p-3">
                  <span className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", toneClass[node.tone as keyof typeof toneClass])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-foreground">{node.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {index === 0 && "start"}
                      {index === 1 && "submit"}
                      {index === 2 && "signal"}
                      {index === 3 && "next"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative hidden h-[430px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14]/82 p-3 shadow-[0_30px_90px_-60px_hsl(var(--primary))] backdrop-blur-xl sm:block sm:h-[450px] sm:rounded-[1.35rem] sm:p-4 md:h-[500px]">
        <div className="absolute inset-0 tavro-grid-bg opacity-55" />
        <div className="absolute -left-24 top-24 h-40 w-40 rounded-full border border-primary/10" />
        <div className="absolute -right-28 bottom-16 h-52 w-52 rounded-full border border-accent/10" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-center rounded-full border border-white/10 bg-background/35 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md sm:inset-x-8 sm:top-8 sm:justify-between sm:px-4">
          <span className="font-mono text-primary">tavro.path</span>
          <span className="hidden sm:inline">Missions &rarr; GitHub &rarr; checkpoint &rarr; opportunity</span>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M-80 315 C 116 288, 190 170, 282 185 S 396 286, 512 168 S 668 304, 804 205 S 930 275, 1080 304"
            className="tavro-path"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          <path
            d="M-80 315 C 116 288, 190 170, 282 185 S 396 286, 512 168 S 668 304, 804 205 S 930 275, 1080 304"
            className="tavro-path-highlight"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M100 145 C 240 72, 380 110, 456 86 S 650 80, 835 110"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeDasharray="4 14"
            strokeLinecap="round"
            strokeOpacity="0.28"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute left-[44%] top-[72%] hidden -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary/25 bg-background/80 p-2 shadow-[0_20px_50px_-38px_hsl(var(--primary))] backdrop-blur-md sm:block">
          <div className="flex items-center gap-2">
            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-primary/25 bg-[#caa98d]">
              <span className="absolute inset-x-1 top-0 h-4 rounded-b-xl bg-[#2f2a35]" />
              <span className="absolute left-2.5 top-5 h-1.5 w-1.5 rounded-full bg-[#151922]" />
              <span className="absolute right-2.5 top-5 h-1.5 w-1.5 rounded-full bg-[#151922]" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Current trainee</p>
              <p className="font-mono text-[10px] text-primary">path active</p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0">
          {mapNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div
                key={node.label}
                className={cn("group absolute w-24 -translate-x-1/2 -translate-y-1/2 sm:w-36 lg:w-40", node.mobileHidden && "hidden sm:block")}
                style={{ left: node.x, top: node.y, animationDelay: `${index * 95}ms` }}
              >
                <div className="tavro-reveal rounded-2xl border border-white/10 bg-[#111720]/90 p-3 shadow-[0_18px_45px_-34px_hsl(var(--primary))] transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-[#131b25]">
                  <span className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border", toneClass[node.tone as keyof typeof toneClass])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-semibold text-foreground sm:text-sm">{node.label}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground sm:text-[11px]">{node.meta}</p>
                </div>
                <span className="absolute left-1/2 top-1/2 -z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 opacity-0 transition duration-300 group-hover:scale-150 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-3">
          {[
            ["Current focus", "GitHub submission"],
            ["Mentor signal", "Checkpoint open"],
            ["Next milestone", "Opportunity path"],
          ].map(([label, value], index) => (
            <div key={label} className={cn("rounded-xl border bg-background/55 p-3 backdrop-blur-md", index === 1 ? "border-accent/20" : "border-white/10")}>
              <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
              <p className={cn("mt-1 text-sm font-medium", index === 1 ? "text-accent" : "text-foreground")}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewProofPanel() {
  const events = [
    ["repo submitted", "primary"],
    ["mentor opened checkpoint", "accent"],
    ["feedback received", "accent"],
    ["checkpoint unlocked", "primary"],
    ["path updated", "primary"],
  ];

  return (
      <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14] p-4 shadow-[0_30px_80px_-64px_hsl(var(--primary))] sm:p-5">
      <div className="absolute inset-0 tavro-grid-bg opacity-25" />
      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs text-primary">mission.checkpoint()</p>
            <h3 className="mt-1 font-heading text-xl font-semibold">Code checkpoints become progress.</h3>
          </div>
          <span className="w-fit rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs text-accent">Checkpoint signal</span>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_0.85fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 font-mono text-xs leading-7">
            <p className="text-muted-foreground">git remote: tavro/first-mission</p>
            <p className="text-primary">+ repo submitted</p>
            <p className="text-accent">+ mentor opened checkpoint</p>
            <p className="text-accent">+ feedback received</p>
            <p className="text-primary">+ checkpoint unlocked</p>
            <p className="text-foreground/80">+ path updated</p>
          </div>
          <div className="space-y-3">
            {events.map(([event, tone], index) => (
              <div key={event} className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/45 p-3">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-[10px]",
                    tone === "accent" ? "border-accent/30 bg-accent/10 text-accent" : "border-primary/30 bg-primary/10 text-primary",
                  )}
                >
                  {index + 1}
                </span>
                <p className="text-sm text-muted-foreground">{event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeveloperIllustration() {
  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14] p-4 shadow-[0_30px_90px_-62px_hsl(var(--primary))] sm:min-h-[420px] sm:rounded-[1.35rem] sm:p-6">
      <div className="absolute inset-0 tavro-grid-bg opacity-40" />
      <div className="absolute left-8 top-8 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
        trainee workspace
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 420" aria-hidden="true">
        <path
          d="M72 258 C 150 130, 220 162, 282 118 S 374 120, 438 78"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeDasharray="6 12"
          strokeLinecap="round"
          strokeOpacity="0.36"
          strokeWidth="2"
        />
        <path
          d="M86 314 C 168 246, 240 310, 318 252 S 404 218, 456 284"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeDasharray="4 14"
          strokeLinecap="round"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute left-[12%] top-[58%] h-3 w-3 rounded-full border border-primary/50 bg-primary/20" />
      <div className="absolute right-[14%] top-[20%] h-3 w-3 rounded-full border border-primary/50 bg-primary/20" />
      <div className="absolute right-[8%] top-[68%] h-2.5 w-2.5 rounded-full border border-accent/50 bg-accent/15" />

      <div className="relative mx-auto mt-12 flex max-w-sm flex-col items-center">
        <div className="relative h-32 w-28">
          <div className="absolute left-2 top-0 h-20 w-24 rounded-[2.4rem_2.4rem_1.6rem_1.6rem] bg-[#26222b]" />
          <div className="absolute left-4 top-5 h-24 w-20 rounded-[2rem] border border-white/10 bg-[#caa98d] shadow-[0_22px_58px_-42px_hsl(var(--primary))]">
            <div className="absolute -top-3 left-1 h-10 w-16 rounded-br-[2rem] rounded-tl-[2rem] bg-[#2f2a35]" />
            <div className="absolute left-5 top-11 h-2.5 w-2.5 rounded-full bg-[#151922]" />
            <div className="absolute right-5 top-11 h-2.5 w-2.5 rounded-full bg-[#151922]" />
            <div className="absolute bottom-8 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#7b6354]" />
          </div>
          <div className="absolute left-0 top-12 h-11 w-4 rounded-l-full border border-white/10 bg-[#111720]" />
          <div className="absolute right-0 top-12 h-11 w-4 rounded-r-full border border-white/10 bg-[#111720]" />
          <div className="absolute left-1 top-[4.6rem] h-2 w-24 rounded-full bg-primary/20" />
        </div>

        <div className="-mt-1 h-28 w-48 rounded-t-[2.2rem] border border-primary/15 bg-[#151b24]">
          <div className="mx-auto mt-5 h-10 w-24 rounded-b-[2rem] border border-white/10 bg-[#0f141c]" />
        </div>
        <div className="-mt-10 w-60 rounded-2xl border border-white/10 bg-[#10151d] p-4 shadow-2xl min-[380px]:w-72">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/75" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/90" />
          </div>
          <div className="space-y-2 font-mono text-xs">
            <p className="text-muted-foreground">mission.checkpoint()</p>
            <p className="text-primary">+ feedback received</p>
            <p className="text-foreground/80">+ next checkpoint unlocked</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 sm:bottom-6 sm:left-6 sm:right-6 sm:gap-3">
        {["Safe pace", "Real code", "Mentor signal"].map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center text-[11px] leading-4 text-muted-foreground sm:p-3 sm:text-xs">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConnectedSides() {
  const sides = [
    {
      title: "Trainees",
      description: "Build experience through real missions, submissions, and visible progress.",
      icon: GraduationCap,
      className: "lg:col-start-1 lg:row-start-1",
    },
    {
      title: "Mentors",
      description: "Guide mentor checkpoints and keep feedback close to the actual code.",
      icon: UsersRound,
      className: "lg:col-start-3 lg:row-start-1",
    },
    {
      title: "Companies",
      description: "Manage tracks, sessions, opportunities, and candidate readiness from one connected workspace.",
      icon: BriefcaseBusiness,
      className: "lg:col-start-2 lg:row-start-2",
    },
  ];

  return (
    <div className="relative mx-auto mt-10 max-w-5xl rounded-[1.25rem] border border-white/10 bg-[#0b0f14] p-4 sm:mt-12 sm:rounded-[1.35rem] sm:p-5 md:p-8">
      <div className="absolute inset-0 tavro-grid-bg opacity-25" />
      <svg className="absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M500 228 L245 132" stroke="hsl(var(--primary))" strokeOpacity="0.38" strokeWidth="1.5" />
        <path d="M500 228 L755 132" stroke="hsl(var(--accent))" strokeOpacity="0.32" strokeWidth="1.5" />
        <path d="M500 228 L500 400" stroke="hsl(var(--primary))" strokeOpacity="0.28" strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 grid gap-4 lg:grid-cols-3 lg:grid-rows-[1fr_auto]">
        <div className="order-first flex items-center justify-center lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-primary/25 bg-primary/10 text-primary shadow-[0_26px_70px_-50px_hsl(var(--primary))] sm:h-36 sm:w-36">
            <span className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-primary/45 bg-background" />
            <span className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-accent/45 bg-background" />
            <span className="absolute bottom-[-0.4rem] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-primary/45 bg-background" />
            <BrandLogo compact iconClassName="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
        </div>

        {sides.map((side) => {
          const Icon = side.icon;
          return (
            <div key={side.title} className={cn("rounded-[1.1rem] border border-white/10 bg-white/[0.035] p-5", side.className)}>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-heading text-lg font-semibold">{side.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{side.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PublicCtaProps {
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryTo?: string;
  secondaryTo?: string;
}

export function PublicCta({
  title,
  description,
  primaryLabel = "Get started",
  secondaryLabel = "View services",
  primaryTo = "/signup",
  secondaryTo = "/services",
}: PublicCtaProps) {
  return (
    <section className="px-3 pb-12 sm:px-4 sm:pb-14">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-primary/25 bg-[#0b0f14] p-5 text-center shadow-[0_30px_90px_-66px_hsl(var(--primary))] sm:rounded-[1.35rem] sm:p-8 md:p-12">
          <div className="absolute inset-0 tavro-grid-bg opacity-35" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-lg">{description}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-11 w-full sm:min-w-44 sm:w-auto">
                <Link to={primaryTo}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11 w-full sm:min-w-44 sm:w-auto">
                <Link to={secondaryTo}>{secondaryLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
