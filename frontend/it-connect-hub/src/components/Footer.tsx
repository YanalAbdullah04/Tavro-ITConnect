import { Link } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";

const footerLinks = {
  platform: [
    { label: "Services", to: "/services" },
    { label: "Contact", to: "/contact" },
  ],
  accounts: [
    { label: "Login", to: "/login" },
    { label: "Get Started", to: "/signup" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07090d]/82 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          <div>
            <BrandLogo className="mb-4" tagline="Grow through real work" />
            <p className="max-w-xs text-sm text-muted-foreground">
              A calm developer growth space for real missions, mentor feedback, GitHub review, and company-connected paths.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Platform</h3>
            <div className="space-y-2">
              {footerLinks.platform.map((item) => (
                <Link key={item.to} to={item.to} className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Access</h3>
            <div className="space-y-2">
              {footerLinks.accounts.map((item) => (
                <Link key={item.to} to={item.to} className="block text-sm text-muted-foreground transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex items-center gap-2">
              {[Github, Linkedin, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Built for trainees, mentors, and companies that care about visible progress.</p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tavro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
