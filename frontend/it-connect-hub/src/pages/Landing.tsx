import {
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  MessageSquareText,
  Route,
} from "lucide-react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  ConnectedSides,
  DeveloperIllustration,
  GrowthMap,
  PublicCta,
  ReviewProofPanel,
  SectionHeading,
  TavroTrail,
} from "@/components/public/TavroPublic";

const pillars = [
  {
    label: "01 / Mission Layer",
    title: "Real Missions",
    description: "Structured missions give trainees real product habits: context, deadlines, submission, and iteration.",
    icon: Code2,
    tone: "primary",
  },
  {
    label: "02 / Checkpoint Layer",
    title: "Mentor Checkpoints",
    description: "Feedback stays close to the work, so every mentor checkpoint can become a visible next step.",
    icon: MessageSquareText,
    tone: "accent",
  },
  {
    label: "03 / Progress Layer",
    title: "Visible Growth",
    description: "Milestones, submissions, and checkpoint moments build a path that trainees and teams can read.",
    icon: Route,
    tone: "primary",
  },
  {
    label: "04 / Opportunity Layer",
    title: "Company Connection",
    description: "Training sessions and opportunities stay connected so progress can lead toward real teams.",
    icon: BriefcaseBusiness,
    tone: "neutral",
  },
];

const journey = [
  {
    title: "Start your path",
    description: "Join a track and understand what is expected from the first checkpoint.",
  },
  {
    title: "Work on real missions",
    description: "Move through missions with deadlines, context, and the habits of a team environment.",
  },
  {
    title: "Submit through GitHub",
    description: "Connect repository work to the platform so mentors can inspect the actual code.",
  },
  {
    title: "Get mentor signal",
    description: "Mentor checkpoint moments help trainees understand what improved and what to sharpen next.",
  },
  {
    title: "Move toward teams",
    description: "Progress and opportunity workflows help companies see who is becoming ready.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="tavro-story-rail" aria-hidden="true" />

        <section className="relative overflow-hidden px-3 pb-12 pt-24 sm:px-4 md:pb-14 md:pt-24 lg:min-h-[700px]">
          <div className="absolute inset-0 tavro-grid-bg opacity-45" />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 to-transparent" />

          <div className="container relative z-10 mx-auto">
            <div className="mx-auto max-w-4xl text-center">
              <p className="tavro-kicker tavro-reveal justify-center">Tavro developer growth platform</p>
              <h1 className="tavro-reveal mt-3 font-heading text-[2.35rem] font-semibold leading-[1.05] text-foreground sm:text-5xl md:text-5xl">
                Grow through real work.
              </h1>
              <p className="tavro-reveal mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base" style={{ animationDelay: "110ms" }}>
                <span className="sm:hidden">Real missions, GitHub submits, and mentor checkpoints in one visible path.</span>
                <span className="hidden sm:inline">
                  Tavro connects trainees, mentors, and IT companies through real missions, GitHub submissions, and visible progress.
                </span>
              </p>
            </div>

            <TavroTrail />

            <div className="tavro-reveal mt-0 md:mt-1" style={{ animationDelay: "300ms" }}>
              <GrowthMap />
            </div>
          </div>
        </section>

        <section className="px-3 py-14 sm:px-4 sm:py-20">
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Tavro operating system"
              title="Four layers for the journey from trainee to teammate."
              description="Missions should lead somewhere. Tavro turns training into a connected system of missions, mentor checkpoints, progress signals, and company-facing opportunity paths."
            />

            <div className="relative mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent xl:block" />
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="tavro-reveal group relative rounded-[1.1rem] border border-white/10 bg-[#0d1219]/88 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-[#101720]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <p className="font-mono text-[11px] uppercase text-muted-foreground">{pillar.label}</p>
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300 ${
                          pillar.tone === "accent"
                            ? "border-accent/25 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground"
                            : "border-primary/25 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${pillar.tone === "accent" ? "bg-accent" : "bg-primary"}`} />
                      <span className={`h-px flex-1 bg-gradient-to-r ${pillar.tone === "accent" ? "from-accent/45" : "from-primary/45"} to-transparent`} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-3 py-14 sm:px-4 sm:py-20">
          <div className="container mx-auto">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionHeading
                eyebrow="The journey"
                title="Progress should feel visible, not hidden in disconnected screens."
                description="Tavro frames the training lifecycle as a connected path: track, mission, submission, mentor checkpoint, opportunity."
              />

              <div className="relative">
                <div className="absolute bottom-8 left-5 top-8 w-px bg-gradient-to-b from-primary via-primary/35 to-transparent" />
                <div className="space-y-4">
                  {journey.map((step, index) => (
                    <div key={step.title} className="tavro-reveal relative pl-12 sm:pl-14" style={{ animationDelay: `${index * 85}ms` }}>
                      <span className="absolute left-0 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary shadow-[0_0_0_6px_hsl(var(--background))]">
                        {index + 1}
                      </span>
                      <div className="rounded-[1.1rem] border border-white/10 bg-[#0d1219]/82 p-4 transition duration-300 hover:border-primary/35 sm:p-5">
                        <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <ReviewProofPanel />
            </div>
          </div>
        </section>

        <section className="px-3 py-14 sm:px-4 sm:py-20">
          <div className="container mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <DeveloperIllustration />
              <div>
                <SectionHeading
                  eyebrow="Human by design"
                  title="Human progress, built around real work."
                  description="Developer growth is technical, but it is also personal. Tavro makes the path visible, keeps feedback close to the code, and helps each checkpoint feel useful instead of vague."
                />
                <div className="mt-8 grid gap-3">
                  {[
                    "Progress should feel visible.",
                    "Feedback should stay close to the work.",
                    "Training should connect to real teams.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-3 py-14 sm:px-4 sm:py-20">
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Built around real workflows"
              title="One product direction, three connected sides."
              description="Tavro connects trainees, mentors, and companies through one shared growth path instead of three disconnected experiences."
              align="center"
            />
            <ConnectedSides />
          </div>
        </section>

        <PublicCta
          title="Build experience with real teams."
          description="Whether you are a trainee, mentor, or company, Tavro gives every step of growth a visible path."
          primaryLabel="Start your path"
          secondaryLabel="Contact us"
          secondaryTo="/contact"
        />
      </main>

      <Footer />
    </div>
  );
}
