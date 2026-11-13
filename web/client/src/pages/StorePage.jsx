import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Cpu, 
  Droplets, 
  Truck, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { ProductCard } from '../components/store/ProductCard';
import { ProductDetailsModal } from '../components/store/ProductDetailsModal';
import { CheckoutModal } from '../components/store/CheckoutModal';
import { Card } from '../components/ui/Card';

export const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
        if (searchQuery) queryParams.append('search', searchQuery);
        if (sortBy === 'price_asc') queryParams.append('sort', 'price_asc');
        else if (sortBy === 'price_desc') queryParams.append('sort', 'price_desc');
        else if (sortBy === 'popular') queryParams.append('sort', 'popular');

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const prods = json.data?.products || (Array.isArray(json.data) ? json.data : []);
          setProducts(prods);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch from backend:', e);
      }

      setLoading(false);
    };

    fetchCatalog();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Hero Store Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> RECOVERY HARDWARE & TAGS
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
          Physical Hardware. <span className="text-cyan-600">Zero Battery.</span> Lifetime Routing.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Laser-printed solid metal keychains and industrial weatherproof QR stickers that keep your keys, vehicles, laptops, and essentials protected forever.
        </p>
      </div>

      {/* Hardware Value Highlights Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {[
          { icon: Droplets, title: 'IP68 Submersible', desc: 'Water, mud & pool proof' },
          { icon: Cpu, title: 'Laser-Etched Matrix', desc: 'Never fades, ink-free' },
          { icon: ShieldCheck, title: 'Zero-Leak Privacy', desc: 'Encrypted relay routing' },
          { icon: Truck, title: 'Express Delivery', desc: 'Nationwide across Pakistan' },
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                <p className="text-[11px] text-slate-500">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter, Search & Sort Control Bar */}
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'keychain', label: 'Laser QR Keychains' },
              { id: 'sticker', label: 'Weatherproof QR Stickers' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tags or gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
              />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-cyan-600 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No hardware found</h3>
              <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hardware Guarantee & FAQs Section */}
      <div className="max-w-5xl mx-auto pt-8 border-t border-slate-200 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about Findix smart recovery tags.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Do Findix hardware tags require battery charging or replacement?',
              a: 'No! Findix physical tags operate with zero batteries or internal electronics. They utilize laser-vaporized micro QR matrixes that scan instantly on any modern smartphone camera.',
            },
            {
              q: 'Can I change my contact info or privacy settings after attaching the tag?',
              a: 'Yes, anytime. Since your tag is linked to your digital Findix dashboard, you can update your WhatsApp number, phone display, or reward note dynamically with zero tag re-printing.',
            },
            {
              q: 'Is there any monthly subscription fee for QR routing?',
              a: 'Never. Every hardware product comes with lifetime digital routing and zero-leak encrypted resolution included with no recurring subscription.',
            },
            {
              q: 'What happens if someone scans my lost item in another country?',
              a: 'Findix routing operates globally over high-speed HTTPS. The finder is immediately directed to your privacy-shielded recovery page regardless of their location.',
            },
          ].map((faq, idx) => (
            <Card key={idx} className="p-4 bg-white border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
              </div>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Details Specs Modal */}
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Direct Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

    </div>
  );
};

export default StorePage;
