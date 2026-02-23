'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found - SECURITY_POLICY: Generic error, geen gevoelige data
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-light mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Deze pagina is niet gevonden.</p>
      <Button asChild>
        <Link href="/">Naar homepage</Link>
      </Button>
    </div>
  );
}
