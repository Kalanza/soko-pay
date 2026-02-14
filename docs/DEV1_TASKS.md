# 🔧 Developer 1: Backend Lead - Task Guide

**Time Allocation:** 90 minutes  
**Focus:** Payment infrastructure, PayHero integration, database  
**Priority:** HIGH - Everything depends on your work!

---

## 🎯 Your Mission

Build the **core payment engine** that handles:
- PayHero M-Pesa integration (STK push + callbacks)
- Escrow state management
- Database operations
- RESTful API endpoints

---

## ⏱️ Hour-by-Hour Breakdown

### **HOUR 1 (0:00 - 1:00): Foundation**

#### Minutes 0-20: Setup & Database
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Tasks:**
1. ✅ Install dependencies
2. ✅ Set up SQLite database schema
3. ✅ Create Order and Product models
4. ✅ Test database connection

**Files to create:**
- `database.py` - Database connection & initialization
- `app/models/order.py` - Order, Product, OrderStatus models

**Test it:**
```python
# Quick test in Python shell
python
>>> from database import get_db
>>> db = get_db()
>>> print("Database connected!")
```

---

#### Minutes 20-40: Basic FastAPI Setup
**Tasks:**
1. ✅ Create main FastAPI app
2. ✅ Add CORS middleware
3. ✅ Create health check endpoint
4. ✅ Test server runs

**Files to create:**
- `main.py` - FastAPI application

**Test it:**
```bash
uvicorn main:app --reload
# Visit http://localhost:8000/docs
# Try GET /health
```

---

#### Minutes 40-60: Payment Link Creation
**Tasks:**
1. ✅ Create `/create-payment-link` endpoint
2. ✅ Generate unique order IDs
3. ✅ Save order to database
4. ✅ Return shareable link

**Files to create:**
- `app/routes/orders.py` - Order management endpoints

**API Contract:**
```json
POST /api/create-payment-link
{
  "name": "Nike Air Max",
  "price": 4500,
  "description": "Brand new shoes",
  "seller_phone": "254712345678",
  "seller_name": "Brian"
}

Response:
{
  "order_id": "SKP_a7f3b2",
  "payment_link": "https://sokopay.vercel.app/buy/SKP_a7f3b2",
  "message": "Share this link with your buyer!"
}
```

---

### **HOUR 2 (1:00 - 2:00): PayHero Integration**

#### Minutes 60-80: PayHero STK Push
**Tasks:**
1. ✅ Get PayHero API credentials
2. ✅ Create PayHero service class
3. ✅ Implement STK push function
4. ✅ Handle API errors

**Files to create:**
- `app/services/payhero.py` - PayHero API integration

**PayHero API Example:**
```python
def initiate_payment(amount, phone, reference, callback_url):
    headers = {
        "Authorization": f"Bearer {PAYHERO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "amount": amount,
        "phone_number": phone,
        "channel_id": 1,  # M-Pesa
        "external_reference": reference,
        "callback_url": callback_url,
        "provider": "mpesa"
    }
    
    response = requests.post(
        f"{PAYHERO_BASE_URL}/payments",
        json=payload,
        headers=headers
    )
    
    return response.json()
```

---

#### Minutes 80-100: Payment Callback Handler
**Tasks:**
1. ✅ Create `/payhero/callback` endpoint
2. ✅ Update order status to "PAID"
3. ✅ Validate payment data
4. ✅ Log transaction

**Files to update:**
- `app/routes/payments.py` - Add callback endpoint

**Callback Contract:**
```json
POST /api/payhero/callback
{
  "transaction_id": "PH123456",
  "status": "success",
  "external_reference": "SKP_a7f3b2",
  "amount": 4500,
  "phone_number": "254712345678"
}
```

---

#### Minutes 100-120: Escrow State Machine
**Tasks:**
1. ✅ POST `/pay/{order_id}` - Buyer payment
2. ✅ POST `/ship/{order_id}` - Seller ships
3. ✅ POST `/confirm-delivery/{order_id}` - Release funds
4. ✅ GET `/track/{order_id}` - Get status

**State Flow:**
```
PENDING → PAID → SHIPPED → DELIVERED → COMPLETED
```

---

## 📁 Files You Need to Create

### 1. `backend/requirements.txt`
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0
requests==2.31.0
python-dotenv==1.0.0
sqlalchemy==2.0.25
```

### 2. `backend/.env.example`
```bash
PAYHERO_API_KEY=your_payhero_api_key_here
PAYHERO_BASE_URL=https://payhero.co.ke/api/v1
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import orders, payments
from database import init_db

app = FastAPI(
    title="Soko Pay API",
    description="Escrow platform for social commerce",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup():
    init_db()

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "soko-pay-api"}

# Include routers
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(payments.router, prefix="/api", tags=["payments"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4. `backend/database.py`
```python
import sqlite3
from contextlib import contextmanager

DATABASE_PATH = "soko_pay.db"

def init_db():
    """Initialize database with schema"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            product_description TEXT,
            seller_phone TEXT NOT NULL,
            seller_name TEXT NOT NULL,
            buyer_phone TEXT,
            buyer_name TEXT,
            status TEXT DEFAULT 'pending',
            payment_link TEXT,
            payhero_ref TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            paid_at TIMESTAMP,
            shipped_at TIMESTAMP,
            delivered_at TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL,
            status TEXT,
            payhero_transaction_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
```

### 5. `backend/app/models/__init__.py`
```python
from .order import Order, Product, OrderStatus

__all__ = ["Order", "Product", "OrderStatus"]
```

### 6. `backend/app/models/order.py`
```python
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    REFUNDED = "refunded"

class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    price: float = Field(..., gt=0)
    description: str = Field(..., max_length=1000)
    seller_phone: str = Field(..., pattern=r"^254[0-9]{9}$")
    seller_name: str = Field(..., min_length=2)

class Order(BaseModel):
    id: str
    product: Product
    buyer_phone: Optional[str] = ""
    buyer_name: Optional[str] = ""
    status: OrderStatus = OrderStatus.PENDING
    payment_link: str = ""
    payhero_ref: Optional[str] = ""
    created_at: datetime
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
```

### 7. `backend/app/routes/__init__.py`
```python
# Empty file to make this a package
```

### 8. `backend/app/routes/orders.py`
```python
from fastapi import APIRouter, HTTPException
from app.models.order import Product, OrderStatus
from database import get_db
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/create-payment-link")
async def create_payment_link(product: Product):
    """Seller creates a payment link"""
    order_id = f"SKP_{uuid.uuid4().hex[:8]}"
    payment_link = f"https://sokopay.vercel.app/buy/{order_id}"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO orders (
                id, product_name, product_price, product_description,
                seller_phone, seller_name, payment_link, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            product.name,
            product.price,
            product.description,
            product.seller_phone,
            product.seller_name,
            payment_link,
            "pending"
        ))
        conn.commit()
    
    return {
        "order_id": order_id,
        "payment_link": payment_link,
        "message": "Share this link with your buyer!"
    }

@router.get("/track/{order_id}")
async def track_order(order_id: str):
    """Get order status"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(404, "Order not found")
        
        return dict(row)
```

### 9. `backend/app/routes/payments.py`
```python
from fastapi import APIRouter, HTTPException
from app.services.payhero import initiate_payment
from database import get_db
from pydantic import BaseModel

router = APIRouter()

class PaymentRequest(BaseModel):
    buyer_phone: str
    buyer_name: str

@router.post("/pay/{order_id}")
async def pay_for_order(order_id: str, payment_req: PaymentRequest):
    """Buyer initiates payment"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(404, "Order not found")
        
        if order["status"] != "pending":
            raise HTTPException(400, "Order already paid")
        
        # Trigger PayHero STK push
        callback_url = f"https://your-backend.vercel.app/api/payhero/callback"
        
        payment_response = initiate_payment(
            amount=order["product_price"],
            phone=payment_req.buyer_phone,
            reference=order_id,
            callback_url=callback_url
        )
        
        # Update order with buyer info
        cursor.execute("""
            UPDATE orders 
            SET buyer_phone = ?, buyer_name = ?
            WHERE id = ?
        """, (payment_req.buyer_phone, payment_req.buyer_name, order_id))
        conn.commit()
        
        return {
            "message": "Check your phone for M-Pesa prompt",
            "order_id": order_id
        }

@router.post("/payhero/callback")
async def payhero_callback(data: dict):
    """PayHero payment confirmation callback"""
    order_id = data.get("external_reference")
    status = data.get("status")
    
    if status == "success":
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE orders 
                SET status = 'paid', 
                    payhero_ref = ?,
                    paid_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (data.get("transaction_id"), order_id))
            conn.commit()
    
    return {"status": "received"}

@router.post("/ship/{order_id}")
async def mark_as_shipped(order_id: str):
    """Seller marks order as shipped"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders 
            SET status = 'shipped', shipped_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'paid'
        """, (order_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(400, "Cannot ship this order")
        
        conn.commit()
    
    return {"message": "Order marked as shipped"}

@router.post("/confirm-delivery/{order_id}")
async def confirm_delivery(order_id: str):
    """Buyer confirms delivery - releases funds"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders 
            SET status = 'completed', delivered_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'shipped'
        """, (order_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(400, "Cannot confirm delivery")
        
        conn.commit()
    
    # TODO: Call PayHero disbursement API to release funds
    
    return {"message": "Funds released to seller!"}
```

### 10. `backend/app/services/__init__.py`
```python
# Empty file
```

### 11. `backend/app/services/payhero.py`
```python
import requests
import os
from dotenv import load_dotenv

load_dotenv()

PAYHERO_API_KEY = os.getenv("PAYHERO_API_KEY")
PAYHERO_BASE_URL = os.getenv("PAYHERO_BASE_URL", "https://payhero.co.ke/api/v1")

def initiate_payment(amount: float, phone: str, reference: str, callback_url: str):
    """Initiate M-Pesa STK push via PayHero"""
    headers = {
        "Authorization": f"Bearer {PAYHERO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "amount": amount,
        "phone_number": phone,
        "channel_id": 1,  # M-Pesa
        "external_reference": reference,
        "callback_url": callback_url,
        "provider": "mpesa"
    }
    
    try:
        response = requests.post(
            f"{PAYHERO_BASE_URL}/payments",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"PayHero error: {e}")
        return {"error": str(e)}
```

---

## ✅ Checklist

### Minute 60
- [ ] Database schema created
- [ ] FastAPI app runs successfully
- [ ] `/health` endpoint works
- [ ] `/create-payment-link` endpoint works

### Minute 120
- [ ] PayHero STK push triggers
- [ ] Callback handler updates order status
- [ ] All escrow states work (pending → paid → shipped → delivered → completed)
- [ ] Can track order status

---

## 🧪 Testing Your Work

```bash
# Test payment link creation
curl -X POST http://localhost:8000/api/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 100,
    "description": "Test",
    "seller_phone": "254712345678",
    "seller_name": "Test Seller"
  }'

# Expected: order_id and payment_link returned

# Test order tracking
curl http://localhost:8000/api/track/SKP_xxxxx
```

---

## 🆘 Common Issues

**Problem: Database locked error**
```python
# Solution: Use context manager properly
with get_db() as conn:
    # Your code here
    conn.commit()  # Don't forget this!
```

**Problem: PayHero API returns 401**
```bash
# Check your API key in .env file
echo $PAYHERO_API_KEY
```

**Problem: CORS errors from frontend**
```python
# Make sure you added CORS middleware in main.py
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

---

## 🚀 Handoff to Other Devs

Once you're done, notify:
- **Dev 2**: "Database ready, add AI fraud check before payment"
- **Dev 3**: "API docs at http://localhost:8000/docs - start frontend integration"

---

**Time check:** You should be 90% done by minute 120. Good luck! 🔥
