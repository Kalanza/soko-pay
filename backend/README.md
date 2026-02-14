# Soko Pay Backend (Dev 1 - Complete ✅)

## What's Built

Complete FastAPI backend with escrow payment flow for social commerce.

### Core Features
- ✅ Payment link generation for sellers
- ✅ M-Pesa STK push via PayHero API
- ✅ Order tracking and status management
- ✅ Escrow state machine (pending → paid → shipped → delivered → completed)
- ✅ Transaction logging
- ✅ PayHero callback handling
- ✅ SQLite database with fraud detection fields (ready for Dev 2 integration)

## Project Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── database.py                # SQLite database & CRUD operations
├── requirements.txt           # Python dependencies
├── test_api.py               # API test script
├── .env.example              # Environment variables template
└── app/
    ├── __init__.py
    ├── models/
    │   ├── __init__.py
    │   └── order.py          # Pydantic models (Product, Order, PaymentRequest, etc.)
    ├── routes/
    │   ├── __init__.py
    │   ├── orders.py         # Order endpoints (/create-payment-link, /track)
    │   └── payments.py       # Payment endpoints (/pay, /ship, /confirm-delivery)
    └── services/
        ├── __init__.py
        └── payhero.py        # PayHero API integration
```

## API Endpoints

### Orders
- **POST /api/create-payment-link** - Create escrow payment link
  - Request: Product details (name, price, seller info)
  - Response: Order ID and shareable payment link
  
- **GET /api/track/{order_id}** - Track order status
  - Response: Complete order details with timeline

- **GET /api/orders/{order_id}/qr** - Get QR code for payment link

### Payments
- **POST /api/pay/{order_id}** - Initiate M-Pesa payment
  - Request: Buyer phone number and name
  - Response: STK push confirmation
  
- **POST /api/payhero/callback** - PayHero webhook (internal)
  - Handles payment confirmations
  - Updates order status to "paid"
  
- **POST /api/ship/{order_id}** - Mark order as shipped
  - Seller confirms shipment
  
- **POST /api/confirm-delivery/{order_id}** - Confirm delivery & release funds
  - Buyer confirms receipt
  - Releases funds to seller (minus 3% platform fee)

## Environment Setup

1. **Create .env file**:
```bash
cp .env.example .env
```

2. **Add your PayHero credentials**:
```env
PAYHERO_API_KEY=your_api_key_here
PAYHERO_CHANNEL_ID=your_channel_id_here
API_BASE_URL=http://localhost:8000
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

## Running the Backend

### Start Server
```bash
python -m uvicorn main:app --reload
```

Server runs on: **http://localhost:8000**

### Test Endpoints
```bash
python test_api.py
```

### View API Documentation
Open in browser: **http://localhost:8000/docs**

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    product_description TEXT,
    product_category TEXT,
    seller_phone TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    buyer_phone TEXT,
    buyer_name TEXT,
    status TEXT DEFAULT 'pending',
    payment_link TEXT,
    payhero_ref TEXT,
    fraud_risk_score INTEGER,
    fraud_risk_level TEXT,
    fraud_flags TEXT,
    seller_location_lat REAL,
    seller_location_lon REAL,
    buyer_location_lat REAL,
    buyer_location_lon REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    paid_at TEXT,
    shipped_at TEXT,
    delivered_at TEXT
)
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL,
    payhero_ref TEXT,
    mpesa_ref TEXT,
    status TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Disputes Table
```sql
CREATE TABLE disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    raised_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT,
    status TEXT DEFAULT 'pending',
    resolution TEXT,
    resolved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## Example Usage

### 1. Create Payment Link (Seller)
```bash
curl -X POST http://localhost:8000/api/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max",
    "price": 4500,
    "description": "Brand new shoes, size 42",
    "seller_phone": "254712345678",
    "seller_name": "Brian Kipchoge",
    "category": "Shoes"
  }'
```

Response:
```json
{
  "order_id": "SP1A2B3C4D5E6F",
  "payment_link": "https://soko-pay.vercel.app/pay/SP1A2B3C4D5E6F",
  "message": "Payment link created successfully..."
}
```

### 2. Pay for Order (Buyer)
```bash
curl -X POST http://localhost:8000/api/pay/SP1A2B3C4D5E6F \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_phone": "254722334455",
    "buyer_name": "Mercy Wanjiru"
  }'
```

Response:
```json
{
  "message": "STK push sent. Check your phone...",
  "order_id": "SP1A2B3C4D5E6F",
  "payhero_response": {
    "success": true,
    "reference": "PH123456"
  }
}
```

### 3. Track Order
```bash
curl http://localhost:8000/api/track/SP1A2B3C4D5E6F
```

## Integration Points for Other Devs

### For Dev 2 (AI/GIS):
- **Fraud Detection Hook**: Add function call in `payments.py` at line ~90 after payment success
- **GPS Verification Hook**: Add function call in `payments.py` at line ~160 for delivery confirmation
- **Database fields ready**: `fraud_risk_score`, `fraud_risk_level`, `fraud_flags`, location coordinates

### For Dev 3 (Frontend):
- **Base URL**: `http://localhost:8000` (development) or deployment URL
- **Payment Link Format**: `https://soko-pay.vercel.app/pay/{order_id}`
- **All endpoints return JSON**
- **CORS enabled** for frontend integration
- **Swagger docs** at `/docs` for API reference

## Testing with PayHero

1. Get test credentials from PayHero dashboard
2. Use test M-Pesa number: `254712345678`
3. Default PIN: `1234` (in test mode)
4. Callback URL must be publicly accessible (use ngrok for local testing)

## Next Steps

- [ ] Deploy to Vercel serverless functions
- [ ] Add fraud detection integration (Dev 2)
- [ ] Add GPS verification (Dev 2)
- [ ] Connect frontend (Dev 3)
- [ ] Add webhook retry logic
- [ ] Implement dispute resolution flow

## Time Spent: ~45 minutes ⏱️

**Remaining Dev 1 Time**: 45 minutes for deployment & integration support
