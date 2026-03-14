/**
 * RecommendationCarousel Component
 * Shows personalized product recommendations to buyers
 */

'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/services/aiService';

interface Product {
  product_id: string;
  name: string;
  price: number;
  seller: string;
  relevance_score: number;
  reason: string;
  image?: string;
}

interface Props {
  buyerProfile: {
    name?: string;
    interests: string[];
    budget?: number;
    location?: string;
  };
  recentPurchases?: string[];
  title?: string;
}

export function RecommendationCarousel({
  buyerProfile,
  recentPurchases = [],
  title,
}: Props) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const result = await aiService.getRecommendations(
          buyerProfile,
          recentPurchases
        );
        setRecommendations(result.recommendations || []);
        setMessage(result.message || '');
      } catch (err) {
        setError('Failed to load recommendations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [buyerProfile, recentPurchases]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
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

  if (!recommendations.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No recommendations available yet</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? recommendations.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === recommendations.length - 1 ? 0 : prev + 1
    );
  };

  const currentRecommendations = recommendations.slice(
    currentIndex,
    currentIndex + 3
  );

  if (currentRecommendations.length < 3) {
    currentRecommendations.push(
      ...recommendations.slice(0, 3 - currentRecommendations.length)
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          ✨ {title || 'Recommended For You'}
        </h3>
        {message && (
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-4">
          {currentRecommendations.map((product) => (
            <div
              key={product.product_id}
              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Product Image Placeholder */}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-4xl">
                  📦
                </div>
              )}

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{product.seller}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      KES {product.price.toLocaleString()}
                    </span>
                  </div>

                  {product.reason && (
                    <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                      {product.reason}
                    </p>
                  )}
                </div>

                {/* Relevance Score */}
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{
                        width: `${product.relevance_score}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {product.relevance_score}%
                  </span>
                </div>

                <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {recommendations.length > 3 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors text-gray-900 font-bold"
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors text-gray-900 font-bold"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {recommendations.length > 3 && (
        <div className="flex justify-center gap-2">
          {Array.from({
            length: Math.ceil(recommendations.length / 3),
          }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 3)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 3) === idx
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
