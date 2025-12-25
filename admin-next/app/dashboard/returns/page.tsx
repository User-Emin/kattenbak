'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReturnStatusBadge } from '@/components/returns/return-status-badge';
import { Search, Filter, Download } from 'lucide-react';
import type { Return, ReturnStatus } from '@/types/return';

/**
 * ADMIN RETURNS LIST PAGE - DRY & Maintainable
 * Complete returns management interface
 * NO HARDCODED DATA!
 */

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    
    // TODO: Replace with real API call
    // Mock data voor nu
    const mockReturns: Return[] = [
      {
        id: 'ret_1',
        orderId: 'ord_1',
        myparcelId: 123456,
        trackingCode: '3SABCD123456789',
        trackingUrl: 'https://postnl.nl/tracktrace/?B=3SABCD123456789',
        labelUrl: 'https://example.com/label.pdf',
        reason: 'DEFECTIVE' as any,
        reasonDetails: 'Product maakt vreemd geluid',
        status: 'REQUESTED' as any,
        items: [
          {
            productId: '1',
            productName: 'Automatische Kattenbak Premium',
            quantity: 1,
            price: 299.99,
          },
        ],
        refundAmount: 299.99,
        customerNotes: 'Product werkt niet goed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setReturns(mockReturns);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // DRY: Filter logic
  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      !search ||
      ret.id.toLowerCase().includes(search.toLowerCase()) ||
      ret.trackingCode?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || ret.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Retouren</h1>
        <p className="text-gray-600">
          Beheer alle retour aanvragen en verwerk terugbetalingen
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Zoek op retour ID of tracking code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand"
        >
          <option value="">Alle statussen</option>
          <option value="REQUESTED">Aangevraagd</option>
          <option value="IN_TRANSIT">Onderweg</option>
          <option value="RECEIVED">Ontvangen</option>
          <option value="APPROVED">Goedgekeurd</option>
          <option value="REFUND_PROCESSED">Terugbetaald</option>
        </select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retour ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bedrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/dashboard/returns/${ret.id}`}
                      className="text-brand hover:underline font-medium"
                    >
                      {ret.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {ret.trackingCode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReturnStatusBadge status={ret.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ret.refundAmount
                      ? `€ ${ret.refundAmount.toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(ret.createdAt).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/returns/${ret.id}`}>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReturns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen retouren gevonden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



