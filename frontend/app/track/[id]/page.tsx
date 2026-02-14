'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Loader2,
  Truck,
  PackageCheck,
  MessageSquareWarning,
  X,
} from 'lucide-react';
import { trackOrder, markAsShipped, confirmDelivery, raiseDispute } from '@/lib/api';
import type { Order } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import ConfettiEffect from '@/components/ConfettiEffect';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

/* ─── Dispute Modal ───────────────────────────────────────────────── */
function DisputeModal({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await raiseDispute(orderId, reason, evidence || undefined);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to raise dispute';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <MessageSquareWarning className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-bold text-card-foreground">Raise a Dispute</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Describe the issue with your order. Our team will review it within 48
          hours.
        </p>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">
              What went wrong? *
            </label>
            <textarea
              required
              minLength={10}
              rows={3}
              className={inputClass}
              placeholder="e.g., I received a different item than what was shown..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">
              Evidence (optional)
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Link to photos, screenshots, etc."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function TrackPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const data = await trackOrder(orderId);

      // Show confetti when order transitions to completed
      if (data.status === 'completed' && order?.status !== 'completed') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  const handleMarkShipped = async () => {
    if (!confirm('Mark this order as shipped?')) return;
    setActionLoading(true);
    try {
      await markAsShipped(orderId);
      await loadOrder();
    } catch {
      alert('Failed to mark as shipped');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirm('Confirm you received this item? Funds will be released to the seller.')) return;
    setActionLoading(true);
    try {
      await confirmDelivery(orderId);
      await loadOrder();
    } catch {
      alert('Failed to confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const copyPaymentLink = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.payment_link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  /* ─── Loading ───── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Not found ───── */
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Order Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main view ───── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {showConfetti && <ConfettiEffect />}
      {showDispute && (
        <DisputeModal
          orderId={orderId}
          onClose={() => setShowDispute(false)}
          onSuccess={() => {
            setShowDispute(false);
            loadOrder();
          }}
        />
      )}

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Back link + header */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Track Order
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Order ID: {order.id}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Two-column grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left column (3/5) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Product details */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Product Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="text-lg font-semibold text-card-foreground">
                      {order.product_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-primary">
                      KES {order.product_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {order.product_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Parties
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {order.seller_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.seller_phone}</p>
                  </div>
                  {order.buyer_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Buyer</p>
                      <p className="text-sm font-medium text-card-foreground">
                        {order.buyer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.buyer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Timeline
                </h2>
                <div className="space-y-2 text-sm">
                  <Row label="Created" value={order.created_at} />
                  {order.paid_at && <Row label="Paid" value={order.paid_at} />}
                  {order.shipped_at && <Row label="Shipped" value={order.shipped_at} />}
                  {order.delivered_at && <Row label="Delivered" value={order.delivered_at} />}
                </div>
              </div>
            </div>

            {/* Right column (2/5) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Order Progress
                </h2>
                <OrderTimeline currentStatus={order.status} />
              </div>

              {/* Actions */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Actions
                </h2>

                <div className="space-y-3">
                  {/* Seller: Mark as Shipped */}
                  {order.status === 'paid' && (
                    <button
                      onClick={handleMarkShipped}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      Mark as Shipped
                    </button>
                  )}

                  {/* Buyer: Confirm Delivery */}
                  {order.status === 'shipped' && (
                    <>
                      <button
                        onClick={handleConfirmDelivery}
                        disabled={actionLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <PackageCheck className="h-4 w-4" />
                        )}
                        Confirm Delivery
                      </button>
                      <button
                        onClick={() => setShowDispute(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <MessageSquareWarning className="h-4 w-4" /> Raise Dispute
                      </button>
                    </>
                  )}

                  {/* Dispute button for paid status too */}
                  {order.status === 'paid' && (
                    <button
                      onClick={() => setShowDispute(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <MessageSquareWarning className="h-4 w-4" /> Raise Dispute
                    </button>
                  )}

                  {/* Completed */}
                  {order.status === 'completed' && (
                    <div className="rounded-md border-2 border-primary bg-primary/5 p-4 text-center">
                      <p className="text-sm font-semibold text-primary">
                        Order Completed
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Funds have been released to the seller
                      </p>
                    </div>
                  )}

                  {/* Disputed */}
                  {order.status === 'disputed' && (
                    <div className="rounded-md border-2 border-destructive bg-destructive/5 p-4 text-center">
                      <p className="text-sm font-semibold text-destructive">
                        Dispute In Progress
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Our support team will contact you within 48 hours
                      </p>
                    </div>
                  )}

                  {/* Share payment link */}
                  {order.status === 'pending' && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Share payment link with buyer:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={order.payment_link}
                          className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs text-foreground"
                        />
                        <button
                          onClick={copyPaymentLink}
                          className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {linkCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help */}
              <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Need Help?
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Contact our support team for assistance with this order.
                </p>
                <a
                  href="https://wa.me/254712345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Tiny helper ─────────────────────────────────────────────────── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">
        {new Date(value).toLocaleString()}
      </span>
    </div>
  );
}
