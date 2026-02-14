import { Check, Circle, Clock } from 'lucide-react';

interface TimelineProps {
  currentStatus: string;
}

export default function OrderTimeline({ currentStatus }: TimelineProps) {
  const steps = [
    { key: 'pending', label: 'Payment Link Created' },
    { key: 'paid', label: 'Payment Received (Escrow)' },
    { key: 'shipped', label: 'Item Shipped' },
    { key: 'delivered', label: 'Delivery Confirmed' },
    { key: 'completed', label: 'Funds Released' },
  ];

  const statusIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-6">
      {steps.map((step, index) => {
        const isCompleted = index < statusIndex;
        const isCurrent = index === statusIndex;
        const isPending = index > statusIndex;

        return (
          <div key={step.key} className="flex items-start mb-6 last:mb-0">
            <div className="flex flex-col items-center mr-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pt-2">
              <p
                className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
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
