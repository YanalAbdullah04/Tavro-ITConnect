import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressItem {
  title: string;
  subtitle?: string;
  progress: number;
  trailing?: string;
}

interface ProgressWidgetProps {
  title: string;
  items: ProgressItem[];
}

export function ProgressWidget({ title, items }: ProgressWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                {item.subtitle ? <p className="text-xs text-muted-foreground">{item.subtitle}</p> : null}
              </div>
              <span className="text-sm font-semibold text-primary">{item.trailing ?? `${item.progress}%`}</span>
            </div>
            <Progress value={item.progress} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
