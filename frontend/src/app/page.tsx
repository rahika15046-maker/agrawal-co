import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { HeroBanner, FeaturedCategories, FeaturedProducts, PromoSection, Testimonials } from '@/components/home/index';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBanner />
        <FeaturedCategories />
        <FeaturedProducts />
        <PromoSection />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}