# 🤖 Developer 2: AI & GIS Specialist - Task Guide

**Time Allocation:** 60 minutes  
**Focus:** Fraud detection, location verification, risk scoring  
**Priority:** MEDIUM-HIGH - Adds intelligence to the platform

---

## 🎯 Your Mission

Build the **security and intelligence layer** that:
- Detects fraudulent transactions using Gemini AI
- Verifies delivery location with GPS
- Scores transaction risk (0-100)
- Handles disputes

---

## ⏱️ Hour-by-Hour Breakdown

### **MINUTES 0-30: AI Fraud Detection**

#### Setup Gemini AI
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install google-generativeai==0.3.2
```

**Get API Key:**
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Copy key to `.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

---

#### Task 1: Build Fraud Detection Engine

**File:** `backend/app/services/ai_fraud.py`

**What it does:**
- Analyzes product description for scam keywords
- Checks price vs. category benchmarks
- Detects suspicious patterns
- Returns risk score (0-100)

**Example Input:**
```json
{
  "product_name": "iPhone 15 Pro Max",
  "price": 15000,
  "description": "Brand new, pay now, no refunds",
  "seller_phone": "254712345678"
}
```

**Expected Output:**
```json
{
  "risk_score": 75,
  "risk_level": "high",
  "reason": "Price too low for iPhone 15 (market avg: 120K). Suspicious terms: 'no refunds'",
  "flags": ["price_anomaly", "suspicious_terms"]
}
```

---

### **MINUTES 30-45: GPS Verification**

#### Task 2: Location Verification Service

**File:** `backend/app/services/gis_verification.py`

**What it does:**
- Calculates distance between buyer and seller
- Verifies buyer is within 1km for high-value items (>KES 10,000)
- Prevents remote scams

**Install dependency:**
```bash
pip install geopy==2.4.1
```

**Example:**
```python
from geopy.distance import geodesic

# Seller location: -0.2827, 36.0654 (Nairobi CBD)
# Buyer location: -0.2850, 36.0680 (500m away)

distance = calculate_distance(
    seller_lat=-0.2827, 
    seller_lon=36.0654,
    buyer_lat=-0.2850, 
    buyer_lon=36.0680
)
# Returns: 0.5 km (VERIFIED ✅)
```

---

### **MINUTES 45-60: Integration & Risk Scoring**

#### Task 3: Integrate AI into Payment Flow

**File:** `backend/app/routes/payments.py` (update Dev 1's code)

Add fraud check BEFORE PayHero payment:
```python
@router.post("/pay/{order_id}")
async def pay_for_order(order_id: str, payment_req: PaymentRequest):
    # ... existing code ...
    
    # AI FRAUD CHECK (NEW)
    fraud_check = await check_fraud_risk(order)
    
    if fraud_check["risk_score"] > 80:
        raise HTTPException(400, f"Transaction blocked: {fraud_check['reason']}")
    
    # ... continue with PayHero payment ...
```

---

## 📁 Files You Need to Create

### 1. `backend/app/services/ai_fraud.py`

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def check_fraud_risk(order_data: dict) -> dict:
    """
    Use Gemini AI to detect fraudulent transactions
    
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
    - "Pay now, no refunds" → High risk
    - Prices way below market value → High risk
    - Vague descriptions → Medium risk
    - New seller with expensive items → Medium risk
    - Electronics priced <50% market value → High risk
    
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
        
        # Parse JSON from response
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
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
    """
    Rule-based fraud detection (backup if AI fails)
    """
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
    
    # Check price anomalies
    if 'iphone' in product_name and price < 50000:
        risk_score += 30
        flags.append("price_too_low_for_iphone")
    
    if 'macbook' in product_name and price < 60000:
        risk_score += 30
        flags.append("price_too_low_for_macbook")
    
    # Very cheap items (possible bait)
    if price < 100:
        risk_score += 15
        flags.append("suspiciously_cheap")
    
    # Very expensive items from new seller
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
```

---

### 2. `backend/app/services/gis_verification.py`

```python
from geopy.distance import geodesic
from typing import Tuple, Optional

def calculate_distance(
    seller_lat: float, 
    seller_lon: float, 
    buyer_lat: float, 
    buyer_lon: float
) -> float:
    """
    Calculate distance between two GPS coordinates in kilometers
    
    Args:
        seller_lat: Seller latitude
        seller_lon: Seller longitude
        buyer_lat: Buyer latitude
        buyer_lon: Buyer longitude
    
    Returns:
        Distance in kilometers (rounded to 2 decimals)
    """
    seller_coords = (seller_lat, seller_lon)
    buyer_coords = (buyer_lat, buyer_lon)
    
    distance_km = geodesic(seller_coords, buyer_coords).kilometers
    
    return round(distance_km, 2)


def verify_delivery_location(
    seller_coords: Tuple[float, float],
    buyer_coords: Tuple[float, float],
    max_distance_km: float = 1.0
) -> dict:
    """
    Verify buyer is near seller location for high-value deliveries
    
    Args:
        seller_coords: (latitude, longitude) of seller
        buyer_coords: (latitude, longitude) of buyer at delivery
        max_distance_km: Maximum allowed distance (default 1km)
    
    Returns:
        {
            "verified": bool,
            "distance_km": float,
            "message": str
        }
    """
    distance = calculate_distance(
        seller_coords[0], seller_coords[1],
        buyer_coords[0], buyer_coords[1]
    )
    
    verified = distance <= max_distance_km
    
    return {
        "verified": verified,
        "distance_km": distance,
        "message": (
            f"✅ Verified: Buyer is {distance}km from pickup point"
            if verified else
            f"❌ Too far: Buyer is {distance}km away (max {max_distance_km}km)"
        )
    }


def get_location_from_ip(ip_address: str) -> Optional[Tuple[float, float]]:
    """
    Get approximate location from IP address (backup if GPS not available)
    
    Note: This is approximate and should only be used as fallback
    """
    # TODO: Implement IP geolocation API (e.g., ipapi.co)
    # For hackathon, you can skip this
    return None


# Quick test
if __name__ == "__main__":
    # Test case: Nairobi CBD locations
    seller_loc = (-1.2864, 36.8172)  # Nairobi CBD
    buyer_loc_near = (-1.2900, 36.8200)  # 500m away
    buyer_loc_far = (-1.3500, 36.9000)  # 10km away
    
    result_near = verify_delivery_location(seller_loc, buyer_loc_near)
    print("Near location:", result_near)
    
    result_far = verify_delivery_location(seller_loc, buyer_loc_far)
    print("Far location:", result_far)
```

---

### 3. `backend/app/utils/__init__.py`

```python
# Empty file
```

---

### 4. `backend/app/utils/risk_scoring.py`

```python
from typing import Dict

def calculate_composite_risk(
    ai_risk_score: int,
    seller_reputation: int = 50,  # 0-100, default neutral
    transaction_velocity: int = 0  # Number of transactions in last hour
) -> Dict:
    """
    Combine multiple risk factors into final score
    
    Args:
        ai_risk_score: Risk score from AI (0-100)
        seller_reputation: Seller's historical score (0-100, higher is better)
        transaction_velocity: Number of recent transactions
    
    Returns:
        {
            "final_score": int (0-100),
            "recommendation": str ("approve", "review", "block")
        }
    """
    
    # Weight factors
    weights = {
        "ai": 0.6,           # AI gets 60% weight
        "reputation": 0.3,   # Seller reputation gets 30%
        "velocity": 0.1      # Transaction velocity gets 10%
    }
    
    # Convert seller reputation to risk (invert: high reputation = low risk)
    reputation_risk = 100 - seller_reputation
    
    # Velocity risk (too many transactions = suspicious)
    velocity_risk = min(transaction_velocity * 10, 100)
    
    # Calculate weighted average
    final_score = (
        ai_risk_score * weights["ai"] +
        reputation_risk * weights["reputation"] +
        velocity_risk * weights["velocity"]
    )
    
    final_score = round(final_score)
    
    # Recommendation
    if final_score < 40:
        recommendation = "approve"
    elif final_score < 70:
        recommendation = "review"  # Manual review
    else:
        recommendation = "block"
    
    return {
        "final_score": final_score,
        "recommendation": recommendation,
        "breakdown": {
            "ai_risk": ai_risk_score,
            "reputation_risk": reputation_risk,
            "velocity_risk": velocity_risk
        }
    }
```

---

### 5. Update `backend/app/routes/payments.py`

Add this import at the top:
```python
from app.services.ai_fraud import check_fraud_risk
from app.services.gis_verification import verify_delivery_location
```

Modify the `/pay/{order_id}` endpoint:
```python
@router.post("/pay/{order_id}")
async def pay_for_order(order_id: str, payment_req: PaymentRequest):
    """Buyer initiates payment with AI fraud check"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(404, "Order not found")
        
        if order["status"] != "pending":
            raise HTTPException(400, "Order already paid")
        
        # 🤖 AI FRAUD CHECK (NEW)
        fraud_check = await check_fraud_risk({
            "product_name": order["product_name"],
            "price": order["product_price"],
            "description": order["product_description"],
            "seller_phone": order["seller_phone"]
        })
        
        # Block high-risk transactions
        if fraud_check["risk_score"] > 80:
            # Log the fraud attempt
            cursor.execute("""
                INSERT INTO transactions (order_id, type, status)
                VALUES (?, 'fraud_check_failed', 'blocked')
            """, (order_id,))
            conn.commit()
            
            raise HTTPException(
                400, 
                f"Transaction blocked for security: {fraud_check['reason']}"
            )
        
        # Warn on medium risk
        if fraud_check["risk_score"] > 40:
            print(f"⚠️ Medium risk transaction: {fraud_check}")
        
        # Continue with PayHero payment...
        # (Rest of Dev 1's code)
```

Modify `/confirm-delivery/{order_id}` to add GPS check:
```python
from pydantic import BaseModel

class DeliveryConfirmation(BaseModel):
    latitude: float = None
    longitude: float = None

@router.post("/confirm-delivery/{order_id}")
async def confirm_delivery(order_id: str, confirmation: DeliveryConfirmation):
    """Buyer confirms delivery with optional GPS verification"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        
        if not order or order["status"] != "shipped":
            raise HTTPException(400, "Cannot confirm delivery")
        
        # 📍 GPS VERIFICATION for high-value items (NEW)
        if order["product_price"] > 10000:
            if not confirmation.latitude or not confirmation.longitude:
                raise HTTPException(
                    400, 
                    "GPS location required for items over KES 10,000"
                )
            
            # Assuming seller location is stored (Dev 1 should add this)
            # For now, skip if seller location not available
            # In production, require seller to set location
        
        # Mark as delivered and release funds
        cursor.execute("""
            UPDATE orders 
            SET status = 'completed', delivered_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (order_id,))
        conn.commit()
    
    # TODO: Call PayHero disbursement API
    
    return {
        "message": "Delivery confirmed! Funds released to seller.",
        "order_id": order_id
    }
```

---

### 6. `backend/app/routes/disputes.py` (NEW FILE)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter()

class DisputeRequest(BaseModel):
    reason: str
    evidence: str = None

@router.post("/dispute/{order_id}")
async def raise_dispute(order_id: str, dispute: DisputeRequest):
    """Buyer or seller raises a dispute"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(404, "Order not found")
        
        if order["status"] not in ["paid", "shipped", "delivered"]:
            raise HTTPException(400, "Cannot dispute this order")
        
        # Update order status
        cursor.execute("""
            UPDATE orders SET status = 'disputed' WHERE id = ?
        """, (order_id,))
        
        # Log dispute
        cursor.execute("""
            INSERT INTO transactions (order_id, type, status)
            VALUES (?, 'dispute_raised', ?)
        """, (order_id, dispute.reason))
        
        conn.commit()
    
    # TODO: Notify admin via email/SMS
    
    return {
        "message": "Dispute raised. Admin will review within 48 hours.",
        "order_id": order_id
    }

@router.get("/disputes")
async def list_disputes():
    """Admin: List all disputes"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM orders WHERE status = 'disputed'
            ORDER BY created_at DESC
        """)
        disputes = [dict(row) for row in cursor.fetchall()]
    
    return {"disputes": disputes, "count": len(disputes)}
```

Don't forget to add this router to `main.py`:
```python
from app.routes import disputes

app.include_router(disputes.router, prefix="/api", tags=["disputes"])
```

---

## ✅ Checklist

### Minute 30
- [ ] Gemini API key configured
- [ ] AI fraud detection works
- [ ] Fallback rule-based detection works
- [ ] Can test fraud check independently

### Minute 45
- [ ] GPS distance calculation works
- [ ] Location verification logic complete
- [ ] Can test with sample coordinates

### Minute 60
- [ ] AI fraud check integrated into payment flow
- [ ] GPS check integrated into delivery confirmation
- [ ] Dispute endpoint created
- [ ] All tests pass

---

## 🧪 Testing Your Work

### Test AI Fraud Detection
```bash
cd backend
python app/services/ai_fraud.py

# Expected output: Risk score and analysis
```

### Test GPS Verification
```bash
python app/services/gis_verification.py

# Expected: Distance calculations
```

### Test API Integration
```bash
# Create an order (via Dev 1's endpoint)
# Then try to pay - should see AI fraud check working

curl -X POST http://localhost:8000/api/pay/SKP_xxxxx \
  -H "Content-Type: application/json" \
  -d '{"buyer_phone": "254712345678", "buyer_name": "Test"}'

# Check logs for AI fraud analysis
```

---

## 🆘 Common Issues

**Problem: Gemini API quota exceeded**
```python
# Solution: Use fallback detection
# The code already handles this!
```

**Problem: GPS coordinates not accurate**
```python
# Note: Phone GPS can be ±50m inaccurate
# Use 1km radius to account for this
```

**Problem: AI returns inconsistent JSON**
```python
# Solution: Already handled in code with try-except
# Falls back to rule-based detection
```

---

## 🚀 Handoff

Once done, tell **Dev 1**:
> "AI fraud detection and GPS verification are ready. Check `app/services/` folder. Payment endpoint now includes fraud checks. Test it!"

---

**Good luck! This is the coolest part of the project! 🤖**
