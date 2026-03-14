/**
 * AI Service - Handles all AI API calls
 * Communicates with backend Gemini AI endpoints
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ProductData {
  product_name: string;
  price: number;
  description: string;
  seller_name: string;
  seller_phone: string;
  category?: string;
  photos?: string[];
}

export interface FraudCheckResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  reason: string;
  flags: string[];
  recommendation: string;
  confidence: number;
}

export interface OptimizationResult {
  optimized_description: string;
  key_points: string[];
  tone: string;
  estimated_engagement_increase: number;
  suggestions: string[];
}

export interface CategorizationResult {
  category: string;
  subcategory: string;
  confidence: number;
  alternative_categories: string[];
  reason: string;
}

export interface SellerScoreResult {
  seller_score: number;
  trust_level: 'low' | 'moderate' | 'high' | 'very_high';
  strengths: string[];
  improvements: string[];
  recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface SupportResponse {
  response: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  suggests_escalation: boolean;
  helpful_links: string[];
}

export interface ContentCheckResult {
  is_safe: boolean;
  confidence: number;
  violations: string[];
  severity: 'none' | 'low' | 'moderate' | 'high';
  action: string;
  reason?: string;
}

export interface RecommendationResult {
  recommendations: any[];
  message: string;
}

export const aiService = {
  /**
   * Check product for fraud risk
   */
  async checkFraud(product: ProductData): Promise<FraudCheckResult> {
    const response = await fetch(`${API_BASE}/ai/fraud-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    if (!response.ok) throw new Error('Fraud check failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Optimize product description
   */
  async optimizeDescription(
    description: string,
    productName: string,
    category: string
  ): Promise<OptimizationResult> {
    const response = await fetch(`${API_BASE}/ai/optimize-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        product_name: productName,
        category,
      }),
    });

    if (!response.ok) throw new Error('Optimization failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Auto-categorize product
   */
  async categorizeProduct(
    productName: string,
    description: string
  ): Promise<CategorizationResult> {
    const response = await fetch(`${API_BASE}/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName,
        description,
      }),
    });

    if (!response.ok) throw new Error('Categorization failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Find similar products
   */
  async findSimilarProducts(
    productName: string,
    price: number,
    category: string,
    existingProducts: any[] = []
  ) {
    const response = await fetch(`${API_BASE}/ai/find-similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName,
        price,
        category,
        existing_products: existingProducts,
      }),
    });

    if (!response.ok) throw new Error('Similarity search failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Score seller quality
   */
  async scoreSellerQuality(sellerData: any): Promise<SellerScoreResult> {
    const response = await fetch(`${API_BASE}/ai/seller-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerData),
    });

    if (!response.ok) throw new Error('Seller scoring failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Analyze dispute
   */
  async analyzeDispute(disputeData: any) {
    const response = await fetch(`${API_BASE}/ai/analyze-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData),
    });

    if (!response.ok) throw new Error('Dispute analysis failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Handle support query
   */
  async handleSupportQuery(
    query: string,
    orderId?: string,
    buyerName?: string
  ): Promise<SupportResponse> {
    const response = await fetch(`${API_BASE}/ai/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        order_id: orderId,
        buyer_name: buyerName,
      }),
    });

    if (!response.ok) throw new Error('Support query failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Check content for policy violations
   */
  async checkContent(
    content: string,
    contentType: string
  ): Promise<ContentCheckResult> {
    const response = await fetch(`${API_BASE}/ai/check-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        content_type: contentType,
      }),
    });

    if (!response.ok) throw new Error('Content check failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Get market insights
   */
  async getMarketInsights(category: string, recentProducts: any[] = []) {
    const response = await fetch(`${API_BASE}/ai/market-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        recent_products: recentProducts,
      }),
    });

    if (!response.ok) throw new Error('Market insights failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Get recommendations
   */
  async getRecommendations(
    buyerProfile: any,
    recentPurchases: string[] = []
  ): Promise<RecommendationResult> {
    const response = await fetch(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_profile: buyerProfile,
        recent_purchases: recentPurchases,
      }),
    });

    if (!response.ok) throw new Error('Recommendations failed');
    const data = await response.json();
    return data.data;
  },

  /**
   * Get available AI capabilities
   */
  async getCapabilities() {
    const response = await fetch(`${API_BASE}/ai/capabilities`);
    if (!response.ok) throw new Error('Failed to fetch capabilities');
    return response.json();
  },
};
