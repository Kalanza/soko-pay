import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


async def check_fraud_risk(order_data: dict) -> dict:
    """
    Use Gemini AI to detect fraudulent transactions.

    Args:
        order_data: {
            "product_name": str,
            "price": float,
            "description": str,
            "seller_phone": str,
            "category": str (optional)
        }

    Returns:
        {
            "risk_score": int (0-100),
            "risk_level": str ("low", "medium", "high"),
            "reason": str,
            "flags": list[str]
        }
    """

    prompt = f"""
    You are a fraud detection AI for an e-commerce platform in Kenya.
    Analyze this transaction for fraud risk:

    Product: {order_data.get('product_name')}
    Price: KES {order_data.get('price')}
    Description: {order_data.get('description')}
    Seller Phone: {order_data.get('seller_phone')}

    Common scam patterns in Kenya:
    - "Pay now, no refunds" -> High risk
    - Prices way below market value -> High risk
    - Vague descriptions -> Medium risk
    - New seller with expensive items -> Medium risk
    - Electronics priced <50% market value -> High risk

    Benchmark prices (Kenya):
    - iPhone 15: KES 120,000 - 150,000
    - Nike shoes: KES 8,000 - 15,000
    - Samsung TV 55": KES 50,000 - 80,000
    - PlayStation 5: KES 60,000 - 80,000

    Return ONLY a JSON object with this structure:
    {{
        "risk_score": <0-100>,
        "risk_level": "<low|medium|high>",
        "reason": "<brief explanation>",
        "flags": ["<flag1>", "<flag2>"]
    }}

    Risk scoring:
    - 0-40: Low risk
    - 41-70: Medium risk
    - 71-100: High risk
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)

        result_text = response.text.strip()

        # Remove markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]

        result = json.loads(result_text.strip())

        # Validate structure
        required_keys = ["risk_score", "risk_level", "reason", "flags"]
        if not all(key in result for key in required_keys):
            raise ValueError("Invalid response structure from AI")

        return result

    except Exception as e:
        print(f"AI fraud detection error: {e}")
        # Fallback to rule-based detection
        return fallback_fraud_detection(order_data)


def fallback_fraud_detection(order_data: dict) -> dict:
    """Rule-based fraud detection (backup if AI fails)."""
    risk_score = 0
    flags = []

    description = order_data.get('description', '').lower()
    price = order_data.get('price', 0)
    product_name = order_data.get('product_name', '').lower()

    # Check for suspicious keywords
    suspicious_terms = [
        'no refund', 'pay now', 'limited time', 'urgent',
        'cash only', 'meet parking lot', 'wire transfer'
    ]

    for term in suspicious_terms:
        if term in description:
            risk_score += 20
            flags.append(f"suspicious_term:{term}")

    # Check price anomalies for electronics
    price_benchmarks = {
        'iphone': 50000,
        'macbook': 60000,
        'samsung tv': 30000,
        'playstation': 40000,
        'ps5': 40000,
    }

    for item, min_price in price_benchmarks.items():
        if item in product_name and price < min_price:
            risk_score += 30
            flags.append(f"price_too_low_for_{item.replace(' ', '_')}")

    # Very cheap items (possible bait)
    if price < 100:
        risk_score += 15
        flags.append("suspiciously_cheap")

    # Very expensive items (higher stakes)
    if price > 50000:
        risk_score += 10
        flags.append("high_value_item")

    # Cap at 100
    risk_score = min(risk_score, 100)

    # Determine risk level
    if risk_score < 40:
        risk_level = "low"
    elif risk_score < 70:
        risk_level = "medium"
    else:
        risk_level = "high"

    reason = f"Rule-based detection: {', '.join(flags) if flags else 'No major red flags'}"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reason": reason,
        "flags": flags
    }


# Quick test function
if __name__ == "__main__":
    import asyncio

    test_order = {
        "product_name": "iPhone 15 Pro",
        "price": 15000,  # Too low!
        "description": "Brand new iPhone, pay now, no refunds",
        "seller_phone": "254712345678"
    }

    result = asyncio.run(check_fraud_risk(test_order))
    print(json.dumps(result, indent=2))
