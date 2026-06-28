import type { ReactNode } from "react";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  note?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ label, value, note, icon: Icon, trend = "neutral" }: MetricCardProps) {
  return (
    <Card className="group border-white/10 bg-[#0d1219]/88 transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[#101720]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
            {note ? (
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                  trend === "up" && "text-emerald-400",
                  trend === "down" && "text-rose-400",
                  trend === "neutral" && "text-muted-foreground",
                )}
              >
                {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : null}
                {trend === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                {note}
              </p>
            ) : null}
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
