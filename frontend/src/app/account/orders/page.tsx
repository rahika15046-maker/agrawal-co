'use client';

import { useQuery } from 'react-query';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchMyOrders } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

type BadgeVariant = 'info' | 'warning' | 'success' | 'danger' | 'default';

const STATUS_COLORS: Record<string, BadgeVariant> = {
  placed: 'info',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'warning',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export default function OrdersPage() {
  const { data, isLoading, isError } = useQuery('my-orders', fetchMyOrders);

  console.log("ORDERS API DATA:", data); // 🔥 DEBUG

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load orders</p>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-gray-500 mb-4">
              You haven't placed any orders yet
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((order: any) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="card p-5 block hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">
                      {order.orderNumber || order._id}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <Badge
                    variant={
                      STATUS_COLORS[order.orderStatus] || 'default'
                    }
                  >
                    {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} item(s)
                  </p>

                  <p className="font-bold">
                    ₹{order.pricing?.total?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}