# Soko Pay Frontend

Next.js 14 frontend for Soko Pay - AI-powered escrow platform for social commerce.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── seller/            # Seller dashboard
│   │   └── page.tsx
│   ├── buy/[id]/          # Buyer payment page
│   │   └── page.tsx
│   └── track/[id]/        # Order tracking
│       └── page.tsx
├── components/            # Reusable components
│   ├── StatusBadge.tsx
│   ├── OrderTimeline.tsx
│   └── ConfettiEffect.tsx
├── lib/                   # Utilities
│   └── api.ts            # API client
└── public/               # Static assets
```

## 🎯 Features

- ✅ Seller Dashboard (create payment links)
- ✅ QR Code generation
- ✅ WhatsApp sharing integration
- ✅ Buyer payment page with M-Pesa
- ✅ Order tracking with timeline
- ✅ Real-time status updates
- ✅ AI risk score display
- ✅ Confetti celebration on completion
- ✅ Fully responsive design

## 🔗 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/seller` | Create payment links |
| `/buy/[id]` | Payment page for buyers |
| `/track/[id]` | Track order status |

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **QR Codes**: qrcode
- **Animations**: canvas-confetti

## 🔌 API Integration

Backend API URL is configured in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL.

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

## 🎨 Components

### StatusBadge
Displays order status with color coding:
- Pending (gray)
- Paid (blue)
- Shipped (orange)
- Delivered (green)
- Completed (dark green)
- Disputed (red)

### OrderTimeline
Visual progress tracker showing:
1. Payment Link Created
2. Payment Received (Escrow)
3. Item Shipped
4. Delivery Confirmed
5. Funds Released

### ConfettiEffect
Celebration animation when order is completed.

## 🧪 Testing

1. **Create Payment Link**: Go to `/seller`, fill form
2. **Copy Link**: Use the generated link
3. **Make Payment**: Open link in new tab, enter phone
4. **Track Order**: View progress at `/track/[id]`
5. **Complete Flow**: Mark shipped → Confirm delivery

## 🆘 Troubleshooting

**API calls fail?**
- Check backend is running at http://localhost:8000
- Verify NEXT_PUBLIC_API_URL in .env.local

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**Build errors?**
```bash
# Clear cache
rm -rf .next
npm run build
```

## 📝 License

MIT License - See LICENSE file

---

Built with ❤️ for Valentine's Hackathon 2026
