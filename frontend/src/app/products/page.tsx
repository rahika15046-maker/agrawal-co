'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';
import ProductSort from '@/components/product/ProductSort';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import { fetchProducts } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const queryParams = {
    page,
    sort,
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    ...filters,
  };

  const { data, isLoading } = useQuery(['products', queryParams], () => fetchProducts(queryParams), {
    keepPreviousData: true,
  });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters filters={filters} onChange={setFilters} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">
                {data?.total ? `${data.total} products found` : ''}
              </p>
              <ProductSort value={sort} onChange={setSort} />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data?.products?.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {data?.pages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={page}
                      totalPages={data.pages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
