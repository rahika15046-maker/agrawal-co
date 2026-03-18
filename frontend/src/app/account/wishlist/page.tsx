'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const wishlist = useWishlistStore((s) => s.items); // ✅ moved inside component

  useEffect(() => {
    if (!user) router.push('/login?redirect=/account/wishlist');
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-6">

          {/* Sidebar */}
          <div className="w-64 bg-white rounded-2xl shadow-sm p-4 hidden md:block flex-shrink-0">
            <h2 className="font-bold text-lg mb-4">My Account</h2>
            <nav className="space-y-2 text-sm">
              <Link href="/account" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                Dashboard
              </Link>
              <Link href="/account/orders" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                Orders
              </Link>
              <Link href="/account/wishlist" className="block px-4 py-2 rounded-lg bg-primary-600 text-white">
                Wishlist
              </Link>
            </nav>
          </div>

          {/* Main */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">
                  My Wishlist
                  {wishlist.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({wishlist.length} items)
                    </span>
                  )}
                </h1>
                <Link href="/products" className="text-sm text-primary-600 hover:underline">
                  + Add More
                </Link>
              </div>

              {!wishlist.length ? (
                <div className="text-center py-16">
                  <HeartIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Your wishlist is empty</h2>
                  <p className="text-gray-500 mb-6">Add products you love ❤️</p>
                  <Link href="/products" className="btn-primary">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlist.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}