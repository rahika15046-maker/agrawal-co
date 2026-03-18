'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchProducts, fetchCategories } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ─── Hero Carousel Slides ─────────────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: 'New Arrivals 2025',
    title: 'Shop Smart,\nLive Better',
    subtitle: 'Discover fresh products with fast delivery and the best prices.',
    cta: 'Shop Now',
    ctaLink: '/products',
    bg: 'from-orange-600 to-orange-800',
    image: '/main.png',
    

  },
  {
    id: 2,
    tag: 'Fresh & Tasty',
    title: 'Pure Taste,\nEvery Day',
    subtitle: 'Authentic homemade batters and lassi delivered fresh to your door.',
    cta: 'Order Now',
    ctaLink: '/products',
    bg: 'from-amber-600 to-orange-800',
    image: '/lassi.png',
  },
  {
    id: 3,
    tag: 'Best Sellers',
    title: 'Our Customers\nLove These',
    subtitle: 'Top rated products trusted by thousands of happy families.',
    cta: 'Shop Featured',
    ctaLink: '/products?featured=true',
    bg: 'from-red-700 to-orange-700',
    image: '/chuski.png',
  },
];

// ─── Hero Banner ──────────────────────────────────────────
export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);
  const slide = SLIDES[current];

  return (
    <section className={`relative bg-gradient-to-br ${slide.bg} text-white overflow-hidden transition-all duration-700`}>
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 min-h-[420px]">

        {/* Text */}
        <div className="flex-1 text-center md:text-left z-10">
          <p className="text-white/70 uppercase tracking-widest text-xs font-medium mb-3">{slide.tag}</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-5 whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="text-white/80 text-base mb-8 max-w-md">{slide.subtitle}</p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Link href={slide.ctaLink} className="bg-white text-orange-700 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
              {slide.cta}
            </Link>
            <Link href="/products" className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              All Products
            </Link>
          </div>
          <div className="flex gap-8 mt-10 justify-center md:justify-start">
            {[['10K+', 'Products'], ['50K+', 'Customers'], ['Free', 'Returns']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-white/60 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Image */}
        <div className="flex-1 hidden md:flex justify-end">
          <div className="relative w-96 h-72 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={slide.image}
              alt={slide.tag}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors z-20">
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors z-20">
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/40 w-2.5'}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Featured Categories ──────────────────────────────────
export function FeaturedCategories() {
  const { data: categories = [] } = useQuery('categories', fetchCategories);

  const staticCategories = [
    { _id: '1', name: 'Lassi', slug: 'lassi', emoji: '🥛' },
    { _id: '2', name: 'Popcorn', slug: 'popcorn', emoji: '🍿' },
    { _id: '3', name: 'Chuski', slug: 'chuski', emoji: '🧊' },
    { _id: '4', name: 'Food Batters', slug: 'food-batters', emoji: '🥣' },
  ];

  const displayCategories = categories.length > 0 ? categories : staticCategories;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <h2 className="text-2xl font-bold text-center mb-2">Shop by Category</h2>
      <p className="text-center text-gray-500 text-sm mb-8">Find exactly what you're looking for</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayCategories.slice(0, 8).map((cat: any) => (
          <Link
            key={cat._id}
            href={`/products?category=${cat._id}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 hover:shadow-md transition-all"
          >
            {cat.image?.url ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={cat.image.url} alt={cat.name} fill className="object-cover" />
              </div>
            ) : (
              <span className="text-4xl">{cat.emoji || '🛒'}</span>
            )}
            <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-primary-700">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Featured Products ─────────────────────────────────────
export function FeaturedProducts() {
  const { data, isLoading } = useQuery('featured-products', () =>
    fetchProducts({ featured: 'true', limit: 8 })
  );

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked just for you</p>
          </div>
          <Link href="/products?featured=true" className="text-primary-600 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.products?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🛍️</p>
            <p>No featured products yet. Mark products as featured in the admin panel!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Promo Section ────────────────────────────────────────
export function PromoSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-3 gap-6">
      {[
        { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹499 across India' },
        { icon: '🔄', title: 'Easy Returns', desc: '30-day hassle-free return policy' },
        { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay encrypted transactions' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="flex gap-4 items-start p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────
export function Testimonials() {
  const reviews = [
    { name: 'Priya S.', text: 'Absolutely love shopping here! Fast delivery and great quality.', rating: 5 },
    { name: 'Rahul M.', text: 'Best prices in the market. Will definitely order again!', rating: 5 },
    { name: 'Anita K.', text: 'Customer support is top-notch. Resolved my issue in minutes.', rating: 4 },
  ];
  return (
    <section className="bg-orange-50 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">What Our Customers Say</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Trusted by thousands of happy shoppers</p>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(({ name, text, rating }) => (
            <div key={name} className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
              </div>
              <p className="text-gray-700 text-sm italic mb-4">"{text}"</p>
              <p className="font-semibold text-sm">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;