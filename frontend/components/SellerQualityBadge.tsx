/**
 * SellerQualityBadge Component
 * Displays seller trustworthiness score and badge
 */

'use client';

import { useEffect, useState } from 'react';
import { aiService } from '@/services/aiService';

interface SellerData {
  name: string;
  productCount: number;
  avgPrice: number;
  photoRate: number;
  descriptionQuality: string;
  productVariety: number;
  phone: string;
}

interface Props {
  seller: SellerData;
  compact?: boolean;
}

export function SellerQualityBadge({ seller, compact = false }: Props) {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const result = await aiService.scoreSellerQuality({
          seller_name: seller.name,
          product_count: seller.productCount,
          avg_price: seller.avgPrice,
          product_photos_rate: seller.photoRate,
          description_quality: seller.descriptionQuality,
          product_variety: seller.productVariety,
          phone: seller.phone,
        });
        setScore(result);
      } catch (error) {
        console.error('Failed to fetch seller score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [seller]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <span className="inline-block animate-spin">⏳</span>
        <span className="text-xs font-medium text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!score) return null;

  const getBadgeStyle = () => {
    switch (score.trust_level) {
      case 'very_high':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'high':
        return 'bg-lime-100 border-lime-300 text-lime-700';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default:
        return 'bg-red-100 border-red-300 text-red-700';
    }
  };

  const getStarRating = () => {
    const stars = Math.round(score.seller_score / 20);
    return '⭐'.repeat(Math.max(1, stars));
  };

  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-xs cursor-pointer hover:shadow-sm transition-shadow ${getBadgeStyle()}`}
      >
        {getStarRating()}
        <span>{score.seller_score}/100</span>
      </button>
    );
  }

  return (
    <>
      <div className={`rounded-lg border p-4 space-y-3 ${getBadgeStyle()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Seller Score</h4>
            <p className="text-2xl font-bold">{score.seller_score}/100</p>
          </div>
          <div className="text-4xl">{getStarRating()}</div>
        </div>

        <div className="pt-2 border-t border-current opacity-50">
          <p className="text-sm font-medium capitalize">{score.trust_level}</p>
          {score.recommendation && (
            <p className="text-xs mt-1">{score.recommendation}</p>
          )}
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="text-xs font-semibold hover:underline cursor-pointer"
        >
          View Details →
        </button>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {seller.name} - Quality Score
            </h3>

            <div className={`rounded-lg p-4 ${getBadgeStyle()}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{score.seller_score}</span>
                <span className="text-lg">/100</span>
              </div>
              <p className="text-sm mt-1 font-medium capitalize">
                Trust Level: {score.trust_level}
              </p>
              <p className="text-sm mt-1">Risk: {score.risk_level}</p>
            </div>

            {score.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  ✅ Strengths
                </h4>
                <ul className="space-y-1">
                  {score.strengths.map((strength: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {score.improvements?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  💡 Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {score.improvements.map((improvement: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-0.5">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {score.recommendation && (
                <p className="text-sm text-gray-600 p-2 bg-gray-100 rounded-lg flex-1">
                  <strong>Recommendation:</strong> {score.recommendation}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
