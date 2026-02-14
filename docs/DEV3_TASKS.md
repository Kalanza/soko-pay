# 🎨 Developer 3: Frontend & Integration - Task Guide

**Time Allocation:** 90 minutes  
**Focus:** User interfaces, API integration, deployment  
**Priority:** HIGH - This is what judges will see!

---

## 🎯 Your Mission

Build the **user-facing application** that:
- Seller dashboard (create payment links)
- Buyer payment page
- Order tracking interface
- Deploy to Vercel

---

## ⏱️ Hour-by-Hour Breakdown

### **HOUR 1 (0:00 - 1:00): Next.js Setup & Seller Dashboard**

#### Minutes 0-15: Project Setup
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install dependencies
npm install lucide-react
npm install canvas-confetti
npm install @types/canvas-confetti --save-dev
npm install qrcode
npm install @types/qrcode --save-dev
```

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

#### Minutes 15-45: Seller Dashboard

**File:** `frontend/app/seller/page.tsx`

**Features:**
- Form to create payment link
- Copy link button
- WhatsApp share button
- QR code generation
- Active orders list

---

#### Minutes 45-60: API Client Library

**File:** `frontend/lib/api.ts`

**Functions:**
- `createPaymentLink()`
- `trackOrder()`
- `payForOrder()`
- `confirmDelivery()`

---

### **HOUR 2 (1:00 - 2:00): Payment & Tracking Pages**

#### Minutes 60-80: Buyer Payment Page

**File:** `frontend/app/buy/[id]/page.tsx`

**Features:**
- Display product details
- AI risk score badge
- Phone number input
- "Pay with M-Pesa" button
- Trust indicators

---

#### Minutes 80-100: Order Tracking Page

**File:** `frontend/app/track/[id]/page.tsx`

**Features:**
- Progress timeline
- Status badges
- Action buttons (Ship, Confirm Delivery)
- Raise dispute option

---

#### Minutes 100-120: Polish & Deploy

- Add confetti animation on successful payment
- Responsive design testing
- Deploy to Vercel
- Connect to production backend

---

## 📁 Files You Need to Create

### 1. `frontend/package.json`

If not auto-generated, ensure these dependencies:
```json
{
  "name": "soko-pay-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.321.0",
    "canvas-confetti": "^1.9.2",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/canvas-confetti": "^1.6.4",
    "@types/qrcode": "^1.5.5",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

### 2. `frontend/.env.local.example`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 3. `frontend/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Product {
  name: string;
  price: number;
  description: string;
  seller_phone: string;
  seller_name: string;
}

export interface Order {
  id: string;
  product_name: string;
  product_price: number;
  product_description: string;
  seller_name: string;
  seller_phone: string;
  buyer_phone?: string;
  buyer_name?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'disputed';
  payment_link: string;
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export async function createPaymentLink(product: Product) {
  const response = await fetch(`${API_URL}/api/create-payment-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment link');
  }

  return response.json();
}

export async function trackOrder(orderId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/api/track/${orderId}`);

  if (!response.ok) {
    throw new Error('Order not found');
  }

  return response.json();
}

export async function payForOrder(
  orderId: string,
  buyerPhone: string,
  buyerName: string
) {
  const response = await fetch(`${API_URL}/api/pay/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyer_phone: buyerPhone, buyer_name: buyerName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Payment failed');
  }

  return response.json();
}

export async function markAsShipped(orderId: string) {
  const response = await fetch(`${API_URL}/api/ship/${orderId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to mark as shipped');
  }

  return response.json();
}

export async function confirmDelivery(orderId: string) {
  const response = await fetch(`${API_URL}/api/confirm-delivery/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error('Failed to confirm delivery');
  }

  return response.json();
}

export async function raiseDispute(orderId: string, reason: string) {
  const response = await fetch(`${API_URL}/api/dispute/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error('Failed to raise dispute');
  }

  return response.json();
}
```

---

### 4. `frontend/components/StatusBadge.tsx`

```typescript
interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    paid: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-orange-100 text-orange-800 border-orange-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-green-600 text-white border-green-700',
    disputed: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
```

---

### 5. `frontend/components/OrderTimeline.tsx`

```typescript
import { Check, Circle, Clock } from 'lucide-react';

interface TimelineProps {
  currentStatus: string;
}

export default function OrderTimeline({ currentStatus }: TimelineProps) {
  const steps = [
    { key: 'pending', label: 'Payment Link Created' },
    { key: 'paid', label: 'Payment Received (Escrow)' },
    { key: 'shipped', label: 'Item Shipped' },
    { key: 'delivered', label: 'Delivery Confirmed' },
    { key: 'completed', label: 'Funds Released' },
  ];

  const statusIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-6">
      {steps.map((step, index) => {
        const isCompleted = index < statusIndex;
        const isCurrent = index === statusIndex;
        const isPending = index > statusIndex;

        return (
          <div key={step.key} className="flex items-center mb-6 last:mb-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0">
              {isCompleted && (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
              {isCurrent && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              )}
              {isPending && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Circle className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="ml-4">
              <p
                className={`font-semibold ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-gray-600 mt-1">Current step</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### 6. `frontend/components/ConfettiEffect.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect() {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return null;
}
```

---

### 7. `frontend/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Soko Pay - Shop Safely',
  description: 'Escrow payments for Instagram & WhatsApp shopping in Kenya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

### 8. `frontend/app/page.tsx` (Landing Page)

```typescript
import Link from 'next/link';
import { Shield, Smartphone, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🛡️ Soko Pay
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Shop Instagram & WhatsApp Safely
            <br />
            Your money, protected until delivery
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/seller"
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              I'm a Seller
            </Link>
            <Link
              href="/track/demo"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Shield className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Escrow Protection</h3>
            <p className="text-gray-600">
              Money held safely until you confirm delivery. Zero scam risk.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <Smartphone className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No App Needed</h3>
            <p className="text-gray-600">
              Works via web browser. Share payment links on WhatsApp/Instagram.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <Zap className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
            <p className="text-gray-600">
              Sellers get paid within 24 hours of delivery confirmation.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Create Link</h4>
              <p className="text-sm text-gray-600">
                Seller creates payment link in 30 seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">Buyer Pays</h4>
              <p className="text-sm text-gray-600">
                Money held in escrow via M-Pesa
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Seller Ships</h4>
              <p className="text-sm text-gray-600">Item shipped to buyer</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold mb-2">Confirm & Release</h4>
              <p className="text-sm text-gray-600">
                Buyer confirms, funds released
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 9. `frontend/app/seller/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import { createPaymentLink } from '@/lib/api';
import QRCode from 'qrcode';

export default function SellerDashboard() {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [orderId, setOrderId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    seller_phone: '',
    seller_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPaymentLink({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        seller_phone: formData.seller_phone,
        seller_name: formData.seller_name,
      });

      setPaymentLink(result.payment_link);
      setOrderId(result.order_id);

      // Generate QR code
      const qr = await QRCode.toDataURL(result.payment_link);
      setQrCode(qr);
    } catch (error) {
      alert('Error creating payment link');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = `Hi! I'm selling ${formData.name} for KES ${formData.price}. Pay safely using Soko Pay: ${paymentLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          🛡️ Soko Pay Seller Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create a secure payment link for your product
        </p>

        {!paymentLink ? (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Nike Air Max"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="4500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  rows={3}
                  placeholder="Brand new shoes, size 42..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.seller_name}
                  onChange={(e) =>
                    setFormData({ ...formData, seller_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Brian Kipchoge"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your M-Pesa Number *
                </label>
                <input
                  type="tel"
                  required
                  pattern="254[0-9]{9}"
                  value={formData.seller_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, seller_phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="254712345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 254XXXXXXXXX (12 digits)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating Link...' : 'Generate Payment Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Link Created!</h2>
              <p className="text-gray-600">Order ID: {orderId}</p>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center mb-6">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            {/* Payment Link */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Your Payment Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <button
                onClick={shareOnWhatsApp}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share on WhatsApp
              </button>

              <a
                href={`/track/${orderId}`}
                className="block w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-center"
              >
                Track This Order
              </a>

              <button
                onClick={() => {
                  setPaymentLink('');
                  setOrderId('');
                  setQrCode('');
                  setFormData({
                    name: '',
                    price: '',
                    description: '',
                    seller_phone: formData.seller_phone,
                    seller_name: formData.seller_name,
                  });
                }}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Create Another Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 10. `frontend/app/buy/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { trackOrder, payForOrder } from '@/lib/api';
import type { Order } from '@/lib/api';

export default function BuyPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await trackOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!buyerPhone || !buyerName) {
      alert('Please enter your phone number and name');
      return;
    }

    setPaying(true);
    setError('');

    try {
      await payForOrder(orderId, buyerPhone, buyerName);
      alert('Check your phone for M-Pesa prompt!');
      // Redirect to tracking page
      window.location.href = `/track/${orderId}`;
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  if (order.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl mb-4">This order has already been paid for.</p>
          <a
            href={`/track/${orderId}`}
            className="text-blue-600 hover:underline font-semibold"
          >
            Track Order →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🛡️ Soko Pay</h1>
          <p className="text-gray-600">Secure Payment</p>
        </div>

        {/* Product Card */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-2">{order.product_name}</h2>
          <p className="text-4xl font-bold text-green-600 mb-4">
            KES {order.product_price.toLocaleString()}
          </p>
          <p className="text-gray-600 mb-4">{order.product_description}</p>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Seller: <span className="font-semibold">{order.seller_name}</span>
            </p>
          </div>
        </div>

        {/* Escrow Protection */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Your Money is Protected
              </h3>
              <p className="text-sm text-green-800">
                Funds held safely until you confirm delivery. Zero scam risk.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="font-bold text-lg mb-4">Enter Your Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Mercy Wanjiru"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                M-Pesa Number *
              </label>
              <input
                type="tel"
                required
                pattern="254[0-9]{9}"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="254712345678"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll receive an STK push to this number
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={paying || !buyerPhone || !buyerName}
            className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? 'Processing...' : `Pay KES ${order.product_price.toLocaleString()} with M-Pesa`}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Powered by PayHero
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">How Soko Pay Works</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <p>You pay → Money held safely in escrow</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <p>Seller ships your item</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <p>You confirm delivery</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <p>Seller gets paid automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 11. `frontend/app/track/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { trackOrder, markAsShipped, confirmDelivery } from '@/lib/api';
import type { Order } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import ConfettiEffect from '@/components/ConfettiEffect';

export default function TrackPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadOrder();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await trackOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkShipped = async () => {
    if (!confirm('Mark this order as shipped?')) return;

    try {
      await markAsShipped(orderId);
      await loadOrder();
      alert('Order marked as shipped!');
    } catch (err) {
      alert('Failed to mark as shipped');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirm('Confirm you received this item? Funds will be released to the seller.')) return;

    try {
      await confirmDelivery(orderId);
      setShowConfetti(true);
      await loadOrder();
      alert('Delivery confirmed! Funds released to seller.');
    } catch (err) {
      alert('Failed to confirm delivery');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order Tracking</h1>
              <p className="text-gray-600">Order ID: {orderId}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-bold mb-1">{order.product_name}</h2>
            <p className="text-2xl font-bold text-green-600">
              KES {order.product_price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="font-bold text-lg mb-4">Order Progress</h3>
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="font-bold text-lg mb-4">Actions</h3>

          {order.status === 'paid' && (
            <button
              onClick={handleMarkShipped}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              📦 Mark as Shipped (Seller Only)
            </button>
          )}

          {order.status === 'shipped' && (
            <div className="space-y-3">
              <button
                onClick={handleConfirmDelivery}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                ✅ Confirm Delivery (Buyer Only)
              </button>
              <p className="text-sm text-gray-600 text-center">
                ⚠️ Only confirm after receiving your item!
              </p>
            </div>
          )}

          {order.status === 'completed' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Order Completed!
              </h3>
              <p className="text-gray-600">Funds have been released to the seller.</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-4">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-semibold">{order.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">KES {order.product_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seller:</span>
              <span className="font-semibold">{order.seller_name}</span>
            </div>
            {order.buyer_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Buyer:</span>
                <span className="font-semibold">{order.buyer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-semibold">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist

### Minute 30
- [ ] Next.js project created
- [ ] Dependencies installed
- [ ] API client library complete
- [ ] Reusable components created

### Minute 60
- [ ] Seller dashboard works
- [ ] Can create payment links
- [ ] QR code generated
- [ ] WhatsApp share works

### Minute 90
- [ ] Buyer payment page complete
- [ ] Order tracking page complete
- [ ] All UI components polished
- [ ] Tested on mobile device

### Minute 120
- [ ] Deployed to Vercel
- [ ] Connected to production backend
- [ ] All flows tested end-to-end
- [ ] Demo ready!

---

## 🚀 Deployment

```bash
# Install Vercel CLI (already done)
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Follow prompts, set environment variables when asked
```

Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## 🧪 Testing

```bash
# Start dev server
npm run dev

# Test flows:
1. Create payment link at /seller
2. Open generated link in new tab
3. Pay (use test M-Pesa number)
4. Track order
5. Mark as shipped
6. Confirm delivery
```

---

## 🆘 Common Issues

**Problem: API calls fail (CORS)**
```typescript
// Make sure backend has CORS enabled
// Dev 1 should have added this to main.py
```

**Problem: Confetti doesn't show**
```bash
npm install canvas-confetti
npm install @types/canvas-confetti --save-dev
```

**Problem: Deployment fails**
```bash
# Check Next.js build succeeds locally
npm run build

# Fix any TypeScript errors
npm run lint
```

---

**You got this! Make it beautiful! 🎨**
