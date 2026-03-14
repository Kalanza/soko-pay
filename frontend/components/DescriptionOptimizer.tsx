/**
 * DescriptionOptimizer Component
 * Helps sellers improve product descriptions using AI
 */

'use client';

import { useState } from 'react';
import { aiService } from '@/services/aiService';

interface Props {
  initialDescription: string;
  productName: string;
  category: string;
  onOptimized?: (description: string) => void;
}

export function DescriptionOptimizer({
  initialDescription,
  productName,
  category,
  onOptimized,
}: Props) {
  const [description, setDescription] = useState(initialDescription);
  const [optimized, setOptimized] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!description.trim()) {
      setError('Please enter a product description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.optimizeDescription(
        description,
        productName,
        category
      );

      setOptimized(result.optimized_description);
      setSuggestions(result.suggestions);
    } catch (err) {
      setError('Failed to optimize description. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (optimized) {
      setDescription(optimized);
      onOptimized?.(optimized);
      setOptimized(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">✨</span> AI Description Optimizer
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Get AI suggestions to improve your product description and boost sales
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your product description..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length} characters
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading || !description.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Optimizing...
            </>
          ) : (
            <>
              <span>🚀</span>
              Optimize with AI
            </>
          )}
        </button>

        {optimized && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                ✅ AI Suggestion
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {optimized}
              </p>
            </div>

            {suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-900 mb-2">
                  💡 Changes Made:
                </h4>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-green-600 font-bold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Apply This Description
              </button>
              <button
                onClick={() => setOptimized(null)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
