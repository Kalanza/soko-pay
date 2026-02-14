'use client';

import { MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppShareProps {
  paymentLink: string;
  productName: string;
  price: number;
  variant?: 'button' | 'fab';
}

export default function WhatsAppShare({ 
  paymentLink, 
  productName, 
  price,
  variant = 'button' 
}: WhatsAppShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🛍️ *${productName}*\n\n💰 Price: KES ${price.toLocaleString()}\n\n✅ Secure payment via Soko Pay Escrow\n🔒 Your money is protected until delivery\n\n👉 Pay here: ${paymentLink}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'fab') {
    return (
      <button
        onClick={handleWhatsAppShare}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#25D366] text-white shadow-bento-hover hover:scale-110 transition-transform duration-200 flex items-center justify-center z-50 group"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-7 w-7 group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      {/* WhatsApp Share */}
      <button
        onClick={handleWhatsAppShare}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20BA5A] transition-colors shadow-bento"
      >
        <MessageCircle className="h-5 w-5" />
        Share on WhatsApp
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="px-6 py-3 rounded-xl border-2 border-border bg-card hover:bg-muted font-semibold transition-colors shadow-bento flex items-center gap-2"
      >
        {copied ? (
          <>
            <span className="text-primary-600">✓</span>
            <span className="text-primary-600">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
