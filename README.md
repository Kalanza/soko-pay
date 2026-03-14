# 🛡️ SOKO PAY - Social Commerce Escrow Platform

**Tagline:** *Shop Instagram & WhatsApp safely - Your money, protected until delivery*

[![Built with PayHero](https://img.shields.io/badge/Payments-PayHero-green)](https://payhero.co.ke)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-blue)](https://ai.google.dev)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

---

## 🎯 Problem Statement

In Kenya, **70% of online shopping** happens on Instagram, WhatsApp, and Facebook Marketplace. However:
- ❌ **ZERO buyer protection** - customers send M-Pesa first and pray
- ❌ **KES 50,000+ lost DAILY** to scams in Nairobi alone
- ❌ **Sellers face payment disputes** even when they deliver
- ❌ **Trust gap kills** a KES 45 billion market

## 💡 Solution

**Soko Pay** is an **AI-powered escrow platform** built specifically for social commerce:

✅ **Escrow Protection** - Money held until buyer confirms delivery  
✅ **AI Fraud Detection** - Gemini AI scans transactions for scam patterns  
✅ **GPS Verification** - Location proof for high-value items (>KES 10K)  
✅ **Instant Payouts** - Sellers get paid within 24 hours  
✅ **No App Required** - Works via web + SMS  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│              Next.js 14 + TypeScript                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Seller   │  │ Payment  │  │ Tracking │         │
│  │Dashboard │  │   Page   │  │   Page   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└────────────────────┬────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                          │
│                FastAPI (Python)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ PayHero  │  │ Gemini   │  │   GIS    │         │
│  │   API    │  │   AI     │  │  Verify  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   SQLite    │
              │  Database   │
              └─────────────┘
```

---

## 🚀 Quick Start (3-Hour Hackathon Build)

### Prerequisites
```bash
# Check versions
python --version  # 3.11+
node --version    # 18+
git --version
```

### 1. Clone & Setup
```bash
git clone https://github.com/Kalanza/soko-pay.git
cd soko-pay
```

### 2. Backend Setup (Dev 1)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Edit .env with your API keys
code .env
```

### 3. Frontend Setup (Dev 3)
```bash
cd frontend
npm install
cp .env.local.example .env.local

# Edit .env.local
code .env.local
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health

---

## 👥 Team Roles & Responsibilities

### 🔧 Developer 1: Backend Lead (90 minutes)
**Focus:** Payment infrastructure, PayHero integration, database

**Files to work on:**
- `backend/main.py` - Main FastAPI app
- `backend/app/models/order.py` - Database models
- `backend/app/services/payhero.py` - PayHero API integration
- `backend/app/routes/payments.py` - Payment endpoints
- `backend/database.py` - SQLite setup

**Key deliverables:**
- ✅ PayHero STK push integration
- ✅ Payment callback handler
- ✅ Escrow state machine
- ✅ Order management CRUD
- ✅ Database schema

**See:** [DEV1_TASKS.md](./docs/DEV1_TASKS.md)

---

### 🤖 Developer 2: AI & GIS Specialist (60 minutes)
**Focus:** Fraud detection, location verification, security

**Files to work on:**
- `backend/app/services/ai_fraud.py` - Gemini AI integration
- `backend/app/services/gis_verification.py` - GPS verification
- `backend/app/routes/disputes.py` - Dispute handling
- `backend/app/utils/risk_scoring.py` - Risk algorithms

**Key deliverables:**
- ✅ AI fraud detection engine
- ✅ Risk scoring (0-100)
- ✅ GPS proximity verification
- ✅ Dispute management system

**See:** [DEV2_TASKS.md](./docs/DEV2_TASKS.md)

---

### 🎨 Developer 3: Frontend & Integration (90 minutes)
**Focus:** User interfaces, API integration, deployment

**Files to work on:**
- `frontend/app/seller/page.tsx` - Seller dashboard
- `frontend/app/buy/[id]/page.tsx` - Payment page
- `frontend/app/track/[id]/page.tsx` - Order tracking
- `frontend/components/StatusBadge.tsx` - UI components
- `frontend/lib/api.ts` - API client

**Key deliverables:**
- ✅ Seller dashboard (link generator)
- ✅ Buyer payment flow
- ✅ Order tracking interface
- ✅ API integration
- ✅ Vercel deployment

**See:** [DEV3_TASKS.md](./docs/DEV3_TASKS.md)

---

## 📁 Project Structure

```
soko-pay/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── order.py              # Order, Product models
│   │   │   └── transaction.py        # Transaction logs
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── payments.py           # Payment endpoints
│   │   │   ├── orders.py             # Order management
│   │   │   └── disputes.py           # Dispute handling
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── payhero.py            # PayHero API
│   │   │   ├── ai_fraud.py           # Gemini AI
│   │   │   └── gis_verification.py   # GPS checks
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── risk_scoring.py       # Risk algorithms
│   ├── main.py                       # FastAPI app
│   ├── database.py                   # SQLite setup
│   ├── requirements.txt              # Python deps
│   └── .env.example                  # Environment template
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── seller/
│   │   │   └── page.tsx              # Seller dashboard
│   │   ├── buy/
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Payment page
│   │   └── track/
│   │       └── [id]/
│   │           └── page.tsx          # Tracking page
│   ├── components/
│   │   ├── StatusBadge.tsx           # Status UI
│   │   ├── OrderTimeline.tsx         # Progress tracker
│   │   └── ConfettiEffect.tsx        # Success animation
│   ├── lib/
│   │   └── api.ts                    # API client
│   ├── package.json                  # Node deps
│   ├── tailwind.config.ts            # Tailwind config
│   └── .env.local.example            # Frontend env
│
├── docs/
│   ├── DEV1_TASKS.md                 # Backend lead guide
│   ├── DEV2_TASKS.md                 # AI/GIS specialist guide
│   ├── DEV3_TASKS.md                 # Frontend guide
│   ├── API.md                        # API documentation
│   └── DEPLOYMENT.md                 # Deployment guide
│
├── vercel.json                       # Vercel config
├── .gitignore                        # Git ignore
└── README.md                         # This file
```

---

## 🔌 API Endpoints

### Payment Flow
```
POST   /api/create-payment-link      Create payment link for seller
POST   /api/pay/{order_id}           Buyer initiates payment
POST   /api/payhero/callback         PayHero payment confirmation
POST   /api/ship/{order_id}          Seller marks order as shipped
POST   /api/confirm-delivery/{id}    Buyer confirms delivery
GET    /api/track/{order_id}         Get order status
```

### Admin & Disputes
```
POST   /api/dispute/{order_id}       Raise a dispute
GET    /api/disputes                 List all disputes (admin)
POST   /api/resolve-dispute/{id}     Resolve dispute (admin)
```

### Health & Monitoring
```
GET    /health                       API health check
GET    /metrics                      System metrics
```

**See:** [docs/API.md](./docs/API.md) for detailed documentation

---

---

## 📊 Database Schema

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

---

## 📝 Example API Usage

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

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Test
```bash
# Test complete flow
python scripts/test_flow.py
```

### Testing with PayHero
1. Get test credentials from PayHero dashboard
2. Use test M-Pesa number: `254712345678`
3. Default PIN: `1234` (in test mode)
4. Callback URL must be publicly accessible (use ngrok for local testing)

---

## 🚀 Deployment

### Backend (Vercel Serverless)
```bash
cd backend
vercel --prod
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Environment Variables
Set these in Vercel dashboard:
```
PAYHERO_API_KEY=your_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=your_database_url (production)
```

**See:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 📊 Hackathon Categories Coverage

| Category | Implementation | Status |
|----------|---------------|--------|
| **Payments & Transfers** | Escrow + PayHero M-Pesa | ✅ Core |
| **AI and Payments** | Gemini fraud detection | ✅ Core |
| **GIS & Payments** | GPS delivery verification | ✅ Core |
| **SaaS** | Subscription pricing model | ✅ Business |
| **Wildcard** | Novel social commerce escrow | ✅ Innovation |

---

## 💰 Business Model

**Transaction Fees:**
- 3% per transaction (industry standard)
- Example: KES 5,000 order = KES 150 fee

**SaaS Subscriptions:**
- **Free:** 20 transactions/month, 3% fee
- **Pro (KES 999/mo):** Unlimited, 2% fee, custom branding
- **Enterprise:** API access, 1.5% fee, white-label

**Unit Economics:**
- Avg transaction: KES 3,500
- Our fee (3%): KES 105
- Costs: KES 50 (PayHero, server, support)
- **Profit: KES 55 (52% margin)**

---

## 📈 Roadmap

### Week 1-2: Pilot Launch
- Onboard 20 Instagram sellers
- Process 100 transactions
- Target: KES 350K GMV

### Month 1-3: Local Expansion
- Add 200 sellers (Nairobi, Mombasa)
- Partner with courier services
- Target: 2,000 transactions

### Month 4-6: Scale
- Raise KES 10M pre-seed
- Launch mobile app
- Target: 15,000 transactions/month

### Year 2: Regional Expansion
- Launch in Tanzania, Uganda
- Enterprise API for Jumia, Kilimall
- Target: 100K transactions/month

---

## 🤝 Contributing

We're launching THIS WEEK! Want to help?

1. **Sellers**: Sign up at [sokopay.co.ke/seller](https://sokopay.co.ke/seller)
2. **Developers**: Check [CONTRIBUTING.md](./CONTRIBUTING.md)
3. **Investors**: Email founders@sokopay.co.ke
4. **Partners**: WhatsApp +254 712 345 678

---

## 📜 License

MIT License - See [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

- **PayHero** for M-Pesa integration
- **Google** for Gemini AI API
- **Vercel** for hosting platform
- **University of Eldoret** for hackathon support

---

## 📞 Contact

- **Website**: https://sokopay.co.ke
- **Email**: founders@sokopay.co.ke
- **WhatsApp**: +254 712 345 678
- **Twitter**: @SokoPayKE

---

**Built with ❤️ in Kenya | Valentine's Hackathon 2026**
