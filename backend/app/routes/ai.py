"""
AI-powered endpoints for Soko Pay
Exposes Gemini AI features via REST API
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai_enhanced import (
    check_fraud_risk_enhanced,
    optimize_product_description,
    categorize_product,
    find_similar_products,
    score_seller_quality,
    analyze_dispute,
    handle_support_query,
    generate_market_insights,
    check_content_policy,
    get_product_recommendations
)

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class ProductData(BaseModel):
    product_name: str
    price: float
    description: str
    seller_name: str
    seller_phone: str
    category: Optional[str] = None
    photos: Optional[List[str]] = []


class DescriptionOptimizationRequest(BaseModel):
    description: str
    product_name: str
    category: str


class CategorizationRequest(BaseModel):
    product_name: str
    description: str


class SellerQualityRequest(BaseModel):
    seller_name: str
    product_count: int
    avg_price: float
    product_photos_rate: float  # 0-1
    description_quality: str
    product_variety: int
    phone: str


class DisputeAnalysisRequest(BaseModel):
    order_id: str
    buyer_claim: str
    seller_response: str
    product_description: str
    photos_provided: bool
    delivery_confirmed: bool


class SupportQueryRequest(BaseModel):
    query: str
    order_id: Optional[str] = None
    buyer_name: Optional[str] = None


class ContentCheckRequest(BaseModel):
    content: str
    content_type: str  # "description", "message", "review", etc


class MarketInsightsRequest(BaseModel):
    category: str
    recent_products: List[dict]


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/ai/fraud-check")
async def fraud_check_endpoint(product: ProductData):
    """
    Enhanced fraud detection using Gemini AI.
    
    Analyzes product details for fraud risk with detailed assessment.
    
    Returns:
    - risk_score: 0-100
    - risk_level: low/medium/high
    - reason: detailed explanation
    - flags: list of detected issues
    - recommendation: action to take
    - confidence: how confident the AI is (0-100)
    """
    try:
        result = await check_fraud_risk_enhanced(product.dict())
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud check error: {str(e)}")


@router.post("/ai/optimize-description")
async def optimize_description_endpoint(request: DescriptionOptimizationRequest):
    """
    Optimize product description for better sales.
    
    Uses AI to improve descriptions for clarity, engagement, and trust.
    
    Returns:
    - optimized_description: improved version
    - key_points: key selling points
    - tone: recommended tone
    - estimated_engagement_increase: expected improvement %
    - suggestions: specific improvements made
    """
    try:
        result = await optimize_product_description(
            request.description,
            request.product_name,
            request.category
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")


@router.post("/ai/categorize")
async def categorize_endpoint(request: CategorizationRequest):
    """
    Automatically categorize product.
    
    Useful when seller doesn't select a category.
    
    Returns:
    - category: primary category
    - subcategory: optional sub-category
    - confidence: how sure the AI is (0-100)
    - alternative_categories: other possible categories
    - reason: why this categorization
    """
    try:
        result = await categorize_product(
            request.product_name,
            request.description
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization error: {str(e)}")


@router.post("/ai/find-similar")
async def find_similar_endpoint(
    product_name: str,
    price: float,
    category: str,
    existing_products: Optional[List[dict]] = None
):
    """
    Find similar products in database.
    
    Helps detect duplicate listings and compare with competing products.
    
    Returns:
    - similar_products: list of matches with scores
    - market_positioning: underpriced/competitive/overpriced
    - recommendation: pricing advice
    """
    try:
        result = await find_similar_products(
            product_name,
            price,
            category,
            existing_products or []
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity search error: {str(e)}")


@router.post("/ai/seller-quality")
async def seller_quality_endpoint(request: SellerQualityRequest):
    """
    Score seller quality and trustworthiness.
    
    Helps buyers make trust decisions and helps sellers improve.
    
    Returns:
    - seller_score: 0-100
    - trust_level: low/moderate/high/very_high
    - strengths: what they do well
    - improvements: areas to improve
    - recommendation: buying guidance
    - risk_level: low/medium/high
    """
    try:
        result = await score_seller_quality(request.dict())
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seller scoring error: {str(e)}")


@router.post("/ai/analyze-dispute")
async def analyze_dispute_endpoint(request: DisputeAnalysisRequest):
    """
    Analyze dispute and recommend resolution.
    
    Helps admin/AI resolve disputes fairly.
    
    Returns:
    - buyer_claim_strength: 0-100
    - seller_defense_strength: 0-100
    - likely_winner: buyer/seller/split
    - recommended_resolution: refund/replacement/partial refund/return
    - confidence: how sure the AI is
    - reasoning: detailed analysis
    """
    try:
        result = await analyze_dispute(request.dict())
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dispute analysis error: {str(e)}")


@router.post("/ai/support")
async def support_query_endpoint(request: SupportQueryRequest):
    """
    Handle customer support queries.
    
    AI-powered customer support that can handle FAQs and provide guidance.
    
    Returns:
    - response: helpful answer
    - category: what type of query
    - urgency: low/medium/high
    - suggests_escalation: needs human help?
    - helpful_links: relevant resources
    """
    try:
        context = {}
        if request.order_id:
            context["order_id"] = request.order_id
        if request.buyer_name:
            context["buyer_name"] = request.buyer_name

        result = await handle_support_query(request.query, context)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Support query error: {str(e)}")


@router.post("/ai/check-content")
async def check_content_endpoint(request: ContentCheckRequest):
    """
    Check if content violates policies.
    
    Protects platform from harmful content.
    
    Returns:
    - is_safe: content acceptable?
    - confidence: how sure
    - violations: list of issues found
    - severity: none/low/moderate/high
    - action: approve/flag/reject
    - reason: explanation if not safe
    """
    try:
        result = await check_content_policy(request.content, request.content_type)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content check error: {str(e)}")


@router.post("/ai/market-insights")
async def market_insights_endpoint(request: MarketInsightsRequest):
    """
    Generate market insights for a category.
    
    Helps sellers understand trends and pricing.
    
    Returns:
    - avg_price: category average
    - price_range: min/max
    - trend: declining/stable/growing
    - demand_level: low/moderate/high/very_high
    - popular_features: trending attributes
    - seller_tips: actionable advice
    - forecast: 3-month outlook
    """
    try:
        result = await generate_market_insights(
            request.category,
            request.recent_products
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market insights error: {str(e)}")


@router.post("/ai/recommendations")
async def recommendations_endpoint(
    buyer_profile: dict,
    recent_purchases: Optional[List[str]] = None
):
    """
    Get personalized product recommendations.
    
    Increases engagement and sales.
    
    Returns:
    - recommendations: list of suggested products
    - message: personalized message for buyer
    """
    try:
        result = await get_product_recommendations(
            buyer_profile,
            recent_purchases or []
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.get("/ai/capabilities")
async def get_capabilities():
    """
    Get list of available AI features.
    """
    return {
        "status": "success",
        "capabilities": [
            {
                "name": "Enhanced Fraud Detection",
                "endpoint": "/ai/fraud-check",
                "method": "POST",
                "use_case": "Detect fraudulent products with detailed analysis"
            },
            {
                "name": "Description Optimization",
                "endpoint": "/ai/optimize-description",
                "method": "POST",
                "use_case": "Improve product descriptions for better sales"
            },
            {
                "name": "Auto-Categorization",
                "endpoint": "/ai/categorize",
                "method": "POST",
                "use_case": "Automatically categorize products"
            },
            {
                "name": "Similar Products",
                "endpoint": "/ai/find-similar",
                "method": "POST",
                "use_case": "Find similar/competing products"
            },
            {
                "name": "Seller Quality Scoring",
                "endpoint": "/ai/seller-quality",
                "method": "POST",
                "use_case": "Score and rank seller trustworthiness"
            },
            {
                "name": "Dispute Analysis",
                "endpoint": "/ai/analyze-dispute",
                "method": "POST",
                "use_case": "Analyze disputes and recommend resolution"
            },
            {
                "name": "Support Chatbot",
                "endpoint": "/ai/support",
                "method": "POST",
                "use_case": "Handle customer support queries"
            },
            {
                "name": "Content Moderation",
                "endpoint": "/ai/check-content",
                "method": "POST",
                "use_case": "Check content for policy violations"
            },
            {
                "name": "Market Insights",
                "endpoint": "/ai/market-insights",
                "method": "POST",
                "use_case": "Analyze market trends and pricing"
            },
            {
                "name": "Recommendations",
                "endpoint": "/ai/recommendations",
                "method": "POST",
                "use_case": "Get personalized product recommendations"
            }
        ]
    }
