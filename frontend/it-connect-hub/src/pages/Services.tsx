import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Code2,
  GitPullRequest,
  GraduationCap,
  Route,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PublicCta, SectionHeading } from "@/components/public/TavroPublic";

const audiences = [
  {
    title: "For trainees",
    description: "A focused path for building confidence through real assignments and visible progress.",
    icon: GraduationCap,
    items: ["Profile and skill visibility", "Mission and deadline clarity", "GitHub-based submission flow"],
  },
  {
    title: "For mentors",
    description: "A checkpoint rhythm that keeps feedback close to the submitted work and the trainee journey.",
    icon: UsersRound,
    items: ["Trainee context", "Submission checkpoint surfaces", "Checkpoint-oriented feedback"],
  },
  {
    title: "For companies",
    description: "Operational tools for tracks, training sessions, mentors, opportunities, and candidates.",
    icon: BriefcaseBusiness,
    items: ["Track and session operations", "Mentor management", "Candidate and opportunity coordination"],
  },
];

const workflows = [
  {
    title: "Progress tracking",
    description: "Make training movement readable through missions, sessions, milestones, and trainee profile signals.",
    icon: Route,
  },
  {
    title: "Mission checkpoint workflows",
    description: "Connect mission details, trainee submissions, and mentor checkpoint moments in one product direction.",
    icon: ClipboardList,
  },
  {
    title: "GitHub submission flow",
    description: "Let trainees connect repositories and submit code so mentor checkpoints can happen around actual work.",
    icon: GitPullRequest,
  },
  {
    title: "Training session operations",
    description: "Create and manage tracks, sessions, mentors, capacity, dates, and delivery status.",
    icon: UserCheck,
  },
  {
    title: "Opportunity coordination",
    description: "Expose opportunities, applications, candidate status, and company-side opportunity management.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Developer-ready context",
    description: "Keep the product language specific to code, checkpoints, growth, and team readiness.",
    icon: Code2,
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-3 pb-10 pt-28 sm:px-4 sm:pt-32">
        <section className="relative overflow-hidden pb-14 sm:pb-20">
          <div className="absolute inset-0 tavro-grid-bg opacity-40" />
          <div className="container relative z-10 mx-auto">
            <SectionHeading
              eyebrow="Tavro capabilities"
              title="The workflows behind real developer growth."
              description="Tavro is built around the product workflows that connect missions, mentorship, GitHub checkpoints, and company opportunities into one visible growth path."
              align="center"
            />
            <div className="mt-8 flex justify-center sm:mt-9">
              <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
                <Link to="/signup">
                  Start with Tavro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-10 sm:py-12">
          <div className="grid gap-4 lg:grid-cols-3">
            {audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <div
                  key={audience.title}
                  className="tavro-reveal rounded-[1.2rem] border border-white/10 bg-[#0d1219]/82 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/35 sm:p-6"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="font-heading text-xl font-semibold">{audience.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{audience.description}</p>
                  <div className="mt-6 space-y-3">
                    {audience.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto py-14 sm:py-20">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Product workflows"
              title="Specific capabilities, not inflated promises."
              description="These are aligned with the current app direction and API-backed screens: tracks, sessions, trainees, opportunities, candidates, profiles, missions, and GitHub-connected work."
            />
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-fit">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((workflow, index) => {
              const Icon = workflow.icon;
              return (
                <div
                  key={workflow.title}
                  className="tavro-reveal group rounded-[1.1rem] border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:border-primary/35 hover:bg-white/[0.055]"
                  style={{ animationDelay: `${index * 65}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">{workflow.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto py-14 sm:py-20">
          <div className="rounded-[1.25rem] border border-white/10 bg-[#0b0f14] p-4 sm:rounded-[1.35rem] sm:p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="tavro-kicker">How it connects</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight md:text-4xl">
                  A simple line from learning to reviewed work.
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                  Tavro's strongest workflow is not a static lesson list. It is the loop between assigned work, submitted code, mentor checkpoints, and opportunity visibility.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {["Track", "Mission", "GitHub", "Checkpoint"].map((step, index) => (
                  <div key={step} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center">
                    {index < 3 ? <span className="absolute -right-4 top-1/2 hidden h-px w-8 bg-primary/45 sm:block" /> : null}
                    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-mono text-sm text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicCta
        title="Turn training into a visible path."
        description="Use Tavro to keep missions, mentorship, GitHub checkpoints, and opportunity coordination moving in the same direction."
        primaryLabel="Get started"
        secondaryLabel="Contact us"
        secondaryTo="/contact"
      />

      <Footer />
    </div>
  );
}
