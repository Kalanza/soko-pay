'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { trackOrder, payForOrder } from '@/lib/api';
import type { Order } from '@/lib/api';
import Link from 'next/link';

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
      alert('Payment initiated! Check your phone for M-Pesa prompt.');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Already Processed</h1>
          <p className="text-gray-600 mb-6">This payment link has already been used.</p>
          <Link
            href={`/track/${orderId}`}
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700"
          >
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Trust Badge */}
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Protected by Soko Pay</h3>
              <p className="text-sm text-blue-800">
                Your money is held safely in escrow until you confirm delivery. Shop with confidence!
              </p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{order.product_name}</h1>
          
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-3xl font-bold text-green-600">KES {order.product_price.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-800">{order.product_description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Seller</p>
              <p className="text-gray-800 font-medium">{order.seller_name}</p>
            </div>
          </div>

          {/* AI Risk Score */}
          {order.risk_score !== undefined && (
            <div className={`rounded-lg p-3 mb-4 ${
              order.risk_score < 30 ? 'bg-green-50 border border-green-200' :
              order.risk_score < 70 ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm font-medium mb-1">
                {order.risk_score < 30 ? '✓ Low Risk' :
                 order.risk_score < 70 ? '⚠ Moderate Risk' :
                 '⚠️ High Risk'}
              </p>
              <p className="text-xs text-gray-600">
                AI-powered fraud detection score: {order.risk_score}/100
              </p>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="254712345678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {paying ? 'Processing...' : `Pay KES ${order.product_price.toLocaleString()} with M-Pesa`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            You'll receive an M-Pesa prompt on your phone. Funds will be held in escrow until delivery.
          </p>
        </div>

        {/* How It Works */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Pay with M-Pesa (money held in escrow)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Seller ships your item</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Confirm delivery to release funds to seller</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>If there's an issue, raise a dispute</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
