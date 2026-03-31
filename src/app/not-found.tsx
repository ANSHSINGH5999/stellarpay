/**
 * not-found.tsx — Custom 404 page
 */

import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
      <Zap className="w-16 h-16 text-brand-400/30" />
      <div>
        <h1 className="text-6xl font-black text-slate-700">404</h1>
        <p className="text-slate-400 mt-2">This page doesn't exist on the network.</p>
      </div>
      <Link href="/" className="btn-primary">
        ← Back to Home
      </Link>
    </div>
  );
}
