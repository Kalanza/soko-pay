import Link from 'next/link';
import { Shield, Smartphone, Zap, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            🛡️ Soko Pay
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Shop Instagram & WhatsApp Safely
          </p>
          <p className="text-lg text-gray-600">
            Your money, protected until delivery
          </p>
        </header>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stop Getting Scammed
              </h2>
              <p className="text-gray-700 mb-6">
                In Kenya, <strong>70% of online shopping</strong> happens on Instagram, WhatsApp, and Facebook Marketplace. 
                But there's <strong>ZERO buyer protection</strong>. Customers send M-Pesa first and pray.
              </p>
              <p className="text-gray-700 mb-6">
                <strong className="text-red-600">KES 50,000+ lost DAILY</strong> to scams in Nairobi alone.
              </p>
              <p className="text-gray-700 mb-8">
                Soko Pay changes that with <strong>AI-powered escrow protection</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/seller"
                  className="inline-block bg-blue-600 text-white text-center py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  I'm a Seller
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-block bg-green-600 text-white text-center py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  I'm a Buyer
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Soko Pay?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Escrow Protection</strong>
                    <p className="text-sm text-gray-600">Money held until delivery confirmed</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Zap className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">AI Fraud Detection</strong>
                    <p className="text-sm text-gray-600">Gemini AI scans for scam patterns</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Smartphone className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">No App Required</strong>
                    <p className="text-sm text-gray-600">Works via web + SMS</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Instant Payouts</strong>
                    <p className="text-sm text-gray-600">Sellers paid within 24 hours</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Sellers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">For Sellers 🏪</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                  <div>
                    <strong className="text-gray-900">Create Payment Link</strong>
                    <p className="text-sm text-gray-600">Add product details, get instant link</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                  <div>
                    <strong className="text-gray-900">Share on WhatsApp/Instagram</strong>
                    <p className="text-sm text-gray-600">Buyer pays via M-Pesa STK push</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                  <div>
                    <strong className="text-gray-900">Ship the Product</strong>
                    <p className="text-sm text-gray-600">Mark as shipped in dashboard</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">4</span>
                  <div>
                    <strong className="text-gray-900">Get Paid</strong>
                    <p className="text-sm text-gray-600">Funds released after delivery confirmation</p>
                  </div>
                </li>
              </ol>
              <Link
                href="/seller"
                className="mt-6 block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Payment Link
              </Link>
            </div>

            {/* For Buyers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-green-600 mb-4">For Buyers 🛍️</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                  <div>
                    <strong className="text-gray-900">Click Payment Link</strong>
                    <p className="text-sm text-gray-600">Sent by seller on WhatsApp/Instagram</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                  <div>
                    <strong className="text-gray-900">Pay with M-Pesa</strong>
                    <p className="text-sm text-gray-600">Funds held safely in escrow</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                  <div>
                    <strong className="text-gray-900">Receive Product</strong>
                    <p className="text-sm text-gray-600">Track delivery status in real-time</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">4</span>
                  <div>
                    <strong className="text-gray-900">Confirm Delivery</strong>
                    <p className="text-sm text-gray-600">Funds released to seller. Or raise dispute if issue!</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">By The Numbers</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">70%</p>
              <p className="text-blue-100">Of online shopping in Kenya happens on social media</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">KES 50K+</p>
              <p className="text-blue-100">Lost daily to scams in Nairobi alone</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">3%</p>
              <p className="text-blue-100">Transaction fee (industry standard)</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Shop Safely?</h2>
          <p className="text-gray-700 mb-6">
            Join thousands of Kenyans protecting their money with Soko Pay
          </p>
          <Link
            href="/seller"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Get Started Now
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="mb-2">Built with ❤️ in Kenya | Valentine's Hackathon 2026</p>
          <p className="text-sm">
            <a href="mailto:founders@sokopay.co.ke" className="text-blue-600 hover:underline">founders@sokopay.co.ke</a>
            {' | '}
            <a href="https://wa.me/254712345678" className="text-blue-600 hover:underline">WhatsApp Support</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
