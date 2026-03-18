'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCartIcon, HeartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from 'react-query';
import { fetchCategories } from '@/lib/api';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const cartCount = useCartStore((s) => s.getCount());
  const { user, logout } = useAuthStore();
  const { data: categories = [] } = useQuery('categories', fetchCategories);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
  <img src="/logo.png" alt="Agrawal.co" className="h-10 w-auto" />
  <span className="font-display text-2xl font-bold text-primary-600">Agrawal.co</span>
</Link>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-primary-600 text-white px-4 hover:bg-primary-700 transition-colors">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 hidden group-hover:block z-50">
                  <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-gray-50">My Account</Link>
                  <Link href="/account/orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50">Orders</Link>
                  <Link href="/account/wishlist" className="block px-4 py-2.5 text-sm hover:bg-gray-50">Wishlist</Link>
                  {user.role !== 'user' && (
                    <Link href="http://localhost:3001" target="_blank" className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-primary-600">
                      Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                <UserIcon className="w-5 h-5 md:hidden" />
                <span className="hidden md:block">Sign In</span>
              </Link>
            )}

            <Link href="/account/wishlist" className="relative text-gray-600 hover:text-primary-600">
              <HeartIcon className="w-6 h-6" />
            </Link>

            <Link href="/cart" className="relative text-gray-600 hover:text-primary-600">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="flex border border-gray-200 rounded-lg overflow-hidden">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search…" className="flex-1 px-4 py-2 text-sm outline-none" />
            <button type="submit" className="bg-primary-600 text-white px-3">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Nav links — dynamic categories */}
        <nav className={`${mobileOpen ? 'block' : 'hidden'} md:flex gap-6 pb-3 md:pb-0 border-t md:border-0 pt-3 md:pt-0 flex-wrap`}>
          <Link href="/" className="block md:inline text-sm font-medium text-gray-600 hover:text-primary-600 py-1.5 md:py-0 transition-colors">
            Home
          </Link>
          <Link href="/products" className="block md:inline text-sm font-medium text-gray-600 hover:text-primary-600 py-1.5 md:py-0 transition-colors">
            All Products
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/products?category=${cat._id}`}
              className="block md:inline text-sm font-medium text-gray-600 hover:text-primary-600 py-1.5 md:py-0 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/products?featured=true" className="block md:inline text-sm  text-primary-600 hover:text-primary-700 py-1.5 md:py-0 transition-colors font-semibold">
            ⭐ Featured
          </Link>
        </nav>

      </div>
    </header>
  );
}