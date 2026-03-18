import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-white text-xl font-bold mb-4">Agrawal.co</h3>
          <p className="text-sm leading-relaxed">Premium products delivered to your doorstep. Shop with confidence — easy returns, secure payments.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            {['All Products', 'New Arrivals', 'Featured', 'Sale'].map((l) => (
              <li key={l}><Link href="/products" className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm">
            {['FAQ', 'Shipping Policy', 'Returns', 'Track Order', 'Contact Us'].map((l) => (
              <li key={l}><Link href="#" className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📧 support@agrawal.co</li>
            <li>📞 +91 98765 43210</li>
            <li>🕐 Mon–Sat, 9am–6pm IST</li>
          </ul>
          <div className="flex gap-4 mt-4">
            {['Instagram', 'Facebook', 'Twitter'].map((s) => (
              <Link key={s} href="#" className="text-xs hover:text-white transition-colors">{s}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Agrawal.co. All rights reserved. | Razorpay Secured Payments
      </div>
    </footer>
  );
}
