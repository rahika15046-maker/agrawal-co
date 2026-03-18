import { useQuery } from 'react-query';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../lib/api';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

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

export default function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, revenueByDay = [], ordersByStatus = [], recentOrders = [], lowStockProducts = [] } = data || {};

  const lineData = {
    labels: revenueByDay.map((d: any) => d._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueByDay.map((d: any) => d.revenue),
      borderColor: '#ea580c',
      backgroundColor: 'rgba(234,88,12,0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const doughnutData = {
    labels: ordersByStatus.map((s: any) => s._id),
    datasets: [{
      data: ordersByStatus.map((s: any) => s.count),
      backgroundColor: ['#3b82f6','#8b5cf6','#f59e0b','#f97316','#10b981','#ef4444','#ec4899'],
    }],
  };

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString(), color: 'bg-blue-50 text-blue-700', emoji: '📦' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, color: 'bg-green-50 text-green-700', emoji: '💰' },
    { label: 'Products', value: stats?.totalProducts?.toLocaleString(), color: 'bg-purple-50 text-purple-700', emoji: '🛍️' },
    { label: 'Customers', value: stats?.totalUsers?.toLocaleString(), color: 'bg-orange-50 text-orange-700', emoji: '👥' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ label, value, color, emoji }) => (
          <div key={label} className={`card p-5 ${color}`}>
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="text-2xl font-bold">{value ?? '–'}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-5 xl:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue – Last 7 Days</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentOrders.slice(0, 6).map((order: any) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex justify-between items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-sm font-semibold mt-1">₹{order.pricing?.total?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="font-semibold">Low Stock Alert</h2>
            <Link to="/products" className="text-sm text-primary-600 hover:underline">Manage</Link>
          </div>
          <div className="divide-y">
            {lowStockProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500 text-center">✅ All products well-stocked</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p._id} className="flex justify-between items-center px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">SKU: {p.sku || 'N/A'}</p>
                  </div>
                  <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
