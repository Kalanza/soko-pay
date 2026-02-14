'use client';

import { useState } from 'react';
import { Copy, Share2, CheckCircle, ArrowLeft } from 'lucide-react';
import { createPaymentLink } from '@/lib/api';
import QRCode from 'qrcode';
import Link from 'next/link';

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

      setOrderId(result.order_id);
      setPaymentLink(result.payment_link);

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
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Create a secure payment link for your product</p>
        </div>

        {!paymentLink ? (
          /* Create Payment Link Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Product Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., iPhone 14 Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 85000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="254712345678"
                  value={formData.seller_phone}
                  onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
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
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Payment Link'}
              </button>
            </form>
          </div>
        ) : (
          /* Payment Link Created */
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-green-900">Payment Link Created!</h2>
              </div>
              
              <p className="text-gray-700 mb-4">
                Share this link with your buyer. They can pay safely, and funds will be held in escrow until delivery is confirmed.
              </p>

              {/* Payment Link */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Payment Link:</p>
                <p className="text-sm font-mono text-gray-800 break-all">{paymentLink}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>

                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </button>
              </div>

              {/* Track Order Button */}
              <Link
                href={`/track/${orderId}`}
                className="mt-4 block w-full text-center bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                Track This Order
              </Link>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                <img src={qrCode} alt="Payment QR Code" className="mx-auto w-64 h-64" />
                <p className="text-sm text-gray-600 mt-4">
                  Buyers can scan this QR code to pay
                </p>
              </div>
            )}

            {/* Create Another */}
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
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Create Another Payment Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
