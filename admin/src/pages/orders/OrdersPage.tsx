import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const STATUS_TABS = ['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-pink-100 text-pink-700',
};

export default function OrdersPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(['admin-orders', status, page], async () => {
    const { data } = await api.get('/admin/orders', {
      params: { status: status === 'all' ? undefined : status, page, limit: 20 },
    });
    return data;
  }, { keepPreviousData: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              status === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : !data?.orders?.length ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : data.orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-primary-600">{o.orderNumber}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{o.user?.name}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{o.items?.length} item(s)</td>
                  <td className="px-5 py-3 font-semibold">₹{o.pricing?.total?.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${o.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.payment?.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${STATUS_COLORS[o.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {o.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/orders/${o._id}`} className="text-primary-600 hover:underline text-sm font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.pages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t text-sm">
            <p className="text-gray-500">{data.total} total orders</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-outline py-1.5 disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-gray-600">Page {page} of {data.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === data.pages} className="btn-outline py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
