/**
 * MarketInsights Component
 * Displays market trends and pricing analysis for sellers
 */

'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/services/aiService';

interface Props {
  category: string;
  recentProducts?: any[];
}

export function MarketInsights({ category, recentProducts = [] }: Props) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const result = await aiService.getMarketInsights(category, recentProducts);
        setInsights(result);
      } catch (err) {
        setError('Failed to load market insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [category, recentProducts]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!insights) return null;

  const getTrendIcon = () => {
    switch (insights.trend) {
      case 'growing':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      default:
        return '❓';
    }
  };

  const getDemandColor = () => {
    switch (insights.demand_level) {
      case 'very_high':
        return 'text-green-700 bg-green-100';
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {getTrendIcon()} Market Insights - {category}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          AI analysis of current market trends and pricing
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold mb-1">
            Average Price
          </p>
          <p className="text-2xl font-bold text-blue-700">
            KES {insights.avg_price?.toLocaleString()}
          </p>
        </div>

        <div className={`border rounded-lg p-4 ${getDemandColor()}`}>
          <p className="text-xs font-semibold mb-1 capitalize">
            Demand Level
          </p>
          <p className="text-lg font-bold capitalize">
            {insights.demand_level}
          </p>
        </div>

        {insights.price_range && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-xs text-purple-600 font-semibold mb-1">
              Price Range
            </p>
            <p className="text-sm text-purple-700">
              {insights.price_range.min?.toLocaleString()} -{' '}
              {insights.price_range.max?.toLocaleString()} KES
            </p>
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-600 font-semibold mb-1">
            Market Trend
          </p>
          <p className="text-lg font-bold text-orange-700 capitalize">
            {insights.trend}
          </p>
        </div>
      </div>

      {/* Popular Features */}
      {insights.popular_features?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            🔥 Popular Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.popular_features.map((feature: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Seller Tips */}
      {insights.seller_tips?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            💡 Seller Tips
          </h4>
          <ul className="space-y-2">
            {insights.seller_tips.map((tip: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Forecast */}
      {insights.forecast && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">🔮 Market Forecast</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {insights.forecast}
          </p>
        </div>
      )}
    </div>
  );
}
