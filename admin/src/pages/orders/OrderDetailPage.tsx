import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ORDER_STATUSES = ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];
const STATUS_COLORS: Record<string, string> = {
  placed:'bg-blue-100 text-blue-700', confirmed:'bg-indigo-100 text-indigo-700',
  processing:'bg-yellow-100 text-yellow-700', shipped:'bg-orange-100 text-orange-700',
  out_for_delivery:'bg-amber-100 text-amber-700', delivered:'bg-green-100 text-green-700',
  cancelled:'bg-red-100 text-red-700', returned:'bg-pink-100 text-pink-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const { data: order, isLoading } = useQuery(['order', id], async () => {
    const { data } = await api.get(`/orders/${id}`);
    return data.order;
  });

  const updateMutation = useMutation(
    () => api.put(`/orders/${id}/status`, { status: newStatus, note }),
    {
      onSuccess: () => {
        toast.success('Order status updated');
        qc.invalidateQueries(['order', id]);
        setNote('');
        setNewStatus('');
      },
      onError: () => toast.error('Update failed'),
    }
  );

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`ml-auto badge text-sm px-3 py-1 ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
          {order.orderStatus?.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold">Order Items</div>
            <div className="divide-y">
              {order.items.map((item: any) => (
                <div key={item._id} className="flex items-center gap-4 px-5 py-3">
                  {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t bg-gray-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₹{order.pricing.shippingCharge?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.pricing.tax?.toLocaleString()}</span></div>
              {order.pricing.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−₹{order.pricing.discount?.toLocaleString()}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>₹{order.pricing.total?.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Update status */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold">Update Order Status</h2>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input">
              <option value="">Select new status…</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)…" rows={2} className="input resize-none" />
            <button
              onClick={() => updateMutation.mutate()}
              disabled={!newStatus || updateMutation.isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {updateMutation.isLoading ? 'Updating…' : 'Update Status'}
            </button>
          </div>

          {/* Status history */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {[...order.statusHistory].reverse().map((h: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize">{h.status?.replace(/_/g, ' ')}</p>
                    {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                    <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Customer</h2>
            <p className="font-medium">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            <p className="text-sm text-gray-500">{order.user?.phone}</p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Payment</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize font-medium">{order.payment?.method}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`badge ${order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.payment?.status}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-400">Transaction ID</p>
                  <p className="text-xs font-mono break-all">{order.payment.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
