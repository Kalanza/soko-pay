# 🚀 QUICK START GUIDE

## For All Developers

### 1. Clone & Navigate
```bash
cd C:\Users\USER\soko-pay
```

### 2. Choose Your Role

**Are you Dev 1 (Backend)?** → Read [docs/DEV1_TASKS.md](docs/DEV1_TASKS.md)  
**Are you Dev 2 (AI/GIS)?** → Read [docs/DEV2_TASKS.md](docs/DEV2_TASKS.md)  
**Are you Dev 3 (Frontend)?** → Read [docs/DEV3_TASKS.md](docs/DEV3_TASKS.md)

---

## Dev 1: Backend Setup (Do This First!)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your PayHero API key
notepad .env

# Run the server
uvicorn main:app --reload
```

**Expected output:** Server running on http://localhost:8000  
**Test it:** Visit http://localhost:8000/docs

---

## Dev 2: AI/GIS Setup (After Dev 1 is Running)

```bash
# Make sure you're in backend folder
cd backend

# Activate virtual environment (if not already)
venv\Scripts\activate

# Install AI dependencies (should already be in requirements.txt)
pip install google-generativeai geopy

# Get Gemini API key
# 1. Go to https://ai.google.dev/
# 2. Click "Get API Key"
# 3. Add to .env file:
notepad .env
# Add line: GEMINI_API_KEY=your_key_here

# Test AI independently
python app/services/ai_fraud.py
```

---

## Dev 3: Frontend Setup (Can Start Anytime)

```bash
# Navigate to frontend
cd frontend

# Initialize Next.js (if not already done)
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install dependencies
npm install
npm install lucide-react canvas-confetti qrcode
npm install --save-dev @types/canvas-confetti @types/qrcode

# Create .env.local
copy .env.local.example .env.local

# Run development server
npm run dev
```

**Expected output:** Server running on http://localhost:3000

---

## ⚡ Parallel Development Strategy

### Hour 1 (ALL DEVS)
- **Dev 1**: Set up FastAPI, database, basic endpoints
- **Dev 2**: Get API keys, test AI locally
- **Dev 3**: Set up Next.js, create components

### Hour 2 (INTEGRATION)
- **Dev 1**: PayHero integration, escrow logic
- **Dev 2**: Integrate AI into payment flow
- **Dev 3**: Build seller dashboard, payment page

### Hour 3 (POLISH & DEPLOY)
- **Dev 1**: Testing, bug fixes
- **Dev 2**: GPS verification, disputes
- **Dev 3**: Order tracking, deployment

---

## 🧪 Testing the Complete Flow

### 1. Backend Running?
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"soko-pay-api"}
```

### 2. Create Payment Link
```bash
curl -X POST http://localhost:8000/api/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 1000,
    "description": "Test item",
    "seller_phone": "254712345678",
    "seller_name": "Test Seller"
  }'
```

### 3. Frontend Working?
Open browser: http://localhost:3000

---

## 🆘 Common Issues & Solutions

### Problem: "Module not found" error in Python
```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: "Port 8000 already in use"
```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Problem: "npm install fails"
```bash
# Clear cache and try again
npm cache clean --force
npm install
```

### Problem: "Database locked" error
```bash
# Delete the database file and restart
del backend\soko_pay.db
# Restart backend - it will recreate the database
```

---

## 📁 File Structure Reference

```
soko-pay/
├── backend/          ← Dev 1 & Dev 2 work here
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/  ← Dev 2 AI/GIS code
│   │   └── utils/
│   ├── main.py       ← Dev 1 starts here
│   └── database.py
│
├── frontend/         ← Dev 3 works here
│   ├── app/
│   │   ├── seller/
│   │   ├── buy/
│   │   └── track/
│   └── components/
│
└── docs/            ← Task guides for each dev
    ├── DEV1_TASKS.md
    ├── DEV2_TASKS.md
    └── DEV3_TASKS.md
```

---

## 🎯 Success Criteria

By the end of 3 hours, you should have:

✅ Backend API running with PayHero integration  
✅ AI fraud detection working  
✅ GPS verification for deliveries  
✅ Seller dashboard (create links)  
✅ Buyer payment page  
✅ Order tracking interface  
✅ Complete flow: create → pay → ship → deliver → complete  
✅ Deployed to Vercel  

---

## 🚀 Ready to Start?

1. **Read your task guide** (DEV1_TASKS.md, DEV2_TASKS.md, or DEV3_TASKS.md)
2. **Set up your environment** (follow steps above)
3. **Start coding!** (Each task file has detailed instructions)

---

**Need help?** Check the task guides or main README.md

**Good luck! 🔥 Let's build this!**
