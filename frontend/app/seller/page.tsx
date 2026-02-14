'use client';

import { useState } from 'react';
import {
  Copy,
  Share2,
  CheckCircle,
  ArrowLeft,
  Link as LinkIcon,
  Package,
  User,
  Loader2,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { createPaymentLink } from '@/lib/api';
import QRCode from 'qrcode';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WhatsAppShare from '@/components/WhatsAppShare';

/* ─── Category Select ─────────────────────────────────────────────── */
const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Shoes',
  'Beauty',
  'Home',
  'Phones',
  'Accessories',
  'Other',
];

/* ─── Form Field ──────────────────────────────────────────────────── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function SellerDashboard() {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [orderId, setOrderId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    seller_phone: '',
    seller_name: '',
    category: 'Other',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createPaymentLink({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        seller_phone: formData.seller_phone,
        seller_name: formData.seller_name,
        category: formData.category,
      });

      setOrderId(result.order_id);
      setPaymentLink(result.payment_link);

      const qr = await QRCode.toDataURL(result.payment_link, {
        width: 280,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setQrCode(qr);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating payment link';
      setError(message);
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
    const message = `Hi! I'm selling ${formData.name} for KES ${Number(formData.price).toLocaleString()}. Pay safely using Soko Pay:\n${paymentLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const inputClass =
    'w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-primary-200';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-xl">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Create Payment Link
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              🔒 Fill in your product details and share the secure escrow link with your buyer.
            </p>
          </div>

          {/* ── Form ─────────────────────────────────────────── */}
          {!paymentLink ? (
            <div className="bento-card p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6 text-sm">
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Package className="h-4 w-4" /> Product Info
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4" /> Your Details
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <LinkIcon className="h-4 w-4" /> Get Link
                </span>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Product Name">
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    className={inputClass}
                    placeholder="e.g., Nike Air Max 90"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (KES)">
                    <input
                      type="number"
                      required
                      min="1"
                      className={inputClass}
                      placeholder="4,500"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Category">
                    <select
                      className={inputClass}
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    required
                    rows={3}
                    maxLength={1000}
                    className={inputClass}
                    placeholder="Describe your product (condition, size, colour, etc.)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Field>

                <div className="border-t border-border pt-5 space-y-5">
                  <Field label="Your M-Pesa Number" hint="Format: 254XXXXXXXXX">
                    <input
                      type="tel"
                      required
                      pattern="^254[0-9]{9}$"
                      className={inputClass}
                      placeholder="254712345678"
                      value={formData.seller_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, seller_phone: e.target.value })
                      }
                    />
                  </Field>

                  <Field label="Your Name">
                    <input
                      type="text"
                      required
                      minLength={2}
                      className={inputClass}
                      placeholder="Brian Kipchoge"
                      value={formData.seller_name}
                      onChange={(e) =>
                        setFormData({ ...formData, seller_name: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-green py-4 text-base font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-bento hover:shadow-bento-hover"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Creating Link...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5" />
                      Create Secure Payment Link
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ── Success State ─────────────────────────────── */
            <div className="space-y-6">
              {/* Success card */}
              <div className="bento-card bg-gradient-to-br from-primary-50 to-white border-2 border-primary/30 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Payment Link Created!
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  🎉 Share this link with your buyer. Funds will be held in secure escrow until delivery is confirmed.
                </p>

                {/* Link display */}
                <div className="glass rounded-xl p-4 mb-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wide">Your Payment Link</p>
                  <p className="text-sm font-mono text-foreground break-all bg-white/50 rounded p-2">
                    {paymentLink}
                  </p>
                </div>

                {/* WhatsApp Share Component */}
                <WhatsAppShare
                  paymentLink={paymentLink}
                  productName={formData.name}
                  price={parseFloat(formData.price)}
                  variant="button"
                />

                {/* Track order */}
                <Link
                  href={`/track/${orderId}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border-2 border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted hover:shadow-bento transition-all"
                >
                  <ExternalLink className="h-4 w-4" /> Track This Order
                </Link>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="bento-card p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <QrCode className="h-5 w-5 text-primary-600" />
                    <h3 className="text-base font-bold text-card-foreground">Scan to Pay</h3>
                  </div>
                  <div className="inline-block p-4 bg-white rounded-xl shadow-bento">
                    <img
                      src={qrCode}
                      alt="Payment QR Code"
                      className="w-56 h-56 rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    📱 Buyers can scan this QR code to open the payment page
                  </p>
                </div>
              )}

              {/* Create another */}
              <button
                onClick={() => {
                  setPaymentLink('');
                  setOrderId('');
                  setQrCode('');
                  setError('');
                  setFormData({
                    name: '',
                    price: '',
                    description: '',
                    seller_phone: formData.seller_phone,
                    seller_name: formData.seller_name,
                    category: 'Other',
                  });
                }}
                className="w-full rounded-xl border-2 border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted hover:shadow-bento transition-all"
              >
                + Create Another Payment Link
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
