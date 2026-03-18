'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore'; // ✅ ADD THIS
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  ratings: { average: number; count: number };
  stock: number;
  discountPercent?: number;
  brand?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  // ✅ Wishlist store
  const { items, addItem: addToWishlist, removeItem } = useWishlistStore();

  const isWishlisted = items.some((item) => item._id === product._id);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: 1,
      stock: product.stock,
    });
    toast.success('Added to cart!');
  };

  // ✅ Wishlist toggle
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isWishlisted) {
      removeItem(product._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist ❤️");
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group card hover:shadow-md transition-shadow duration-200">

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={product.images[0]?.alt || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-red-100 text-red-700">
            {discount}% OFF
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}

        {/* ❤️ Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:scale-110 transition-transform"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.brand && (
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-0.5">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" style={{fill:'#facc15'}} />
          <span className="text-xs text-gray-500">
            {product.ratings.average.toFixed(1)} ({product.ratings.count})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-3 flex items-center justify-center gap-2 btn-primary text-sm py-2 disabled:opacity-40"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}