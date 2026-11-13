import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Check, ArrowRight, Sparkles, Lock, LogIn, UserPlus, QrCode, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import api from '../../services/api';

const officialTwoProducts = [
  {
    _id: 'tag_keychain_1',
    title: 'Laser-Printed QR Metal Keychain',
    subtitle: 'For Keys, Bikes, Cars, Bags & Backpacks',
    description: 'High-contrast laser-etched QR code on aerospace-grade alloy. Never scratches, peels, or fades. Built for heavy daily pocket friction with zero battery.',
    price: 2499,
    originalPrice: 2999,
    rating: 5.0,
    reviewsCount: 142,
    badge: 'Flagship Product',
    features: ['Grade 5 Alloy CNC Body', 'Scratch-Proof Laser Matrix', 'IP68 100% Submersible', 'Lifetime Cloud Linking'],
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  },
  {
    _id: 'tag_sticker_1',
    title: 'QR-Printed Weatherproof Stickers (Pack of 3)',
    subtitle: 'For Laptops, MacBooks, Tablets, Chargers & Cameras',
    description: 'Ultra-thin industrial 3M vinyl adhesive stickers with high-resolution printed QR code. Laminated to resist water, oil, heat, and daily abrasion.',
    price: 1499,
    originalPrice: 1899,
    rating: 4.9,
    reviewsCount: 218,
    badge: 'Multi-Pack Value',
    features: ['3M High-Tack Adhesive', '0.4mm Ultra-Slim Profile', 'Scratch & UV-Resistant', 'Includes 3 Pre-Printed Tags'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
];

export const HardwareShowcase = () => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState(officialTwoProducts);
  const [addedId, setAddedId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await api.get('/products');
        const prods = res.data?.data?.products || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (prods.length > 0) {
          // Map backend products if available, prioritizing keychains and stickers
          const keychains = prods.filter(p => p.category === 'keychain' || (p.title || '').toLowerCase().includes('keychain'));
          const stickers = prods.filter(p => p.category === 'sticker' || (p.title || '').toLowerCase().includes('sticker') || (p.title || '').toLowerCase().includes('decal'));

          const mapped = [];
          if (keychains[0]) mapped.push(keychains[0]);
          else mapped.push(officialTwoProducts[0]);

          if (stickers[0]) mapped.push(stickers[0]);
          else mapped.push(officialTwoProducts[1]);

          setProducts(mapped);
        }
      } catch (err) {
        // Fallback to official two products
      }
    };

    fetchLiveProducts();
  }, []);

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    addItem(item, 1);
    setAddedId(item._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section id="hardware-showcase" className="space-y-8 scroll-mt-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> OUR OFFICIAL HARDWARE
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
            Two Physical Products. Infinite Recovery Protection.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            We laser-engrave smart QR codes onto durable metal keychains and print them onto industrial weatherproof stickers.
          </p>
        </div>

        <Link to="/store">
          <Button variant="outline" size="sm" className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 font-bold">
            <span>Explore Hardware Store</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* 2-Product Featured Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {products.slice(0, 2).map((item, idx) => (
          <Card key={item._id || idx} className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white border-slate-200 shadow-md hover:shadow-lg transition-all rounded-3xl">
            <div className="space-y-4">
              {/* Product Photo */}
              <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group">
                <img 
                  src={item.image || (item.images && item.images[0]?.url) || officialTwoProducts[idx]?.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="cyan" size="sm" className="font-bold">
                    {idx === 0 ? '1. Laser-Printed Keychain' : '2. QR-Printed Stickers'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md">
                    Zero Battery Needed
                  </span>
                </div>
              </div>

              {/* Title, Rating & Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-700 font-bold">
                    {idx === 0 ? 'HEAVY-DUTY ALLOY' : 'WEATHERPROOF 3M FILM'}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.rating || 5.0}</span>
                    <span className="text-slate-400">({item.reviewsCount || 100}+)</span>
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-slate-900 text-xl leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Bullet Highlights */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {(item.features || officialTwoProducts[idx].features).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Add to Cart Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Price (Free Delivery PK)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-cyan-700">
                    PKR {item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      PKR {item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant={addedId === item._id ? 'secondary' : 'primary'}
                size="md"
                onClick={() => handleAddToCart(item)}
                className="font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm"
              >
                {addedId === item._id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Auth Modal for Visitors attempting Add to Cart */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to Order Findix Products"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-600" />
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <h4 className="font-bold text-slate-900 text-base">Account Required to Order</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              Please sign in or create a free account to add keychains or stickers to your cart.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setShowAuthModal(false)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-semibold text-sm hover:shadow transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setShowAuthModal(false)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-cyan-600 text-cyan-700 font-semibold text-sm hover:bg-cyan-50 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400">
            You can browse both products freely without signing in.
          </p>
        </div>
      </Modal>

    </section>
  );
};

export default HardwareShowcase;
