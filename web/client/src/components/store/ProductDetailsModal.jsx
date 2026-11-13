import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Box, 
  Award, 
  Check, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  Cpu,
  Flame,
  Truck,
  Lock
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailsModal = ({ isOpen, onClose, product, onProceedToCheckout }) => {
  if (!product) return null;

  const { addItem, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'durability', 'box', 'warranty'
  const [isAdded, setIsAdded] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images.map(img => typeof img === 'string' ? img : img.url)
    : [product.image || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'];

  const specs = product.specs || {
    material: 'Grade 5 Aerospace Titanium Alloy / 3M VHB Composite',
    dimensions: '42mm x 26mm x 2.8mm',
    weight: '16 grams',
    ipRating: 'IP68 (Submersible up to 50m)',
    durability: 'High-friction laser etched matrix',
    warranty: '2-Year Hardware Replacement + Lifetime Routing'
  };

  const inTheBox = product.inTheBox || [
    '1x Findix Laser-Etched Smart Hardware Tag',
    '1x High-Tensile 316L Stainless Keyring',
    '1x Activation & Lifetime Routing Manual'
  ];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      openCart();
    }, 600);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    addItem(product, quantity);
    onClose();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      openCart();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-2">
        
        {/* Left Column: Image Gallery & Carousel */}
        <div className="space-y-4">
          {/* Main Large Display Image */}
          <div className="relative w-full h-72 sm:h-84 md:h-96 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group">
            <img
              src={images[selectedImageIdx]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all shadow-md cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Floating Category / Stock Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
              {product.badge && (
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl bg-slate-100 border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                    idx === selectedImageIdx
                      ? 'border-cyan-600 shadow-sm scale-95'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Free Express Nationwide Delivery</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Zero-Leak Encrypted Routing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Pricing, Specs Tabs, Add to Cart */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Title & Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-slate-900 font-bold">{product.rating || 5.0}</span>
                <span className="text-slate-500">({product.reviewsCount || 120} verified reviews)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                {product.title}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Row */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-mono">Price (All Taxes Included)</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-cyan-700">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Ready to Ship
                </span>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200 gap-2">
              {[
                { id: 'specs', label: 'Specifications', icon: Cpu },
                { id: 'durability', label: 'Durability', icon: Droplets },
                { id: 'box', label: 'In The Box', icon: Box },
                { id: 'warranty', label: 'Warranty', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-cyan-600 text-cyan-700 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="text-xs space-y-3 min-h-[140px] text-slate-600">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Material</span>
                    <span className="font-semibold text-slate-900">{specs.material}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Dimensions</span>
                    <span className="font-semibold text-slate-900">{specs.dimensions}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Weight</span>
                    <span className="font-semibold text-slate-900">{specs.weight}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Protection Rating</span>
                    <span className="font-bold text-cyan-700">{specs.ipRating}</span>
                  </div>
                </div>
              )}

              {activeTab === 'durability' && (
                <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-2">
                    <Droplets className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <p><strong className="text-slate-900">Submersible Proof:</strong> Full IP68 resistance against saltwater, pools, mud, and rainstorms.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p><strong className="text-slate-900">Extreme Temperature:</strong> Tested from -30°C to +85°C without deformation or adhesive weakening.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p><strong className="text-slate-900">Laser Engraved Matrix:</strong> No printed ink to peel; physical laser vaporized contrast grooves that scan for decades.</p>
                  </div>
                </div>
              )}

              {activeTab === 'box' && (
                <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  {inTheBox.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'warranty' && (
                <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-slate-900 font-bold">2-Year Replacement Guarantee</h4>
                      <p className="text-slate-600 text-[11px]">If the tag hardware is damaged under normal everyday use, we replace it free of charge.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                    <Cpu className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-slate-900 font-bold">Lifetime Cloud Routing Service</h4>
                      <p className="text-slate-600 text-[11px]">Your dynamic recovery slug never expires, with unlimited finder redirects and privacy updates.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Row: Quantity + Add to Cart + Buy Now */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {showAuthGate ? (
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-800">
                  <Lock className="w-4 h-4 text-cyan-600" />
                  Sign In Required to Purchase
                </div>
                <p className="text-xs text-slate-600">
                  Please log in or create an account to add items to your cart and complete checkout.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { onClose(); navigate('/login'); }}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-xs font-bold shadow-sm"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); navigate('/register'); }}
                    className="px-4 py-1.5 rounded-lg border border-cyan-600 text-cyan-700 text-xs font-bold hover:bg-cyan-100"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Quantity Picker */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-mono font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant={isAdded ? 'secondary' : 'outline'}
                  size="md"
                  onClick={handleAddToCart}
                  className="flex-1 text-xs sm:text-sm font-semibold border-slate-300 text-slate-800 hover:bg-slate-100"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-cyan-600" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </Button>

                {/* Instant Buy Now Button */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBuyNow}
                  className="flex-1 text-xs sm:text-sm font-bold shadow-sm"
                >
                  <span>Instant Checkout</span>
                </Button>
              </div>
            )}
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
