'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🔒 SECURITY: Log errors server-side only
    if (typeof window === 'undefined') {
      console.error('Admin Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Oeps!</h1>
        <p className="text-muted-foreground">
          Er is een fout opgetreden in het admin panel.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Probeer opnieuw
          </button>
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Terug naar dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

