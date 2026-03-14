// DisciplineCard.tsx - Card component displaying a discipline metric
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface DisciplineCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
}

const DisciplineCard = ({ title, value, subtitle, icon: Icon }: DisciplineCardProps) => {
  return (
    <Card className="shadow-[var(--shadow-soft)] hover:glow-accent transition-shadow duration-300">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisciplineCard;
