import { Check, Clock, Circle } from 'lucide-react';

interface TimelineProps {
  currentStatus: string;
}

const steps = [
  { key: 'pending', label: 'Payment Link Created' },
  { key: 'paid', label: 'Payment Received (Escrow)' },
  { key: 'shipped', label: 'Item Shipped' },
  { key: 'delivered', label: 'Delivery Confirmed' },
  { key: 'completed', label: 'Funds Released' },
];

export default function OrderTimeline({ currentStatus }: TimelineProps) {
  const statusIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-2">
      {steps.map((step, index) => {
        const isCompleted = index < statusIndex;
        const isCurrent = index === statusIndex;

        return (
          <div key={step.key} className="flex items-start mb-0 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              {/* Node */}
              <div
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'border-primary bg-primary'
                    : isCurrent
                    ? 'border-primary bg-primary animate-pulse-ring'
                    : 'border-border bg-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-10 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5">
              <p
                className={`text-sm font-medium ${
                  isCompleted || isCurrent
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
