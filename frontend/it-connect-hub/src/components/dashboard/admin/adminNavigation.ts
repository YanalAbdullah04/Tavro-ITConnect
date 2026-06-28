import {
  BarChart3,
  Building2,
  FileText,
  Route,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

export const adminNavigation = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "tracks", label: "Growth Tracks", icon: Route },
  { key: "trainings", label: "Sessions", icon: GraduationCap },
  { key: "trainers", label: "Mentors", icon: Users },
  { key: "trainees", label: "Trainees", icon: UserMinus },
  { key: "posts", label: "Opportunities", icon: FileText },
  { key: "applicants", label: "Candidates", icon: UserCheck },
  { key: "analytics", label: "Analytics", icon: LineChart },
] as const;

export const adminSectionTitles: Record<string, { title: string; description: string }> = {
  overview: {
    title: "Training Command Center",
    description: "Manage tracks, sessions, mentors, opportunities, and candidate flow in one workspace.",
  },
  tracks: {
    title: "Growth Tracks",
    description: "Create and manage the training paths your company runs.",
  },
  trainings: {
    title: "Sessions",
    description: "Plan training sessions, capacity, schedules, and mentor assignments.",
  },
  trainers: {
    title: "Mentors",
    description: "Manage the mentors who guide sessions and trainee checkpoints.",
  },
  trainees: {
    title: "Trainees",
    description: "View and manage trainees registered in your training sessions.",
  },
  posts: {
    title: "Opportunities",
    description: "Publish openings and keep company-connected opportunities active.",
  },
  applicants: {
    title: "Candidates",
    description: "Follow candidate status across your opportunity pipeline.",
  },
  analytics: {
    title: "Analytics",
    description: "View operational signals across tracks, sessions, mentors, and candidates.",
  },
};

export const adminBrand = {
  name: "Tavro",
  subtitle: "Company Workspace",
  icon: Building2,
  signalIcon: BarChart3,
};
