import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Truck, 
  Lock
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { CheckoutModal } from '../store/CheckoutModal';

export const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    totalCount,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Free shipping threshold (PKR 3,000)
  const freeShippingThreshold = 3000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleRemoveItem = async (itemId, itemTitle) => {
    const isConfirmed = await confirm({
      title: 'Remove Hardware Item?',
      message: `Are you sure you want to remove "${itemTitle || 'this item'}" from your cart?`,
      confirmText: 'Remove Item',
      cancelText: 'Keep Item',
      variant: 'danger',
      iconType: 'trash',
    });
    if (isConfirmed) {
      removeItem(itemId);
    }
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      navigate('/login');
      return;
    }
    closeCart();
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Drawer
        isOpen={isCartOpen}
        onClose={closeCart}
        title={`Recovery Gear Cart (${totalCount})`}
        maxWidth="max-w-md"
      >
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Protect your essentials with laser-etched titanium keychains, holographic stickers, and waterproof pet collar badges.
              </p>
            </div>
            <Link to="/store" onClick={closeCart}>
              <Button variant="primary" size="sm" className="font-bold">
                Explore Store
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between space-y-6">
            
            {/* Top Shipping Guarantee Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Truck className="w-3.5 h-3.5 text-cyan-600" />
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-700 font-bold">Free Express Shipping Unlocked!</span>
                  ) : (
                    <span>Add PKR {(freeShippingThreshold - subtotal).toLocaleString()} for Free Shipping</span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-cyan-700 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-700 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Item List */}
            <div className="space-y-3 divide-y divide-slate-100 overflow-y-auto max-h-[46vh] pr-1">
              {items.map((item) => (
                <div key={item._id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-cyan-600" />
                      )}
                    </div>
                    <div className="space-y-0.5 max-w-[150px] sm:max-w-[170px]">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-xs text-cyan-700 font-mono font-bold">
                        PKR {item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Quantity Adjuster */}
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item._id, item.title)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Calculation & Action Area */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-slate-900 font-bold">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Courier Delivery</span>
                  <span className="text-emerald-700 font-bold">
                    {subtotal >= freeShippingThreshold ? 'FREE' : 'PKR 150'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
                  <span>Total Amount</span>
                  <span className="font-mono text-cyan-700 text-base">
                    PKR {(subtotal + (subtotal >= freeShippingThreshold ? 0 : 150)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Pre-configured dynamic QR slugs with zero-leak routing included.</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenCheckout}
                className="w-full font-bold text-sm shadow-md"
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    <span>Sign in to Checkout</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

          </div>
        )}
      </Drawer>

      {/* Global Slide-Over Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};

export default CartDrawer;
