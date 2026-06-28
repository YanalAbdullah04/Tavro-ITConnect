import { CircleDot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedItem {
  title: string;
  detail: string;
  timestamp: string;
}

interface ActivityFeedCardProps {
  title: string;
  items: FeedItem[];
}

export function ActivityFeedCard({ title, items }: ActivityFeedCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={`${item.title}-${item.timestamp}`} className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
            <CircleDot className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
