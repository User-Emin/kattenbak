/**
 * HOME PAGE - Redirect to login (since we're at /admin, redirect to /admin/login)
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/admin/login');
}
