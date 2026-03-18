'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

declare global { interface Window { Razorpay: any } }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const subtotal = getTotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));

  const createOrder = async () => {
    const orderData = {
      items: items.map((i) => ({ product: i._id, quantity: i.quantity, variant: i.variant })),
      shippingAddress: address,
      pricing: { subtotal, shippingCharge: shipping, tax, total },
      payment: { method: paymentMethod },
    };
    const { data } = await api.post('/orders', orderData);
    return data.order;
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const order = await createOrder();
      const { data: rzData } = await api.post('/payments/razorpay/create-order', { amount: total });

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzData.order.amount,
          currency: 'INR',
          name: 'Agrawal.co',
          description: `Order ${order.orderNumber}`,
          order_id: rzData.order.id,
          handler: async (response: any) => {
            await api.post('/payments/razorpay/verify', {
              ...response,
              orderId: order._id,
            });
            clearCart();
            toast.success('Payment successful! Order placed.');
            router.push(`/account/orders/${order._id}`);
          },
          prefill: { name: address.fullName, contact: address.phone, email: user?.email },
          theme: { color: '#ea580c' },
        });
        rzp.open();
      };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const order = await createOrder();
      clearCart();
      toast.success('Order placed! Pay on delivery.');
      router.push(`/account/orders/${order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    router.push('/cart');
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Address form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Full Name *</label>
                  <input value={address.fullName} onChange={setField('fullName')} className="input" required />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Phone *</label>
                  <input value={address.phone} onChange={setField('phone')} className="input" required />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Address Line 1 *</label>
                  <input value={address.addressLine1} onChange={setField('addressLine1')} className="input" placeholder="House/Flat no, Building, Street" required />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block mb-1">Address Line 2</label>
                  <input value={address.addressLine2} onChange={setField('addressLine2')} className="input" placeholder="Landmark, Area (optional)" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">City *</label>
                  <input value={address.city} onChange={setField('city')} className="input" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">State *</label>
                  <input value={address.state} onChange={setField('state')} className="input" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Pincode *</label>
                  <input value={address.pincode} onChange={setField('pincode')} className="input" maxLength={6} required />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'razorpay', label: '💳 Online Payment (Razorpay)', desc: 'UPI, Cards, Net Banking, Wallets' },
                  { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <input type="radio" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value as any)} className="mt-1" />
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map((i) => (
                  <div key={i._id} className="flex justify-between">
                    <span className="text-gray-600 truncate mr-2">{i.name} × {i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
                <div className="flex justify-between"><span>GST</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={paymentMethod === 'razorpay' ? handleRazorpay : handleCOD}
                disabled={loading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Placing order…' : `Place Order • ₹${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
