'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some products to get started</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </main>
        <Footer />
      </>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item._id}-${item.variant?.value}`} className="card p-4 flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover rounded-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.variant && <p className="text-sm text-gray-500">{item.variant.name}: {item.variant.value}</p>}
                  <p className="text-primary-600 font-bold mt-1">₹{item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100">
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit sticky top-4">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-green-600 mt-2">Add ₹{(499 - subtotal)} more for FREE shipping!</p>
            )}
            <Link href="/checkout" className="btn-primary w-full text-center mt-6 block">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-outline w-full text-center mt-3 block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
