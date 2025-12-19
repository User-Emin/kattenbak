'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ROOT PAGE - Check auth and redirect
 */
export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  );
}
