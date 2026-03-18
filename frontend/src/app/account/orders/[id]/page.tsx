'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Spinner from '@/components/ui/Spinner';
import { fetchOrderById } from '@/lib/api';
import Badge from '@/components/ui/Badge';

const STATUS_STEPS = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export default function OrderDetailsPage() {
  const params = useParams();

  // ✅ FIX: ensure string
  const orderId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { data, isLoading, isError } = useQuery(
    ['order', orderId],
    () => fetchOrderById(orderId!),
    { enabled: !!orderId }
  );

  // ✅ Loading
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // ✅ Error
  if (isError) {
    return <p className="text-center py-20 text-red-500">Failed to load order</p>;
  }

  // ✅ SAFE DATA ACCESS
  const order = data?.order || data;

  if (!order) {
    return <p className="text-center py-20">Order not found</p>;
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>

        {/* 📦 Order Info */}
        <div className="card p-6 mb-6 space-y-2">
          <p><strong>Order ID:</strong> {order._id}</p>

          <p>
            <strong>Date:</strong>{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN')}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            <Badge variant="info">
              {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </p>

          <p>
            <strong>Total:</strong> ₹{order.pricing?.total?.toLocaleString()}
          </p>
        </div>

        {/* 🚚 Tracking */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Tracking Status</h2>

          <div className="flex justify-between text-sm">
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center
                  ${
                    index <= currentStepIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  ✓
                </div>

                <p className="mt-2 capitalize">
                  {step.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 🛒 Items */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Items</h2>

          {order.items?.map((item: any, i: number) => (
            <div
              key={i}
              className="border-b py-3 flex justify-between"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p>₹{item.price}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}