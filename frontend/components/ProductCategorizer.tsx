/**
 * ProductCategorizer Component
 * Auto-categorizes products using AI
 */

'use client';

import { useState } from 'react';
import { aiService } from '@/services/aiService';

interface Props {
  productName: string;
  description: string;
  onCategorySelected?: (category: string) => void;
}

export function ProductCategorizer({
  productName,
  description,
  onCategorySelected,
}: Props) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorize = async () => {
    if (!productName.trim() || !description.trim()) {
      setError('Please provide product name and description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.categorizeProduct(productName, description);
      setResult(result);
      setIsOpen(true);
    } catch (err) {
      setError('Failed to categorize product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category: string) => {
    onCategorySelected?.(category);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCategorize}
        disabled={loading || !productName.trim() || !description.trim()}
        className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Analyzing...
          </>
        ) : (
          <>
            <span>🏷️</span>
            Auto-Categorize
          </>
        )}
      </button>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {isOpen && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Suggested Category
            </h3>

            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Primary Category</p>
                <p className="text-xl font-bold text-purple-700">
                  {result.category}
                </p>
                {result.subcategory && (
                  <p className="text-sm text-gray-600 mt-1">
                    Subcategory: {result.subcategory}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Confidence: {result.confidence}%
                </p>
              </div>

              {result.reason && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Why this category?
                  </p>
                  <p className="text-sm text-gray-600">{result.reason}</p>
                </div>
              )}

              {result.alternative_categories?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Other Possible Categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.alternative_categories.map((cat: string) => (
                      <button
                        key={cat}
                        onClick={() => handleSelectCategory(cat)}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleSelectCategory(result.category)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Use This Category
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
