/**
 * HOME PAGE - Redirect to login (basePath /admin is automatically added)
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}
