'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">Soko Pay</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <Link href="/seller" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sell
          </Link>
          <Link
            href="/seller"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Create Payment Link
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-3">
          <a
            href="/#how-it-works"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            How It Works
          </a>
          <Link
            href="/seller"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sell
          </Link>
          <Link
            href="/seller"
            onClick={() => setOpen(false)}
            className="block rounded-lg bg-primary px-5 py-2 text-center text-sm font-semibold text-primary-foreground"
          >
            Create Payment Link
          </Link>
        </div>
      )}
    </nav>
  );
}
