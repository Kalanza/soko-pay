"""
Enhanced Gemini AI services for Soko Pay
Handles fraud detection, content optimization, analysis, and recommendations
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from typing import List, Dict, Optional

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# ============================================================================
# 1. FRAUD DETECTION (Enhanced)
# ============================================================================

async def check_fraud_risk_enhanced(order_data: dict) -> dict:
    """
    Enhanced fraud detection with more detailed analysis.
    
    Args:
        order_data: Product and seller information
    
    Returns:
        Enhanced fraud risk assessment with seller reputation factors
    """
    prompt = f"""
    You are an expert fraud detection AI for Soko Pay (Kenya's social commerce escrow platform).
    Analyze this transaction comprehensively:

    PRODUCT DETAILS:
    - Name: {order_data.get('product_name')}
    - Price: KES {order_data.get('price'):,.0f}
    - Category: {order_data.get('category', 'Unknown')}
    - Description: {order_data.get('description')}
    - Photos attached: {len(order_data.get('photos', [])) or 'None'}
    
    SELLER INFO:
    - Name: {order_data.get('seller_name')}
    - Phone: {order_data.get('seller_phone')}

    ANALYZE FOR:
    1. Price anomalies (too low/high for category in Kenya market)
    2. Description red flags (no refunds, meet parking lot, etc)
    3. Missing information (no photos, vague description)
    4. Category-price mismatch
    5. Seller risk (new seller with expensive items)

    KENYA MARKET BENCHMARKS:
    - iPhone 15: 120K-150K KES
    - Nike shoes: 8K-15K KES
    - Samsung TV 55": 50K-80K KES
    - PlayStation 5: 60K-80K KES
    - Clothes: 500-5K KES
    - Second-hand items: 30-50% of new price
    
    RISK FACTORS (each adds to score):
    - Price < 30% market value: +35 points
    - No photos provided: +15 points
    - Suspicious keywords: +20 points
    - Description < 50 chars: +10 points
    - High-value item with new seller: +15 points
    - Meeting arrangement required: +20 points

    Return ONLY valid JSON:
    {{
        "risk_score": <0-100>,
        "risk_level": "<low|medium|high>",
        "reason": "<detailed explanation>",
        "flags": ["<flag1>", "<flag2>"],
        "recommendation": "<Accept all/Require delivery|Highly suspicious - manual review>",
        "confidence": <0-100>
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean markdown
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]

        result = json.loads(result_text.strip())
        return result

    except Exception as e:
        print(f"Enhanced fraud detection error: {e}")
        return {
            "risk_score": 50,
            "risk_level": "medium",
            "reason": "AI unavailable, using conservative estimate",
            "flags": ["ai_service_error"],
            "recommendation": "Manual review recommended",
            "confidence": 30
        }


# ============================================================================
# 2. PRODUCT DESCRIPTION OPTIMIZATION (NEW)
# ============================================================================

async def optimize_product_description(description: str, product_name: str, category: str) -> dict:
    """
    Improve product description for better sales and trust.
    
    Uses Gemini to rewrite descriptions that:
    - Are more engaging and detailed
    - Include key selling points
    - Match Kenya market language
    - Build buyer confidence
    
    Returns:
        Optimized description and suggestions
    """
    prompt = f"""
    You are a product description copywriter for Soko Pay (Kenya's social commerce).
    Improve this product description to increase sales and buyer trust:

    PRODUCT: {product_name}
    CATEGORY: {category}
    CURRENT DESCRIPTION: {description}

    CREATE AN OPTIMIZED VERSION THAT:
    1. Is 100-150 words (detailed but concise)
    2. Highlights key features and benefits
    3. Uses trust-building language
    4. Mentions condition (new/near-new/used)
    5. Includes relevant specifications
    6. Is written in Kenyan English
    7. Avoids red flags (no refunds, cash only, etc)
    8. Mentions delivery willingness

    RETURN JSON:
    {{
        "optimized_description": "<improved description>",
        "key_points": ["<point1>", "<point2>"],
        "tone": "<professional|friendly|enthusiastic>",
        "estimated_engagement_increase": "<percentage>",
        "suggestions": ["<suggestion1>", "<suggestion2>"]
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result_text = response.text.strip()

        if result_text.startswith("```"):
            result_text = result_text[result_text.find("{"):result_text.rfind("}")+1]

        result = json.loads(result_text)
        return result

    except Exception as e:
        return {
            "optimized_description": description,
            "key_points": [],
            "tone": "neutral",
            "estimated_engagement_increase": "0%",
            "suggestions": [f"Error: {str(e)}"]
        }


# ============================================================================
# 3. AUTOMATIC PRODUCT CATEGORIZATION (NEW)
# ============================================================================

async def categorize_product(product_name: str, description: str) -> dict:
    """
    Automatically categorize product using AI.
    
    Useful when seller doesn't select a category.
    """
    prompt = f"""
    Analyze this product and categorize it accurately for Soko Pay.

    PRODUCT NAME: {product_name}
    DESCRIPTION: {description}

    VALID CATEGORIES: Electronics, Clothes & Fashion, Home & Garden, Sports, 
    Books & Media, Toys & Games, Tools & Hardware, Motors & Parts, Beauty & Health, Other

    RETURN JSON:
    {{
        "category": "<primary category>",
        "subcategory": "<optional sub-category>",
        "confidence": <0-100>,
        "alternative_categories": ["<alt1>", "<alt2>"],
        "reason": "<why this category>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "category": "Other",
            "subcategory": None,
            "confidence": 0,
            "alternative_categories": [],
            "reason": f"Error: {str(e)}"
        }


# ============================================================================
# 4. PRODUCT COMPARISON & MATCHING (NEW)
# ============================================================================

async def find_similar_products(product_name: str, price: float, category: str, existing_products: List[dict]) -> dict:
    """
    Find similar products in database to check for duplicate listings/comparisons.
    
    Helps detect duplicate sellers or competing products.
    """
    top_5_products = existing_products[:5] if existing_products else []
    
    prompt = f"""
    Find similar products from this list that match the target product.

    TARGET PRODUCT:
    - Name: {product_name}
    - Price: KES {price:,.0f}
    - Category: {category}

    EXISTING PRODUCTS:
    {json.dumps(top_5_products[:5], indent=2)}

    RETURN JSON:
    {{
        "similar_products": [
            {{
                "id": "<product_id>",
                "name": "<product_name>",
                "price_difference": "<10% lower|20% higher|etc>",
                "match_score": <0-100>,
                "is_duplicate": <true|false>
            }}
        ],
        "market_positioning": "<underpriced|competitive|overpriced>",
        "recommendation": "<text>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {"similar_products": [], "market_positioning": "unknown", "recommendation": ""}


# ============================================================================
# 5. SELLER QUALITY SCORING (NEW)
# ============================================================================

async def score_seller_quality(seller_data: dict) -> dict:
    """
    Score seller quality based on multiple factors.
    
    Helps buyers make trust decisions and helps sellers improve.
    
    Args:
        seller_data: {
            "seller_name": str,
            "product_count": int,
            "avg_price": float,
            "product_photos_rate": float (0-1),
            "description_quality": str,
            "product_variety": int,
            "phone": str
        }
    """
    prompt = f"""
    Evaluate seller quality and trustworthiness for Soko Pay Kenya.

    SELLER DATA:
    {json.dumps(seller_data, indent=2)}

    SCORING FACTORS:
    1. Professional product descriptions (0-25 points)
    2. Photos per product (0-20 points) - minimum 1, ideal 3+
    3. Product variety (0-15 points)
    4. Price consistency (0-15 points)
    5. Product count trend (0-15 points)
    6. Reasonable price points (0-10 points)

    RETURN JSON:
    {{
        "seller_score": <0-100>,
        "trust_level": "<low|moderate|high|very_high>",
        "strengths": ["<strength1>", "<strength2>"],
        "improvements": ["<improvement1>", "<improvement2>"],
        "recommendation": "<text about buying from this seller>",
        "risk_level": "<low|medium|high>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "seller_score": 50,
            "trust_level": "moderate",
            "strengths": [],
            "improvements": [],
            "recommendation": "Insufficient data",
            "risk_level": "medium"
        }


# ============================================================================
# 6. DISPUTE RESOLUTION ANALYSIS (NEW)
# ============================================================================

async def analyze_dispute(dispute_data: dict) -> dict:
    """
    Analyze dispute details to recommend resolution.
    
    Args:
        dispute_data: {
            "order_id": str,
            "buyer_claim": str,
            "seller_response": str,
            "product_description": str,
            "photos_provided": bool,
            "delivery_confirmed": bool
        }
    """
    prompt = f"""
    Analyze this Soko Pay dispute and recommend resolution.

    DISPUTE DETAILS:
    {json.dumps(dispute_data, indent=2)}

    ANALYZE:
    1. Buyer claim legitimacy
    2. Seller response adequacy
    3. Evidence strength
    4. Likely outcome if escalated
    5. Fair resolution

    RETURN JSON:
    {{
        "buyer_claim_strength": <0-100>,
        "seller_defense_strength": <0-100>,
        "likely_winner": "<buyer|seller|split>",
        "recommended_resolution": "<refund|replacement|partial refund|return shipping>",
        "confidence": <0-100>,
        "reasoning": "<detailed analysis>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "buyer_claim_strength": 50,
            "seller_defense_strength": 50,
            "likely_winner": "unknown",
            "recommended_resolution": "manual_review",
            "confidence": 0,
            "reasoning": "Error - manual review needed"
        }


# ============================================================================
# 7. CUSTOMER SUPPORT CHATBOT (NEW)
# ============================================================================

async def handle_support_query(query: str, context: Optional[dict] = None) -> dict:
    """
    Handle customer support queries using Gemini.
    
    Can answer FAQs, help with orders, provide guidance.
    """
    context_text = ""
    if context:
        context_text = f"\n\nCONTEXT: {json.dumps(context, indent=2)}"

    prompt = f"""
    You are a helpful customer support agent for Soko Pay (Kenya's social commerce escrow platform).
    
    CUSTOMER QUERY: {query}
    {context_text}

    PROVIDE:
    1. Clear, helpful answer
    2. Use Kenyan English
    3. If technical issue, provide troubleshooting steps
    4. If order-related, use context
    5. Be friendly and professional

    RETURN JSON:
    {{
        "response": "<helpful answer>",
        "category": "<order|payment|delivery|fraud|account|other>",
        "urgency": "<low|medium|high>",
        "suggests_escalation": <true|false>,
        "helpful_links": ["<link1>", "<link2>"]
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "response": "I'm having trouble processing your request. Please contact our team directly.",
            "category": "support_error",
            "urgency": "medium",
            "suggests_escalation": True,
            "helpful_links": []
        }


# ============================================================================
# 8. MARKET INSIGHTS & TRENDS (NEW)
# ============================================================================

async def generate_market_insights(product_category: str, recent_products: List[dict]) -> dict:
    """
    Generate market insights for a category.
    
    Helps sellers understand trends and pricing.
    """
    prompt = f"""
    Analyze market trends in Soko Pay for {product_category}.

    RECENT PRODUCTS IN THIS CATEGORY:
    {json.dumps(recent_products[:20], indent=2)}

    ANALYZE:
    1. Price trends (rising/falling/stable)
    2. Popular features/attributes
    3. Demand signals
    4. Seller competition
    5. Buyer expectations

    RETURN JSON:
    {{
        "avg_price": <number>,
        "price_range": {{"min": <number>, "max": <number>}},
        "trend": "<declining|stable|growing>",
        "demand_level": "<low|moderate|high|very_high>",
        "popular_features": ["<feature1>", "<feature2>"],
        "seller_tips": ["<tip1>", "<tip2>"],
        "forecast": "<3-month outlook>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "avg_price": 0,
            "price_range": {"min": 0, "max": 0},
            "trend": "unknown",
            "demand_level": "unknown",
            "popular_features": [],
            "seller_tips": [],
            "forecast": "Insufficient data"
        }


# ============================================================================
# 9. CONTENT MODERATION (NEW)
# ============================================================================

async def check_content_policy(content: str, content_type: str) -> dict:
    """
    Check if content violates policies.
    
    Protects platform from hate speech, violence, etc.
    """
    prompt = f"""
    Check if this {content_type} content violates Soko Pay community policies.

    CONTENT: {content}

    CHECK FOR:
    1. Hate speech
    2. Violence or threats
    3. Sexual content
    4. Misinformation
    5. Spam
    6. Inappropriate language (locally)

    RETURN JSON:
    {{
        "is_safe": <true|false>,
        "confidence": <0-100>,
        "violations": ["<violation1>"],
        "severity": "<none|low|moderate|high>",
        "action": "<approve|flag|reject>",
        "reason": "<if not safe>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {
            "is_safe": True,
            "confidence": 0,
            "violations": [],
            "severity": "none",
            "action": "manual_review",
            "reason": "Error - requires manual review"
        }


# ============================================================================
# 10. PERSONALIZED RECOMMENDATIONS (NEW)
# ============================================================================

async def get_product_recommendations(buyer_profile: dict, recent_purchases: List[str]) -> dict:
    """
    Get personalized product recommendations for buyer.
    
    Increases engagement and sales.
    """
    prompt = f"""
    Generate personalized product recommendations for this Soko Pay buyer.

    BUYER PROFILE:
    {json.dumps(buyer_profile, indent=2)}

    RECENT PURCHASES:
    {json.dumps(recent_purchases, indent=2)}

    RECOMMENDATIONS SHOULD:
    1. Match buyer's past interests
    2. Include varied price points
    3. Be realistic/available in Kenya
    4. Include categories they haven't bought
    5. Match their budget

    RETURN JSON:
    {{
        "recommendations": [
            {{
                "product_type": "<type>",
                "category": "<category>",
                "estimated_price_range": {{"min": <num>, "max": <num>}},
                "why_recommended": "<reason>",
                "search_keywords": ["<keyword1>"]
            }}
        ],
        "message": "<personalized message to buyer>"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        return {"recommendations": [], "message": "Unable to generate recommendations at this time"}
