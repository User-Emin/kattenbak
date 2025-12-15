/**
 * DASHBOARD LAYOUT - DRY Protected Layout
 */

import { ProtectedRoute } from '@/components/protected-route';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

