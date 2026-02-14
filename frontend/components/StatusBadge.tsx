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

const config: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending Payment',   bg: 'bg-gray-50',           text: 'text-gray-700',        border: 'border-gray-200',      icon: Clock },
  paid:      { label: 'Paid',              bg: 'bg-blue-50',           text: 'text-blue-700',        border: 'border-blue-200',      icon: CreditCard },
  shipped:   { label: 'In Transit',        bg: 'bg-amber-50',          text: 'text-amber-700',       border: 'border-amber-200',     icon: Truck },
  delivered: { label: 'Delivered',         bg: 'bg-primary-50',        text: 'text-primary-600',     border: 'border-primary-200',   icon: PackageCheck },
  completed: { label: 'Completed',         bg: 'gradient-green',       text: 'text-white',           border: 'border-transparent',   icon: CheckCircle },
  disputed:  { label: 'Disputed',          bg: 'bg-red-50',            text: 'text-red-700',         border: 'border-red-200',       icon: AlertTriangle },
  refunded:  { label: 'Refunded',          bg: 'bg-gray-50',           text: 'text-gray-700',        border: 'border-gray-200',      icon: RotateCcw },
  flagged:   { label: 'Under Review',      bg: 'bg-red-50',            text: 'text-red-700',         border: 'border-red-200',       icon: ShieldAlert },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = config[status] ?? config.pending;
  const Icon = s.icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${s.bg} ${s.text} ${s.border} shadow-sm transition-all hover:shadow-md`}>
      <Icon className="h-4 w-4" />
      {s.label}
    </span>
  );
}
