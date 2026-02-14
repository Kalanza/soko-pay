import {
  Clock,
  CreditCard,
  Truck,
  PackageCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const config: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   bg: 'bg-muted',           text: 'text-muted-foreground', icon: Clock },
  paid:      { label: 'Paid',      bg: 'bg-secondary/10',    text: 'text-secondary',        icon: CreditCard },
  shipped:   { label: 'Shipped',   bg: 'bg-accent/10',       text: 'text-accent',           icon: Truck },
  delivered: { label: 'Delivered', bg: 'bg-primary/10',      text: 'text-primary',          icon: PackageCheck },
  completed: { label: 'Completed', bg: 'bg-primary',         text: 'text-primary-foreground', icon: CheckCircle },
  disputed:  { label: 'Disputed',  bg: 'bg-destructive/10',  text: 'text-destructive',      icon: AlertTriangle },
  refunded:  { label: 'Refunded',  bg: 'bg-muted',           text: 'text-muted-foreground', icon: RotateCcw },
  flagged:   { label: 'Flagged',   bg: 'bg-destructive/10',  text: 'text-destructive',      icon: ShieldAlert },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = config[status] ?? config.pending;
  const Icon = s.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}
