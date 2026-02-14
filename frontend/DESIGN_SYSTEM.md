# 🎨 Soko Pay 2026 Design System

## Color Palette

### Primary Colors (M-Pesa Green - Trust & Money)
```
#10b981 - Primary (M-Pesa Green)
#ecfdf5 - Primary 50 (Lightest)
#d1fae5 - Primary 100
#059669 - Primary 600 (Darker)
```

**Usage:** 
- Primary action buttons (Pay, Release Funds)
- Trust indicators
- Success states
- Low fraud risk badges

### Secondary Colors (Premium Purple)
```
HSL: 262 83% 58%
```

**Usage:**
- Premium features
- Secondary CTAs
- Technology indicators

### Accent Colors
```
#f59e0b - Amber (Warnings, Pending)
#ef4444 - Red (High Risk, Errors)
```

### Neutral Colors
```
Background: HSL 0 0% 99% (Ultra-clean white)
Foreground: HSL 222 47% 11% (Deep charcoal)
Muted: HSL 210 40% 98% (Soft gray)
Border: HSL 214 32% 91% (Subtle borders)
```

---

## Trust Score Color System

| Risk Level | Color | HEX | Usage |
|------------|-------|-----|-------|
| **Low Risk** (0-29) | M-Pesa Green | `#10b981` | Trusted transactions |
| **Medium Risk** (30-69) | Amber | `#f59e0b` | Proceed with caution |
| **High Risk** (70-100) | Red | `#ef4444` | Exercise extreme caution |

---

## Typography

**Font Family:** Inter (var(--font-inter))

**Font Sizes:**
- Headings: 2xl-4xl (bold, tight tracking)
- Body: base-lg (regular, balanced line-height)
- Small text: xs-sm (muted foreground)

---

## Component Styles

### Bento Cards (Modular Dashboard)
```tsx
className="bento-card p-6 hover:shadow-bento-hover"
```

**Features:**
- Rounded corners: 1.5rem (2xl)
- Soft shadows: shadow-bento
- Hover effect: shadow-bento-hover
- Border: border-border/50

### Glassmorphism
```tsx
className="glass rounded-2xl p-6"
```

**Features:**
- Background: rgba(255,255,255,0.7)
- Backdrop blur: 12px
- Subtle border: rgba(255,255,255,0.2)

### Gradients
```tsx
// M-Pesa Green gradient
className="gradient-green"

// Danger gradient
className="gradient-danger"
```

---

## Shadows

| Name | Usage | CSS |
|------|-------|-----|
| `shadow-bento` | Default cards | Soft, barely visible |
| `shadow-bento-hover` | Hover states | Medium elevation |
| `shadow-glass` | Glassmorphism | Larger blur radius |
| `trust-glow` | Trust score widget | Green glow effect |

---

## Spacing & Layout

**Container Max Width:** 1200px  
**Grid Gaps:** 4-6 units (1rem-1.5rem)  
**Card Padding:** 4-6 units  
**Button Padding:** px-6 py-3

---

## Animations

### Pulse (Trust Score)
```tsx
className="animate-pulse-slow"
```

### Float (Hero elements)
```tsx
className="animate-float"
```

### Hover Transitions
```css
transition-all duration-300
```

---

## Accessibility

- **Focus Ring:** 2px solid primary with 2px offset
- **Color Contrast:** WCAG AA compliant (4.5:1 minimum)
- **Touch Targets:** Minimum 44x44px
- **Screen Readers:** Semantic HTML + ARIA labels

---

## Component Usage Examples

### Trust Score Widget
```tsx
import TrustScore from '@/components/TrustScore';

<TrustScore 
  score={25} 
  level="low" 
  size="lg" 
  showLabel={true} 
/>
```

### WhatsApp Share Button
```tsx
import WhatsAppShare from '@/components/WhatsAppShare';

<WhatsAppShare
  paymentLink="https://soko-pay.vercel.app/pay/SP123"
  productName="Nike Air Max"
  price={4500}
  variant="fab" // or "button"
/>
```

### Status Badge
```tsx
import StatusBadge from '@/components/StatusBadge';

<StatusBadge status="paid" />
```

---

## Design Inspiration Sources

1. **Stripe Dashboard** - Clean transaction layouts
2. **Revolut** - Trust indicators and status flows
3. **Apple Pay** - Secure payment UI patterns
4. **Uber Eats** - Delivery tracking timeline
5. **M-Pesa Kenya** - Familiar green branding

---

## 2026 Fintech Trends Applied

✅ **Soft Neomorphism** - Subtle depth without harsh shadows  
✅ **Glassmorphism** - Frosted glass backgrounds for premium feel  
✅ **Bento Box Layouts** - Modular, card-based dashboards  
✅ **Kenyan Context** - M-Pesa green for instant recognition  
✅ **AI Transparency** - Visible fraud detection with Gemini badge  
✅ **WhatsApp-First** - Direct social commerce integration  

---

## Brand Values Expressed Through Design

| Value | Design Expression |
|-------|-------------------|
| **Trust** | M-Pesa green, Shield icons, AI badges |
| **Speed** | Clean layouts, fast animations (300ms) |
| **Transparency** | Visible timeline, fraud scores, fees |
| **Security** | Lock icons, Glassmorphism, Verified badges |
| **Accessibility** | High contrast, generous spacing, large touch targets |

---

**Last Updated:** February 14, 2026  
**Design System Version:** 1.0.0
