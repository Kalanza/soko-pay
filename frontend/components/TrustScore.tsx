'use client';

import { Shield, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface TrustScoreProps {
  score: number | null | undefined;
  level?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function TrustScore({ 
  score, 
  level, 
  size = 'md',
  showLabel = true 
}: TrustScoreProps) {
  if (score === null || score === undefined) {
    return null;
  }

  // Determine risk level
  const isLow = level === 'low' || score < 30;
  const isMedium = level === 'medium' || (score >= 30 && score < 70);
  const isHigh = level === 'high' || score >= 70;

  // Config based on risk
  const config = isLow
    ? {
        color: '#10b981',
        bgColor: 'bg-primary-50',
        borderColor: 'border-primary-500/20',
        textColor: 'text-primary-600',
        icon: ShieldCheck,
        label: 'Trusted',
        description: 'Low fraud risk',
      }
    : isMedium
    ? {
        color: '#f59e0b',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500/20',
        textColor: 'text-amber-600',
        icon: ShieldAlert,
        label: 'Moderate',
        description: 'Medium fraud risk',
      }
    : {
        color: '#ef4444',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-600',
        icon: AlertTriangle,
        label: 'High Risk',
        description: 'Exercise caution',
      };

  const Icon = config.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-20 h-20',
      stroke: 6,
      radius: 32,
      iconSize: 'h-6 w-6',
      scoreText: 'text-lg',
      labelText: 'text-xs',
    },
    md: {
      container: 'w-28 h-28',
      stroke: 8,
      radius: 46,
      iconSize: 'h-8 w-8',
      scoreText: 'text-2xl',
      labelText: 'text-sm',
    },
    lg: {
      container: 'w-40 h-40',
      stroke: 10,
      radius: 65,
      iconSize: 'h-12 w-12',
      scoreText: 'text-4xl',
      labelText: 'text-base',
    },
  };

  const sizes = sizeConfig[size];
  const circumference = 2 * Math.PI * sizes.radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`bento-card p-4 ${config.bgColor} border ${config.borderColor} trust-glow`}>
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className={`relative ${sizes.container} flex-shrink-0`}>
          <svg className="transform -rotate-90" width="100%" height="100%">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r={sizes.radius}
              stroke="currentColor"
              strokeWidth={sizes.stroke}
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r={sizes.radius}
              stroke={config.color}
              strokeWidth={sizes.stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`${sizes.iconSize} ${config.textColor}`} />
          </div>
        </div>

        {/* Info */}
        {showLabel && (
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className={`font-bold ${sizes.scoreText} ${config.textColor}`}>
                {100 - score}
              </h3>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
            <p className={`font-semibold ${config.textColor} ${sizes.labelText}`}>
              {config.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
        )}
      </div>

      {/* AI Badge */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>AI-Verified by Gemini</span>
      </div>
    </div>
  );
}
