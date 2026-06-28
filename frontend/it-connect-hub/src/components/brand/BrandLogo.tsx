import { useId } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface TavroIconProps {
  className?: string;
}

export function TavroIcon({ className }: TavroIconProps) {
  const iconId = useId().replace(/:/g, "");
  const shellId = `${iconId}-shell`;
  const mintId = `${iconId}-mint`;
  const glowId = `${iconId}-glow`;

  return (
    <svg className={cn("h-10 w-10", className)} viewBox="0 0 64 64" role="img" aria-label="Tavro">
      <defs>
        <linearGradient id={shellId} x1="12" x2="52" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10212a" />
          <stop offset="1" stopColor="#07090d" />
        </linearGradient>
        <linearGradient id={mintId} x1="16" x2="48" y1="18" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8fffe2" />
          <stop offset="1" stopColor="#16d6b2" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="56" height="56" x="4" y="4" rx="17" fill={`url(#${shellId})`} />
      <rect width="56" height="56" x="4" y="4" rx="17" fill="none" stroke="#2bffdc" strokeOpacity=".28" strokeWidth="2" />
      <path
        d="M18 45C25 35 34 38 41 28C44 24 47 22 51 21"
        fill="none"
        stroke="#f4b45f"
        strokeLinecap="round"
        strokeOpacity=".72"
        strokeWidth="3"
      />
      <path
        d="M19 19H45M32 19V45"
        fill="none"
        stroke={`url(#${mintId})`}
        strokeLinecap="round"
        strokeWidth="7"
        filter={`url(#${glowId})`}
      />
      <circle cx="25" cy="35" r="2.8" fill="#8fffe2" />
      <circle cx="39" cy="35" r="2.8" fill="#8fffe2" opacity=".92" />
      <path d="M27 44C30 46 34 46 37 44" fill="none" stroke="#8fffe2" strokeLinecap="round" strokeOpacity=".68" strokeWidth="2.4" />
      <circle cx="50" cy="21" r="3.2" fill="#f4b45f" />
    </svg>
  );
}

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  iconClassName?: string;
  tagline?: string;
}

export function BrandLogo({ compact = false, className, iconClassName, tagline = "Tavro Trail" }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative inline-flex shrink-0 rounded-[1.05rem] shadow-[0_18px_42px_-28px_hsl(var(--primary))]">
        <TavroIcon className={iconClassName} />
      </span>
      {!compact ? (
        <div className="leading-none">
          <p className="font-heading text-lg font-semibold text-foreground">Tavro</p>
          <p className="mt-1 hidden text-xs text-muted-foreground min-[360px]:block">{tagline}</p>
        </div>
      ) : null}
    </div>
  );
}

interface BrandLogoLinkProps extends BrandLogoProps {
  to?: string;
}

export function BrandLogoLink({ to = "/", className, ...props }: BrandLogoLinkProps) {
  return (
    <Link to={to} className={cn("shrink-0", className)} aria-label="Tavro home">
      <BrandLogo {...props} />
    </Link>
  );
}
