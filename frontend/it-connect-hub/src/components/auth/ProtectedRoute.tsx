import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { clearAuthSession, getDashboardPathForRole, getRoleFromToken, getToken, isTokenExpired } from "@/lib/api/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const roleMatches = (actualRole: string | null, allowedRoles?: string[]) => {
  if (!allowedRoles?.length) return true;
  const normalizedRole = actualRole?.toLowerCase();
  return allowedRoles.some((role) => role.toLowerCase() === normalizedRole);
};

const isDevAuthBypassEnabled =
  import.meta.env.DEV &&
  import.meta.env.VITE_DISABLE_AUTH?.toLowerCase() === "true";

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const [authState, setAuthState] = useState<"checking" | "valid" | "missing" | "forbidden">("checking");
  const [redirectPath, setRedirectPath] = useState("/login");

  useEffect(() => {
    if (isDevAuthBypassEnabled) {
      setAuthState("valid");
      return;
    }

    const token = getToken();

    if (!token || isTokenExpired(token)) {
      clearAuthSession();
      setRedirectPath("/login");
      setAuthState("missing");
      return;
    }

    const role = getRoleFromToken(token);
    if (!roleMatches(role, roles)) {
      setRedirectPath(getDashboardPathForRole(role));
      setAuthState("forbidden");
      return;
    }

    setAuthState("valid");
  }, [roles]);

  if (authState === "checking") {
    return <div className="min-h-screen bg-background" />;
  }

  if (authState === "missing" || authState === "forbidden") {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
