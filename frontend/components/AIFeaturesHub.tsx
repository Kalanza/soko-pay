/**
 * AIFeaturesHub Component
 * Showcase and navigation for all AI features
 */

'use client';

import { useState, useEffect } from 'react';
import { aiService } from '@/services/aiService';

interface Capability {
  name: string;
  endpoint: string;
  method: string;
  use_case: string;
}

export function AIFeaturesHub() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<Capability | null>(
    null
  );

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const result = await aiService.getCapabilities();
        setCapabilities(result.capabilities || []);
        if (result.capabilities?.length > 0) {
          setSelectedFeature(result.capabilities[0]);
        }
      } catch (error) {
        console.error('Failed to fetch capabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, []);

  const getFeatureIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'Enhanced Fraud Detection': '🛡️',
      'Description Optimization': '✨',
      'Auto-Categorization': '🏷️',
      'Similar Products': '🔍',
      'Seller Quality Scoring': '⭐',
      'Dispute Analysis': '⚖️',
      'Support Chatbot': '🤖',
      'Content Moderation': '✅',
      'Market Insights': '📊',
      Recommendations: '💡',
    };
    return iconMap[name] || '🚀';
  };

  const categories = {
    'Security & Trust': [
      'Enhanced Fraud Detection',
      'Content Moderation',
      'Seller Quality Scoring',
    ],
    'Seller Tools': [
      'Description Optimization',
      'Auto-Categorization',
      'Market Insights',
      'Similar Products',
    ],
    'Buyer Experience': [
      'Support Chatbot',
      'Recommendations',
    ],
    'Admin Tools': [
      'Dispute Analysis',
      'Content Moderation',
      'Enhanced Fraud Detection',
    ],
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-32 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          🤖 Soko Pay AI Features
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Powered by Google Gemini - Making your marketplace smarter
        </p>
      </div>

      {/* Features by Category */}
      <div className="space-y-8">
        {Object.entries(categories).map(([category, features]) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities
                .filter((cap) => features.includes(cap.name))
                .map((capability) => (
                  <button
                    key={capability.name}
                    onClick={() => setSelectedFeature(capability)}
                    className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                      selectedFeature?.name === capability.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">
                        {getFeatureIcon(capability.name)}
                      </span>
                      <span className="text-xs font-mono px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {capability.method}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {capability.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {capability.use_case}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Details */}
      {selectedFeature && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl">
                {getFeatureIcon(selectedFeature.name)}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedFeature.name}
                </h2>
                <p className="text-gray-600">
                  {selectedFeature.use_case}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs italic text-gray-500">Endpoint</p>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {selectedFeature.endpoint}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs italic text-gray-500">Method</p>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {selectedFeature.method}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs italic text-gray-500">Status</p>
                <p className="text-sm font-bold text-green-600 mt-1">
                  ✅ Active
                </p>
              </div>
            </div>

            <a
              href="/docs"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              View API Documentation →
            </a>
          </div>
        </div>
      )}

      {/* Feature Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {capabilities.length}
          </p>
          <p className="text-sm text-gray-600 mt-1">AI Features</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">92%</p>
          <p className="text-sm text-gray-600 mt-1">Accuracy Rate</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">&lt;2s</p>
          <p className="text-sm text-gray-600 mt-1">Avg Response</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">24/7</p>
          <p className="text-sm text-gray-600 mt-1">Availability</p>
        </div>
      </div>
    </div>
  );
}
