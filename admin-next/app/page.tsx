/**
 * HOME PAGE - Redirect to dashboard or login
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
