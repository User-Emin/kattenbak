import { redirect } from 'next/navigation';

/**
 * ROOT PAGE - Redirect to dashboard
 */
export default function RootPage() {
  redirect('/dashboard');
}
