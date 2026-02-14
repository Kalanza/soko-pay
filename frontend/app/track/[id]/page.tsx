'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { trackOrder, markAsShipped, confirmDelivery } from '@/lib/api';
import type { Order } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import ConfettiEffect from '@/components/ConfettiEffect';
import Link from 'next/link';

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
      
      // Show confetti when order is completed
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
      await loadOrder();
      setShowConfetti(true);
      alert('Delivery confirmed! Funds released to seller.');
    } catch (err) {
      alert('Failed to confirm delivery');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-600 mt-2">Order ID: {order.id}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Product Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="text-lg font-semibold text-gray-900">{order.product_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-2xl font-bold text-green-600">KES {order.product_price.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-800">{order.product_description}</p>
                </div>
              </div>
            </div>

            {/* Parties Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Parties</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-medium text-gray-900">{order.seller_name}</p>
                  <p className="text-sm text-gray-500">{order.seller_phone}</p>
                </div>

                {order.buyer_name && (
                  <div>
                    <p className="text-sm text-gray-600">Buyer</p>
                    <p className="font-medium text-gray-900">{order.buyer_name}</p>
                    <p className="text-sm text-gray-500">{order.buyer_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Timeline</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                
                {order.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium">{new Date(order.paid_at).toLocaleString()}</span>
                  </div>
                )}
                
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipped:</span>
                    <span className="font-medium">{new Date(order.shipped_at).toLocaleString()}</span>
                  </div>
                )}
                
                {order.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered:</span>
                    <span className="font-medium">{new Date(order.delivered_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Actions */}
          <div className="space-y-6">
            {/* Progress Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Progress</h2>
              <OrderTimeline currentStatus={order.status} />
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              
              <div className="space-y-3">
                {/* Seller: Mark as Shipped */}
                {order.status === 'paid' && (
                  <button
                    onClick={handleMarkShipped}
                    className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}

                {/* Buyer: Confirm Delivery */}
                {order.status === 'shipped' && (
                  <button
                    onClick={handleConfirmDelivery}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Confirm Delivery
                  </button>
                )}

                {/* Completed */}
                {order.status === 'completed' && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                    <p className="text-green-900 font-semibold">✓ Order Completed!</p>
                    <p className="text-sm text-green-700 mt-1">Funds have been released to seller</p>
                  </div>
                )}

                {/* Disputed */}
                {order.status === 'disputed' && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
                    <p className="text-red-900 font-semibold">⚠ Dispute In Progress</p>
                    <p className="text-sm text-red-700 mt-1">Support team will contact you soon</p>
                  </div>
                )}

                {/* Share Payment Link */}
                {order.status === 'pending' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Share payment link:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={order.payment_link}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.payment_link);
                          alert('Link copied!');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                If you have any issues with this order, contact our support team.
              </p>
              <a
                href="https://wa.me/254712345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
