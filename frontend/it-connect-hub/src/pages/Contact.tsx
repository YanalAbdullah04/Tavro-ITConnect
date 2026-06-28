import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MessageSquareText, Send, UsersRound } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/public/TavroPublic";
import { useToast } from "@/hooks/use-toast";

const contactNotes = [
  {
    title: "Partnerships",
    description: "For companies exploring training sessions, opportunity paths, or mentor-supported growth.",
    icon: UsersRound,
  },
  {
    title: "Platform support",
    description: "For access questions, trainee workflows, GitHub submission setup, or account help.",
    icon: MessageSquareText,
  },
];

const intentOptions = ["I am a trainee", "I represent a company", "I am a mentor", "General question"];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [intent, setIntent] = useState(intentOptions[0]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    toast({
      title: "Message prepared",
      description: "This contact form is currently handled in the browser. Tavro will route this to the team once backend submission is connected.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-16 pt-32">
        <section className="relative overflow-hidden pb-16">
          <div className="absolute inset-0 tavro-grid-bg opacity-35" />
          <div className="container relative z-10 mx-auto">
            <SectionHeading
              eyebrow="Contact Tavro"
              title="Start a Tavro path."
              description="Reach out about trainee programs, mentor workflows, GitHub review, company partnerships, or product access. Tell us where you are in the journey and what needs to move next."
              align="center"
            />
          </div>
        </section>

        <section className="container mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.25rem] border border-white/10 bg-[#0d1219]/86 p-5 shadow-[0_24px_80px_-64px_hsl(var(--primary))] md:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="tavro-kicker">Send a note</p>
                  <h2 className="mt-3 font-heading text-2xl font-semibold">Start the conversation</h2>
                </div>
                {submitted ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready to send
                  </span>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <p className="text-sm font-medium">What best describes you?</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {intentOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setIntent(option)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          intent === option
                            ? "border-primary/45 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/[0.025] text-muted-foreground hover:border-primary/25 hover:text-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    <span>Name</span>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Email</span>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium">
                  <span>Subject</span>
                  <Input
                    placeholder={`${intent}: training program, mentor workflow, partnership...`}
                    value={formData.subject}
                    onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium">
                  <span>Message</span>
                  <Textarea
                    placeholder="Share the path you are trying to create, the team involved, and what would help next."
                    rows={7}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    required
                  />
                </label>

                <Button type="submit" size="lg" className="w-full">
                  Send message
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            <aside className="space-y-4">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0f14] p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-2xl font-semibold">A real reply starts with context.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  There is no backend contact endpoint wired in this phase, so the form preserves the current toast-based behavior while presenting a more trustworthy experience.
                </p>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-xs text-muted-foreground">Preferred email</p>
                  <p className="mt-1 font-medium text-foreground">hello@tavro.dev</p>
                </div>
              </div>

              {contactNotes.map((note) => {
                const Icon = note.icon;
                return (
                  <div key={note.title} className="rounded-[1.1rem] border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-heading text-lg font-semibold">{note.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[1.1rem] border border-primary/20 bg-primary/10 p-5">
                <p className="text-sm font-medium text-primary">For faster answers</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Include whether you are a trainee, mentor, or company team, and mention the workflow you care about most.
                </p>
                <ArrowRight className="mt-4 h-5 w-5 text-primary" />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
