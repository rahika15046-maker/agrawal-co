"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-6">

        {/* Sidebar */}
        <div className="w-64 bg-white rounded-2xl shadow-sm p-4 hidden md:block">
          <h2 className="font-bold text-lg mb-4">My Account</h2>

          <nav className="space-y-2 text-sm">
            <Link href="/account" className="block px-4 py-2 rounded-lg bg-primary-600 text-white">
              Dashboard
            </Link>
            <Link href="/account/orders" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
              Orders
            </Link>
            <Link href="/account/wishlist" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
              Wishlist
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 space-y-6">

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-1">
              Hello, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your profile, orders and wishlist here.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold mt-1">{user.email}</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold mt-1 capitalize">{user.role}</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-semibold mt-1 text-green-600">Active</p>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
                Shop Now
              </Link>
              <Link href="/account/orders" className="px-4 py-2 border rounded-lg text-sm">
                View Orders
              </Link>
              <Link href="/account/wishlist" className="px-4 py-2 border rounded-lg text-sm">
                Wishlist
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}