import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { BrandLogoLink } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unexpected frontend error", error, info);
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#07090d] px-4 py-6 text-foreground">
        <div className="pointer-events-none fixed inset-0 tavro-grid-bg opacity-25" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
          <div className="rounded-2xl border border-white/10 bg-background/72 px-4 py-3 shadow-[0_22px_70px_-55px_hsl(var(--primary))] backdrop-blur-xl">
            <BrandLogoLink tagline="Grow through real work" />
          </div>

          <main className="flex flex-1 items-center justify-center py-10">
            <section className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
              <p className="text-sm font-semibold text-destructive">Unexpected error</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">This workspace needs a quick refresh.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Tavro stopped this screen before showing incomplete or unsafe data. Retry the view, or sign in again if your session expired.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={this.reset}>
                  <RefreshCw className="h-4 w-4" />
                  Retry view
                </Button>
                <Button variant="outline" onClick={() => window.location.assign("/login")}>
                  Sign in again
                </Button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }
}
