'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from 'react-query';
import { StarIcon } from '@heroicons/react/24/solid';
import { fetchProducts } from '@/lib/api';
import ProductCard from './ProductCard';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

// ─── ProductFilters ────────────────────────────────────────
export function ProductFilters({
  filters,
  onChange,
}: {
  filters: Record<string, string>;
  onChange: (f: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) =>
    onChange({ ...filters, [key]: val });
  const clear = (key: string) => {
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
            className="input text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="input text-sm"
          />
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Min Rating</h3>
        <div className="flex gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => filters.rating === String(r) ? clear('rating') : update('rating', String(r))}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filters.rating === String(r)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              {r}★ & up
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={(e) => e.target.checked ? update('inStock', 'true') : clear('inStock')}
            className="rounded text-primary-600"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
      {Object.keys(filters).length > 0 && (
        <button onClick={() => onChange({})} className="text-sm text-red-500 hover:underline">
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// ─── ProductSort ───────────────────────────────────────────
export function ProductSort({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const options = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-ratings.average', label: 'Best Rated' },
    { value: '-soldCount', label: 'Best Selling' },
  ];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input w-auto text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── ProductGallery ────────────────────────────────────────
export function ProductGallery({ images }: { images: { url: string; alt?: string }[] }) {
  const [active, setActive] = useState(0);
  if (!images?.length) return <div className="aspect-square bg-gray-100 rounded-xl" />;
  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        <Image src={images[active].url} alt={images[active].alt || 'Product'} fill className="object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              <Image src={img.url} alt={img.alt || ''} width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ProductInfo ───────────────────────────────────────────
export function ProductInfo({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: qty,
      stock: product.stock,
      variant: selectedVariant,
    });
    toast.success(`${qty} item(s) added to cart!`);
  };

  return (
    <div className="space-y-5">
      {product.brand && <p className="text-sm text-gray-400 uppercase tracking-widest">{product.brand}</p>}
      <h1 className="text-3xl font-display font-bold">{product.name}</h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1,2,3,4,5].map((s) => (
            <StarIcon key={s} className={`w-5 h-5 ${s <= Math.round(product.ratings.average) ? 'text-yellow-400' : 'text-gray-200'}`} />
          ))}
        </div>
        <span className="text-sm text-gray-500">({product.ratings.count} reviews)</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
        {product.comparePrice && (
          <>
            <span className="text-lg text-gray-400 line-through">₹{product.comparePrice.toLocaleString()}</span>
            <span className="badge bg-green-100 text-green-700">{discount}% OFF</span>
          </>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
      )}

      {/* Variants */}
      {product.variants?.map((variant: any) => (
        <div key={variant.name}>
          <p className="font-medium mb-2">{variant.name}:</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((opt: any) => (
              <button
                key={opt.value}
                onClick={() => setSelectedVariant({ name: variant.name, value: opt.value })}
                className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
                  selectedVariant?.value === opt.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">−</button>
          <span className="px-5 py-2 font-semibold">{qty}</span>
          <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">+</button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      {/* Stock info */}
      <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
      </p>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="font-semibold mb-2">Product Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── ProductReviews ────────────────────────────────────────
export function ProductReviews({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useQuery(['reviews', productId], async () => {
    const { data } = await api.get(`/reviews/product/${productId}`);
    return data.reviews;
  });

  if (isLoading) return <div className="text-gray-400 text-sm">Loading reviews…</div>;
  if (!reviews.length) return <div className="text-gray-400 text-sm">No reviews yet. Be the first to review!</div>;

  return (
    <div className="space-y-4">
      {reviews.map((r: any) => (
        <div key={r._id} className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
              {r.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{r.user?.name}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>
            {r.isVerifiedPurchase && (
              <span className="ml-auto badge bg-green-100 text-green-700">✓ Verified</span>
            )}
          </div>
          {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
          <p className="text-gray-600 text-sm">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

// ─── RelatedProducts ──────────────────────────────────────
export function RelatedProducts({ categoryId, excludeId }: { categoryId: string; excludeId: string }) {
  const { data } = useQuery(['related', categoryId], () =>
    fetchProducts({ category: categoryId, limit: 4 })
  );
  const related = data?.products?.filter((p: any) => p._id !== excludeId).slice(0, 4);
  if (!related?.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {related.map((p: any) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}

export default ProductGallery;
