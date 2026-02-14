'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  Loader2,
  Smartphone,
  Lock,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { trackOrder, payForOrder } from '@/lib/api';
import type { Order } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TrustScore from '@/components/TrustScore';

/* ─── Page ─────────────────────────────────────────────────────────── */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await trackOrder(orderId);
      setOrder(data);
    } catch {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setError('');

    try {
      await payForOrder(orderId, buyerPhone, buyerName);
      alert('Payment initiated! Check your phone for the M-Pesa prompt.');
      window.location.href = `/track/${orderId}`;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
    } finally {
      setPaying(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow';

  /* ─── Loading ───── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Not found ───── */
  if (error && !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Order Not Found</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  /* ─── Already paid ───── */
  if (order.status !== 'pending') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-1">Payment Already Processed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This payment link has already been used.
            </p>
            <Link
              href={`/track/${orderId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main buy view ───── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-md">
          {/* Trust banner */}
          <div className="flex items-start gap-3 rounded-lg border-2 border-primary/30 bg-primary/5 p-4 mb-6">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Protected by Soko Pay
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your money is held safely in escrow until you confirm delivery.
              </p>
            </div>
          </div>

          {/* Product card */}
          <div className="bento-card p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                {order.product_category && order.product_category !== 'Other' && (
                  <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600 mb-2">
                    {order.product_category}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-card-foreground">
                  {order.product_name}
                </h1>
              </div>
            </div>

            <p className="text-4xl font-bold text-primary-600 mb-6">
              KES {order.product_price.toLocaleString()}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {order.product_description}
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span className="font-semibold text-card-foreground">Seller:</span>
              {order.seller_name}
            </div>

            {/* Trust Score Widget */}
            {order.fraud_risk_score !== null && order.fraud_risk_score !== undefined && (
              <TrustScore 
                score={order.fraud_risk_score} 
                level={order.fraud_risk_level} 
                size="md"
                showLabel={true}
              />
            )}
          </div>

          {/* Payment form */}
          <div className="bento-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-primary-50">
                <Smartphone className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-card-foreground">
                Pay with M-Pesa
              </h2>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">
                  Your M-Pesa Number
                </label>
                <input
                  type="tel"
                  required
                  pattern="^254[0-9]{9}$"
                  className={inputClass}
                  placeholder="254712345678"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Format: 254XXXXXXXXX</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className={inputClass}
                  placeholder="Mercy Wanjiru"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay KES{' '}
                    {order.product_price.toLocaleString()}
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              You will receive an M-Pesa STK push on your phone. Funds are held
              in escrow until delivery.
            </p>
          </div>

          {/* Mini explainer */}
          <div className="mt-6 rounded-lg border border-border bg-muted p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              How Escrow Protects You
            </h3>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                Pay with M-Pesa &mdash; money held in escrow
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                Seller ships your item
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                Confirm delivery to release funds
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">4</span>
                Issue? Raise a dispute for full protection
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
