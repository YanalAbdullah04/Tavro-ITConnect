import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

import { BrandLogoLink } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Services", to: "/services" },
  { label: "Companies", to: "/companies" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="fixed left-0 right-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-background/72 px-3 shadow-[0_22px_70px_-55px_hsl(var(--primary))] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <BrandLogoLink tagline="Grow through real work" />

          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-white/[0.04] hover:text-foreground",
                  isActive(item.to) && "bg-white/[0.06] text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="space-y-3 border-t border-white/10 py-4 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground",
                  isActive(item.to) && "bg-white/[0.06] text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
