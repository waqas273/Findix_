import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  Check, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => typeof img === 'string' ? img : img.url)
    : [product.image || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'];

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Card
        className="p-4 sm:p-5 flex flex-col justify-between space-y-4 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        {/* Top Floating Badges */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 pointer-events-none">
          {product.badge && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Interactive Image Slider Box */}
          <div 
            onClick={() => onQuickView(product)}
            className="relative w-full h-52 sm:h-56 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer group/img"
          >
            {/* Main Display Image */}
            <img
              src={images[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Slider Arrow Controls (Only if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 z-10 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 z-10 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      aria-label={`View image ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex ? 'w-4 bg-cyan-600' : 'w-1.5 bg-slate-300 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Quick View Hover Pill Overlay */}
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold border border-slate-200 shadow-md">
                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                Quick View
              </span>
            </div>
          </div>

          {/* Product Rating & Stock Indicator */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-slate-800">{product.rating || 4.9}</span>
              <span className="text-slate-400 text-[11px]">({product.reviewsCount || 84})</span>
            </div>

            {/* Inventory State */}
            {product.stock && product.stock <= 10 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Low Stock ({product.stock} left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                In Stock
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 
              onClick={() => onQuickView(product)}
              className="font-display font-bold text-slate-900 text-base hover:text-cyan-600 transition-colors cursor-pointer line-clamp-1"
            >
              {product.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Pricing & Add to Cart Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-cyan-700">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Lifetime Cloud Routing</span>
          </div>

          <Button
            variant={isAdded ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleAddToCart}
            className="shrink-0 font-bold text-xs px-3 py-2 shadow-sm"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Auth gate modal — shown to visitors who try to add to cart */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to Order Hardware"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-600" />
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <h4 className="font-bold text-slate-900 text-base">Account Required for Shopping</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              Please sign in or create a free account to add hardware to your cart and complete your purchase.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setShowAuthModal(false)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold text-sm hover:shadow transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setShowAuthModal(false)}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-cyan-600 text-cyan-700 font-bold text-sm hover:bg-cyan-50 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400">
            You can still browse all products without signing in.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
