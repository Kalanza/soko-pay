# Frontend AI Integration Guide

Complete guide for integrating AI components into Soko Pay frontend.

**Status**: ✅ Ready for Implementation  
**Framework**: Next.js 14+  
**UI Framework**: Tailwind CSS  
**Components**: 7 React components  

---

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Installation](#installation)
4. [Usage Examples](#usage-examples)
5. [Page Integration](#page-integration)
6. [Deployment](#deployment)

---

## Overview

### Created Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **aiService** | API communication layer | `services/aiService.ts` |
| **DescriptionOptimizer** | Improve product descriptions | `components/DescriptionOptimizer.tsx` |
| **ProductCategorizer** | Auto-categorize products | `components/ProductCategorizer.tsx` |
| **SellerQualityBadge** | Display seller scores | `components/SellerQualityBadge.tsx` |
| **SupportChatbot** | Customer support chat | `components/SupportChatbot.tsx` |
| **MarketInsights** | Market analysis for sellers | `components/MarketInsights.tsx` |
| **RecommendationCarousel** | Personalized product suggestions | `components/RecommendationCarousel.tsx` |
| **AIFeaturesHub** | Feature showcase/navigation | `components/AIFeaturesHub.tsx` |

### Architecture

```
Frontend (Next.js)
    ├── services/aiService.ts (API Client)
    │   └── Handles all AI API calls
    └── components/
        ├── DescriptionOptimizer.tsx
        ├── ProductCategorizer.tsx
        ├── SellerQualityBadge.tsx
        ├── SupportChatbot.tsx
        ├── MarketInsights.tsx
        ├── RecommendationCarousel.tsx
        └── AIFeaturesHub.tsx
            │
            └──→ Backend API
                └── /api/ai/* endpoints
```

---

## Components

### 1. aiService

**Purpose**: Central API communication hub  
**Location**: `frontend/services/aiService.ts`

**Available Methods**:
- `checkFraud()` - Fraud detection
- `optimizeDescription()` - Description enhancement
- `categorizeProduct()` - Auto-categorization
- `findSimilarProducts()` - Competition analysis
- `scoreSellerQuality()` - Seller rating
- `analyzeDispute()` - Dispute resolution
- `handleSupportQuery()` - Support chatbot
- `checkContent()` - Content moderation
- `getMarketInsights()` - Market analysis
- `getRecommendations()` - Product suggestions

**Setup**:
```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

### 2. DescriptionOptimizer

**Purpose**: Helps sellers improve product descriptions  
**Component**: `components/DescriptionOptimizer.tsx`

**Props**:
```typescript
{
  initialDescription: string;      // Current description
  productName: string;             // Product name
  category: string;                // Product category
  onOptimized?: (desc: string) => void; // Callback
}
```

**Features**:
- Real-time AI optimization
- Shows improvement suggestions
- Apply or discard suggestions
- Character counter

**Usage**:
```tsx
import { DescriptionOptimizer } from '@/components/DescriptionOptimizer';

export function ProductForm() {
  return (
    <DescriptionOptimizer
      initialDescription="Old description"
      productName="Samsung Phone"
      category="Electronics"
      onOptimized={(optimized) => {
        setDescription(optimized);
      }}
    />
  );
}
```

---

### 3. ProductCategorizer

**Purpose**: Automatically categorize products  
**Component**: `components/ProductCategorizer.tsx`

**Props**:
```typescript
{
  productName: string;
  description: string;
  onCategorySelected?: (category: string) => void;
}
```

**Features**:
- One-click auto-categorization
- Shows confidence score
- Alternative categories
- Modal popup with explanation

**Usage**:
```tsx
import { ProductCategorizer } from '@/components/ProductCategorizer';

export function NewProductPage() {
  const [category, setCategory] = useState('');

  return (
    <ProductCategorizer
      productName={productName}
      description={description}
      onCategorySelected={(cat) => setCategory(cat)}
    />
  );
}
```

---

### 4. SellerQualityBadge

**Purpose**: Display seller trustworthiness  
**Component**: `components/SellerQualityBadge.tsx`

**Props**:
```typescript
{
  seller: {
    name: string;
    productCount: number;
    avgPrice: number;
    photoRate: number;        // 0-1
    descriptionQuality: string; // "low" | "medium" | "high"
    productVariety: number;
    phone: string;
  };
  compact?: boolean;          // Small badge vs full card
}
```

**Features**:
- Real-time seller rating
- Star display
- Strengths/improvements list
- Risk assessment

**Usage**:
```tsx
import { SellerQualityBadge } from '@/components/SellerQualityBadge';

// On seller profile page
<SellerQualityBadge
  seller={{
    name: "TechStore Kenya",
    productCount: 45,
    avgPrice: 15000,
    photoRate: 0.92,
    descriptionQuality: "high",
    productVariety: 8,
    phone: "+254712345678"
  }}
/>

// Or compact version on listing
<SellerQualityBadge
  seller={sellerData}
  compact={true}
/>
```

---

### 5. SupportChatbot

**Purpose**: AI-powered customer support  
**Component**: `components/SupportChatbot.tsx`

**Props**:
```typescript
{
  orderId?: string;
  buyerName?: string;
  onClose?: () => void;
}
```

**Features**:
- Real-time chat interface
- Context-aware responses
- Auto-escalation for complex issues
- Mobile-friendly design

**Usage**:
```tsx
import { SupportChatbot } from '@/components/SupportChatbot';
import { useState } from 'react';

export function BuyerPage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button onClick={() => setShowChat(true)}>
        💬 Need Help?
      </button>

      {showChat && (
        <SupportChatbot
          orderId="ORD_12345"
          buyerName="John"
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
```

---

### 6. MarketInsights

**Purpose**: Market analysis for sellers  
**Component**: `components/MarketInsights.tsx`

**Props**:
```typescript
{
  category: string;
  recentProducts?: any[];  // Products to analyze
}
```

**Features**:
- Price analysis
- Demand metrics
- Popular features
- Seller tips
- Market forecast

**Usage**:
```tsx
import { MarketInsights } from '@/components/MarketInsights';

export function SellerDashboard() {
  return (
    <MarketInsights
      category="Electronics"
      recentProducts={myProducts}
    />
  );
}
```

---

### 7. RecommendationCarousel

**Purpose**: Personalized product suggestions  
**Component**: `components/RecommendationCarousel.tsx`

**Props**:
```typescript
{
  buyerProfile: {
    name?: string;
    interests: string[];      // ["Electronics", "Fashion"]
    budget?: number;
    location?: string;
  };
  recentPurchases?: string[]; // Product IDs
  title?: string;
}
```

**Features**:
- Carousel slider
- Relevance scoring
- Personalized message
- Mobile responsive

**Usage**:
```tsx
import { RecommendationCarousel } from '@/components/RecommendationCarousel';

export function HomePage() {
  return (
    <RecommendationCarousel
      buyerProfile={{
        name: "John",
        interests: ["Electronics", "Gaming"],
        budget: 50000,
        location: "Nairobi"
      }}
      recentPurchases={["prod_123", "prod_456"]}
      title="Recommended For You"
    />
  );
}
```

---

### 8. AIFeaturesHub

**Purpose**: Showcase all AI features  
**Component**: `components/AIFeaturesHub.tsx`

**Props**: None (Standalone component)

**Features**:
- Feature listing by category
- Statistics display
- Feature details modal
- Links to documentation

**Usage**:
```tsx
import { AIFeaturesHub } from '@/components/AIFeaturesHub';

export function AIPage() {
  return <AIFeaturesHub />;
}
```

---

## Installation

### Step 1: Copy Files

Copy these files to your frontend:
```bash
# Service
cp services/aiService.ts frontend/services/

# Components
cp components/DescriptionOptimizer.tsx frontend/components/
cp components/ProductCategorizer.tsx frontend/components/
cp components/SellerQualityBadge.tsx frontend/components/
cp components/SupportChatbot.tsx frontend/components/
cp components/MarketInsights.tsx frontend/components/
cp components/RecommendationCarousel.tsx frontend/components/
cp components/AIFeaturesHub.tsx frontend/components/
```

### Step 2: Configure Environment

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Or for production
NEXT_PUBLIC_API_URL=https://api.sokopay.com/api
```

### Step 3: Install Dependencies

All components use standard Next.js/React, no additional packages needed!

---

## Usage Examples

### Complete Product Upload Flow

```tsx
// app/seller/new-product/page.tsx
'use client';

import { useState } from 'react';
import { DescriptionOptimizer } from '@/components/DescriptionOptimizer';
import { ProductCategorizer } from '@/components/ProductCategorizer';

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Product</h1>

      {/* Basic Info */}
      <input
        type="text"
        placeholder="Product name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        className="w-full border rounded-lg p-2"
      />

      <input
        type="number"
        placeholder="Price in KES"
        value={formData.price}
        onChange={(e) =>
          setFormData({ ...formData, price: Number(e.target.value) })
        }
        className="w-full border rounded-lg p-2"
      />

      {/* AI-Powered Description */}
      <DescriptionOptimizer
        initialDescription={formData.description}
        productName={formData.name}
        category={formData.category || 'General'}
        onOptimized={(desc) =>
          setFormData({ ...formData, description: desc })
        }
      />

      {/* AI-Powered Categorization */}
      <ProductCategorizer
        productName={formData.name}
        description={formData.description}
        onCategorySelected={(cat) =>
          setFormData({ ...formData, category: cat })
        }
      />

      {/* Submit Button */}
      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">
        Publish Product
      </button>
    </div>
  );
}
```

### Seller Dashboard with Insights

```tsx
// app/seller/dashboard/page.tsx
'use client';

import { MarketInsights } from '@/components/MarketInsights';
import { SellerQualityBadge } from '@/components/SellerQualityBadge';

export default function SellerDashboard() {
  const sellerData = {
    name: "TechStore Kenya",
    productCount: 45,
    avgPrice: 15000,
    photoRate: 0.92,
    descriptionQuality: "high",
    productVariety: 8,
    phone: "+254712345678"
  };

  return (
    <div className="space-y-8 p-6">
      {/* Seller Score */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Performance</h2>
        <SellerQualityBadge seller={sellerData} />
      </section>

      {/* Market Insights */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Electronics Market</h2>
        <MarketInsights
          category="Electronics"
          recentProducts={myProducts}
        />
      </section>
    </div>
  );
}
```

### Buyer Homepage with Recommendations

```tsx
// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user profile
    const userData = getUserProfile();
    setUser(userData);
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Welcome to Soko Pay</h1>

      {/* Main Recommendations */}
      <RecommendationCarousel
        buyerProfile={{
          name: user.name,
          interests: user.interests,
          budget: 100000,
          location: user.location,
        }}
        recentPurchases={user.purchaseHistory}
        title="Discover Products You'll Love"
      />

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
        {/* Browse categories... */}
      </section>
    </div>
  );
}
```

### Support Chatbot in Layout

```tsx
// app/layout.tsx
'use client';

import { useState } from 'react';
import { SupportChatbot } from '@/components/SupportChatbot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showChat, setShowChat] = useState(false);

  return (
    <html>
      <body>
        {children}

        {/* Floating Chat Button */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-40"
          >
            💬
          </button>
        )}

        {/* Chatbot Modal */}
        {showChat && (
          <SupportChatbot
            onClose={() => setShowChat(false)}
          />
        )}
      </body>
    </html>
  );
}
```

---

## Page Integration Checklist

### Seller Pages
- [ ] `/seller/new-product` - Add DescriptionOptimizer + ProductCategorizer
- [ ] `/seller/dashboard` - Add MarketInsights + SellerQualityBadge
- [ ] `/seller/edit/[id]` - Add DescriptionOptimizer for editing

### Buyer Pages
- [ ] `/` - Add RecommendationCarousel to homepage
- [ ] `/search` - Add RecommendationCarousel in sidebar
- [ ] `/product/[id]` - Add SellerQualityBadge on seller info
- [ ] Global Layout - Add SupportChatbot floating button

### Admin Pages
- [ ] `/admin/ai-features` - Add AIFeaturesHub

---

## Error Handling

All components include built-in error handling:

```tsx
// If API fails, components show graceful error messages
<DescriptionOptimizer
  initialDescription={desc}
  productName={name}
  category={category}
  // Component shows: "Failed to optimize. Please try again."
/>
```

**Fallback Strategies**:
- Show cached data if available
- Disable component but don't crash page
- Provide manual alternatives (e.g., browse categories if auto doesn't work)

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional (for production)
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_API_TIMEOUT=30000
```

---

## Performance Tips

### 1. Lazy Load Components

```tsx
import dynamic from 'next/dynamic';

const RecommendationCarousel = dynamic(
  () => import('@/components/RecommendationCarousel').then(mod => ({ default: mod.RecommendationCarousel })),
  { loading: () => <p>Loading...</p> }
);
```

### 2. Memoize Props

```tsx
import { useMemo } from 'react';

export function MyPage() {
  const buyerProfile = useMemo(() => ({
    name: user.name,
    interests: user.interests,
  }), [user]);

  return <RecommendationCarousel buyerProfile={buyerProfile} />;
}
```

### 3. Cache API Results

```tsx
// In aiService
const cache = new Map();

export async function getCachedFraudCheck(product) {
  const key = JSON.stringify(product);
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await checkFraud(product);
  cache.set(key, result);
  return result;
}
```

---

## Styling & Customization

All components use Tailwind CSS. Customize by modifying the component files:

```tsx
// Change button colors
<button className="px-4 py-2 bg-green-600 text-white rounded-lg">
  // Instead of bg-blue-600
</button>

// Change card styling
<div className="bg-white rounded-lg border border-gray-200 p-6">
  // Modify border, padding, background
</div>
```

---

## Testing Components Locally

```bash
# Start frontend
cd frontend
npm run dev

# Open browser to http://localhost:3000

# Test each component on its page:
# - http://localhost:3000/seller/new-product (DescriptionOptimizer)
# - http://localhost:3000/product/123 (SellerQualityBadge)
# - http://localhost:3000/dashboard (MarketInsights)
# - http://localhost:3000/ai-features (AIFeaturesHub)
```

---

## Deployment

### Production Setup

```bash
# Build frontend
npm run build

# Environment variables (.env.production)
NEXT_PUBLIC_API_URL=https://api.sokopay.com/api

# Deploy to Vercel
vercel deploy --prod
```

### CORS Configuration

Ensure backend allows frontend domain:

```python
# backend/main.py
allowed_origins = [
    "https://sokopay.com",
    "https://www.sokopay.com",
]
```

---

## Troubleshooting

**Problem**: Components show "Loading..." forever
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check browser console for CORS errors

**Problem**: API returns 500 error
- Check backend logs
- Verify Gemini API key is set
- Check request formatting

**Problem**: Images/icons not displaying
- Check emoji support in browser
- Verify Tailwind CSS is loaded
- Check image URLs in recentProducts

---

## Next Steps

1. ✅ Copy components to frontend
2. ✅ Set environment variables
3. ✅ Integrate into pages
4. ⏳ Test locally
5. ⏳ Deploy to production
6. ⏳ Monitor analytics

---

## Support

- 📚 [API Documentation](./AI_API_GUIDE.md)
- 🐛 [Report Issues](https://github.com/Kalanza/soko-pay/issues)
- 💬 [Community Chat](https://discord.gg/sokopay)
