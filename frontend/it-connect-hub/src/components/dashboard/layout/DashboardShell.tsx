import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BrandLogoLink } from "@/components/brand/BrandLogo";
import { clearAuthSession, getDashboardPathForRole, getRoleFromToken, getUserEmailFromToken, getUserLabelFromToken } from "@/lib/api/auth";
import { GrokChat } from "@/components/dashboard/GrokChat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  targetId?: string;
  onClick?: () => void;
}

interface DashboardShellProps {
  workspaceLabel: string;
  title: string;
  subtitle: string;
  navItems?: DashboardNavItem[];
  searchPlaceholder?: string;
  actions?: ReactNode;
  children: ReactNode;
  profileHref?: string;
  statusText?: string;
  userLabel?: string;
}

function getInitials(label: string) {
  const parts = label.split(/[ @._-]/).filter(Boolean);
  return (parts[0]?.[0] ?? "T").toUpperCase();
}

function getUserLabel(userLabel?: string) {
  return userLabel || localStorage.getItem("userDisplayName") || getUserLabelFromToken() || localStorage.getItem("userEmail") || "Tavro user";
}

function getUserEmail() {
  return getUserEmailFromToken() || localStorage.getItem("userEmail") || "";
}

function getDisplayIdentity(userLabel?: string) {
  const email = getUserEmail();
  const label = getUserLabel(userLabel);
  const username = label === email && email.includes("@") ? email.split("@")[0] : label;

  return { username, email };
}

function handleNavTarget(targetId?: string) {
  if (!targetId) return;
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getWorkspaceHomeHref() {
  const role = getRoleFromToken() ?? localStorage.getItem("userRole");
  const dashboardPath = getDashboardPathForRole(role);
  return dashboardPath === "/login" ? "/" : dashboardPath;
}

function AccountMenu({ profileHref, userLabel }: { profileHref?: string; userLabel?: string }) {
  const navigate = useNavigate();
  const { username, email } = getDisplayIdentity(userLabel);
  const initials = getInitials(username || email || "Tavro user");

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const chipContent = (
    <Button variant="outline" className="h-12 max-w-[20rem] gap-3 rounded-full border-white/10 bg-white/[0.045] px-2.5 pr-3 hover:border-primary/35 hover:bg-primary/10">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block truncate text-sm font-semibold text-foreground">{username}</span>
        {email ? <span className="block truncate text-xs text-muted-foreground">{email}</span> : null}
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {chipContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-[#0d1219] p-2 shadow-[0_24px_70px_-45px_hsl(var(--primary))]">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm text-foreground">{username}</p>
          {email ? <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">{email}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {profileHref ? (
          <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 focus:bg-primary/10 focus:text-primary">
            <Link to={profileHref}>
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl px-3 py-2 text-muted-foreground focus:bg-primary/10 focus:text-primary">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  workspaceLabel,
  navItems = [],
  statusText,
  homeHref,
}: {
  workspaceLabel: string;
  navItems?: DashboardNavItem[];
  statusText?: string;
  homeHref: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-5">
        <BrandLogoLink to={homeHref} tagline="Tavro Trail" />
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Tavro</p>
          <p className="mt-1 text-sm font-medium text-foreground">{workspaceLabel}</p>
        </div>
      </div>

      {navItems.length > 0 ? (
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const content = (
              <>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </>
            );
            const className = cn(
              "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition duration-200",
              item.active
                ? "border-primary/35 bg-primary/10 text-primary shadow-[0_12px_32px_-24px_hsl(var(--primary))]"
                : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.045] hover:text-foreground",
            );

            if (item.onClick) {
              return (
                <button key={`${item.label}-${item.targetId ?? item.href}`} type="button" onClick={item.onClick} className={className}>
                  {content}
                </button>
              );
            }

            if (item.href) {
              return (
                <Link key={`${item.label}-${item.href}`} to={item.href} className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={`${item.label}-${item.targetId}`} type="button" onClick={() => handleNavTarget(item.targetId)} className={className}>
                {content}
              </button>
            );
          })}
        </nav>
      ) : (
        <div className="flex-1" />
      )}

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-xs text-muted-foreground">Tavro System</p>
          <p className="mt-1 text-sm font-medium text-foreground">{statusText || "Workspace synced"}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  workspaceLabel,
  navItems,
  children,
  profileHref,
  statusText,
  userLabel,
}: DashboardShellProps) {
  const workspaceHomeHref = getWorkspaceHomeHref();

  return (
    <div className="min-h-screen overflow-hidden bg-[#07090d] text-foreground">
      <div className="pointer-events-none fixed inset-0 tavro-grid-bg opacity-25" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_24%_0%,hsl(var(--primary)/0.14),transparent_36%),radial-gradient(circle_at_84%_6%,hsl(var(--accent)/0.1),transparent_32%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#07090d]/88 backdrop-blur-xl lg:block">
          <SidebarContent workspaceLabel={workspaceLabel} navItems={navItems} statusText={statusText} homeHref={workspaceHomeHref} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-3 z-30 px-3 sm:top-4 sm:px-4 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#07090d]/78 px-3 shadow-[0_22px_70px_-55px_hsl(var(--primary))] backdrop-blur-xl sm:px-4">
              <div className="flex min-h-16 items-center justify-between gap-3 py-2">
                <BrandLogoLink to={workspaceHomeHref} compact iconClassName="h-10 w-10" />
                <AccountMenu profileHref={profileHref} userLabel={userLabel} />
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>

      {["trainee", "student"].includes((getRoleFromToken() ?? "").toLowerCase()) && (
        <GrokChat />
      )}
    </div>
  );
}
