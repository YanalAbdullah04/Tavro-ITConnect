import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, GraduationCap, UserCheck } from "lucide-react";

import { adminNavigation, adminSectionTitles } from "@/components/dashboard/admin/adminNavigation";
import { DashboardShell } from "@/components/dashboard/layout/DashboardShell";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  section: string;
  children: ReactNode;
}

const getAdminPath = (key: string) => (key === "overview" ? "/dashboard/company" : `/dashboard/company/${key}`);

const overviewQuickActions = [
  { label: "New Session", to: "/dashboard/company/trainings", icon: GraduationCap },
  { label: "Publish Opportunity", to: "/dashboard/company/posts", icon: BriefcaseBusiness },
  { label: "Review Candidates", to: "/dashboard/company/applicants", icon: UserCheck },
];

export function AdminLayout({ section, children }: AdminLayoutProps) {
  const sectionMeta = adminSectionTitles[section] ?? adminSectionTitles.overview;
  const actions = section === "overview" ? (
    <>
      {overviewQuickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button key={action.label} asChild variant="outline" size="sm" className="gap-2 rounded-full">
            <Link to={action.to}>
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        );
      })}
    </>
  ) : null;

  return (
    <DashboardShell
      workspaceLabel="Company Workspace"
      title={sectionMeta.title}
      subtitle={sectionMeta.description}
      searchPlaceholder="Search tracks, sessions, mentors..."
      statusText="Company workspace synced"
      actions={actions}
      navItems={adminNavigation.map((item) => ({
        label: item.label,
        icon: item.icon,
        href: getAdminPath(item.key),
        active: section === item.key,
      }))}
    >
      {children}
    </DashboardShell>
  );
}
