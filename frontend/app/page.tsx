import Link from 'next/link';
import {
  Shield,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
  Lock,
  TrendingUp,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

/* ─── Section: Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-card pt-20 pb-24 px-4">
      {/* Subtle gradient accent behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[720px] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
          <Lock className="h-3.5 w-3.5" /> AI-Powered Escrow for Social Commerce
        </span>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Shop Instagram &amp; WhatsApp{' '}
          <span className="text-primary">Safely</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Your money is held in escrow until you confirm delivery. No more
          sending M-Pesa and hoping for the best.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/seller"
            className="flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
          >
            I&apos;m a Seller <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            I&apos;m a Buyer
          </a>
        </div>

        {/* Trust stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div>
            <p className="text-2xl font-bold text-foreground">70%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Shopping on social</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">KES 50K+</p>
            <p className="text-xs text-muted-foreground mt-0.5">Lost daily to scams</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">3%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Transaction fee</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Features ───────────────────────────────────────────── */

const features = [
  {
    icon: Shield,
    title: 'Escrow Protection',
    desc: 'Money held securely until delivery is confirmed by the buyer.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Zap,
    title: 'AI Fraud Detection',
    desc: 'Gemini AI scans every transaction for scam patterns in real-time.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Smartphone,
    title: 'No App Required',
    desc: 'Works entirely via the web and SMS. Share links on WhatsApp or IG.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: TrendingUp,
    title: 'Instant Seller Payouts',
    desc: 'Funds released to your M-Pesa within 24 hours of delivery confirmation.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

function Features() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-balance text-center text-3xl font-bold text-foreground sm:text-4xl">
          Why Soko Pay?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Built for Kenya&apos;s social sellers and buyers. Secure, simple, and
          M-Pesa native.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex rounded-lg ${f.bg} p-2.5`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section: How It Works ───────────────────────────────────────── */

function HowItWorks() {
  const sellerSteps = [
    { n: 1, title: 'Create Payment Link', desc: 'Add product details and get an instant link + QR code.' },
    { n: 2, title: 'Share on WhatsApp / IG', desc: 'Send the link to your buyer in a DM or story.' },
    { n: 3, title: 'Ship the Product', desc: 'Mark as shipped in the tracking dashboard.' },
    { n: 4, title: 'Get Paid', desc: 'Funds released to M-Pesa after buyer confirms delivery.' },
  ];

  const buyerSteps = [
    { n: 1, title: 'Click Payment Link', desc: 'Tap the link the seller shared with you.' },
    { n: 2, title: 'Pay with M-Pesa', desc: 'Funds are held safely in escrow, not sent to the seller.' },
    { n: 3, title: 'Receive Product', desc: 'Track delivery status in real-time.' },
    { n: 4, title: 'Confirm Delivery', desc: 'Funds released to seller. Or raise a dispute if there\'s an issue.' },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-muted">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-balance text-center text-3xl font-bold text-foreground sm:text-4xl">
          How It Works
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Sellers */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-md bg-secondary/10 p-1.5">
                <Users className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">For Sellers</h3>
            </div>
            <ol className="space-y-5">
              {sellerSteps.map((s) => (
                <li key={s.n} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold text-card-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/seller"
              className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-secondary py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
            >
              Create Payment Link <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Buyers */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-md bg-primary/10 p-1.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">For Buyers</h3>
            </div>
            <ol className="space-y-5">
              {buyerSteps.map((s) => (
                <li key={s.n} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold text-card-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: CTA ────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-20 px-4 bg-primary">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to Shop Safely?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
          Join thousands of Kenyans protecting their money with Soko Pay. No app
          download. No signup. Just share a link and get paid.
        </p>
        <Link
          href="/seller"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-8 py-3.5 text-sm font-semibold text-foreground shadow-lg hover:bg-muted transition-colors"
        >
          Get Started Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10 px-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Soko Pay</span>
        </div>
        <p>Built in Kenya &middot; Valentine&apos;s Hackathon 2026</p>
        <div className="flex gap-4">
          <a
            href="mailto:founders@sokopay.co.ke"
            className="hover:text-foreground transition-colors"
          >
            Email
          </a>
          <a
            href="https://wa.me/254712345678"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
