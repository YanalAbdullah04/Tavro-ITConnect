const TOKEN_KEY = "itConnectToken";
const EXPIRATION_KEY = "itConnectTokenExpiration";

const roleClaimKeys = [
  "role",
  "roles",
  "userRole",
  "UserRole",
  "userType",
  "UserType",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

const userLabelClaimKeys = [
  "name",
  "fullName",
  "FullName",
  "given_name",
  "preferred_username",
  "unique_name",
  "email",
  "Email",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

const userEmailClaimKeys = [
  "email",
  "Email",
  "unique_name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthExpiration() {
  return localStorage.getItem(EXPIRATION_KEY);
}

export function setAuthSession(token: string, expiration?: string | null) {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiration) {
    localStorage.setItem(EXPIRATION_KEY, expiration);
  } else {
    localStorage.removeItem(EXPIRATION_KEY);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRATION_KEY);
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userDisplayName");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token = getToken()) {
  if (!token) return true;

  const storedExpiration = getAuthExpiration();
  if (storedExpiration) {
    const expirationTime = new Date(storedExpiration).getTime();
    if (!Number.isNaN(expirationTime)) {
      return expirationTime <= Date.now();
    }
  }

  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp === "number") {
    return exp * 1000 <= Date.now();
  }

  return false;
}

export function getRoleFromToken(token = getToken()) {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  for (const key of roleClaimKeys) {
    const claim = payload[key];
    if (Array.isArray(claim) && claim.length > 0) return String(claim[0]);
    if (typeof claim === "string" && claim.trim()) return claim;
  }

  return null;
}

export function getUserLabelFromToken(token = getToken()) {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  for (const key of userLabelClaimKeys) {
    const claim = payload[key];
    if (typeof claim === "string" && claim.trim()) return claim;
  }

  return null;
}

export function getUserEmailFromToken(token = getToken()) {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  for (const key of userEmailClaimKeys) {
    const claim = payload[key];
    if (typeof claim === "string" && claim.trim()) return claim;
  }

  return null;
}

export function getUserIdFromToken(token = getToken()) {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const idClaimKeys = [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "nameid",
    "userId",
    "UserId",
    "id",
    "sub",
  ];

  for (const key of idClaimKeys) {
    const claim = payload[key];
    if (typeof claim === "string" && claim.trim()) return claim;
  }

  return null;
}

export function getDashboardPathForRole(role?: string | null) {
  const normalizedRole = role?.trim().toLowerCase();

  if (["company", "admin", "companyadmin"].includes(normalizedRole ?? "")) {
    return "/dashboard/company";
  }

  if (normalizedRole === "trainer") {
    return "/dashboard/trainer";
  }

  if (["trainee", "student"].includes(normalizedRole ?? "")) {
    return "/dashboard/student";
  }

  return "/login";
}
