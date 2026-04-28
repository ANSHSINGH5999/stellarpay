/**
 * not-found.tsx — Custom 404 page
 */

import Link from 'next/link';
import { Zap, LayoutDashboard, Send, Clock, Gauge, Lock } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
      <div className="relative">
        <Zap className="w-16 h-16 text-brand-400/20" />
        <span className="absolute -top-2 -right-3 text-3xl font-black text-slate-700">?</span>
      </div>
      <div>
        <h1 className="text-6xl font-black text-slate-700">404</h1>
        <p className="text-slate-400 mt-2 text-lg">Page not found on the Stellar network.</p>
        <p className="text-slate-600 text-sm mt-1">The address you entered doesn&apos;t exist in this app.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary flex items-center gap-2">
          <Zap className="w-4 h-4" /> Home
        </Link>
        <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/send" className="btn-secondary flex items-center gap-2">
          <Send className="w-4 h-4" /> Send
        </Link>
        <Link href="/history" className="btn-secondary flex items-center gap-2">
          <Clock className="w-4 h-4" /> History
        </Link>
        <Link href="/escrow" className="btn-secondary flex items-center gap-2">
          <Lock className="w-4 h-4" /> Escrow
        </Link>
        <Link href="/ops" className="btn-secondary flex items-center gap-2">
          <Gauge className="w-4 h-4" /> Ops
        </Link>
      </div>
    </div>
  );
}
