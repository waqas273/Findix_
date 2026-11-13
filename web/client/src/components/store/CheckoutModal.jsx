import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowRight, 
  Package, 
  Sparkles,
  ChevronRight,
  MapPin,
  Clock
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const CheckoutModal = ({ isOpen, onClose }) => {
  const { items, subtotal, clearCart, closeCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState('shipping'); // 'shipping', 'payment', 'confirmed'
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || 'Karachi',
    address: '',
    postalCode: '',
    paymentMethod: 'cod', // 'cod', 'easypaisa', 'card'
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReference, setOrderReference] = useState(null);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (voucherCode.trim().toUpperCase() === 'FINDIX10' || voucherCode.trim().toUpperCase() === 'RECOVERY') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setIsVoucherApplied(true);
      addToast('success', '10% Discount voucher applied successfully!');
    } else {
      addToast('error', 'Invalid or expired voucher code. Try "FINDIX10"');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      addToast('error', 'Please fill in all required shipping fields');
      return;
    }
    setStep('payment');
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    // Simulate network latency for payment gateway / order creation
    await new Promise((r) => setTimeout(r, 1200));

    const generatedOrderId = `FDX-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderReference(generatedOrderId);
    setIsSubmitting(false);
    setStep('confirmed');
    clearCart();
    addToast('success', `Order #${generatedOrderId} confirmed!`);
  };

  const handleModalClose = () => {
    if (step === 'confirmed') {
      setStep('shipping');
      setOrderReference(null);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title=""
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pt-2">

        {/* Step Progression Bar */}
        {step !== 'confirmed' && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 'shipping' ? 'bg-neon-cyan text-obsidian-950 shadow-neon-sm' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {step === 'payment' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-xs font-semibold ${step === 'shipping' ? 'text-white' : 'text-slate-400'}`}>
                Shipping Address
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600" />

            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 'payment' ? 'bg-neon-cyan text-obsidian-950 shadow-neon-sm' : 'bg-obsidian-850 text-slate-500 border border-slate-700'
              }`}>
                2
              </div>
              <span className={`text-xs font-semibold ${step === 'payment' ? 'text-white' : 'text-slate-500'}`}>
                Payment & Review
              </span>
            </div>
          </div>
        )}

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 'shipping' && (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-white">Delivery Information</h3>
              <p className="text-xs text-slate-400">Where should we deliver your pre-configured Findix tags?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recipient Full Name"
                placeholder="e.g. Daniyal Ahmed"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Contact Phone Number"
                placeholder="0300 1234567"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <Input
              label="Email Address (for order tracking & routing backup)"
              type="email"
              placeholder="you@domain.com"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Complete Street Address / Apartment / Office"
              placeholder="e.g. Apt 4B, Emerald Heights, Block 4 Clifton"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-obsidian-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Other">Other Nationwide</option>
                </select>
              </div>

              <Input
                label="Postal Code (Optional)"
                placeholder="75600"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </div>

            {/* Order Items Preview */}
            <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Cart Items ({items.length})</span>
              <div className="max-h-24 overflow-y-auto divide-y divide-slate-800/80 pr-1">
                {items.map((it) => (
                  <div key={it._id} className="py-1 flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[280px]">{it.quantity}x {it.title}</span>
                    <span className="font-mono text-neon-cyan">PKR {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT METHOD & REVIEW */}
        {step === 'payment' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-white">Select Payment Method</h3>
              <p className="text-xs text-slate-400">All transactions are encrypted with 256-bit SSL protection.</p>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'cod',
                  label: 'Cash on Delivery',
                  desc: 'Pay upon tag arrival at your doorstep',
                  icon: Banknote,
                  badge: 'Popular',
                },
                {
                  id: 'easypaisa',
                  label: 'EasyPaisa / JazzCash',
                  desc: 'Direct wallet or mobile account transfer',
                  icon: Smartphone,
                  badge: 'Instant',
                },
                {
                  id: 'card',
                  label: 'Credit / Debit Card',
                  desc: 'Visa, MasterCard, or UnionPay',
                  icon: CreditCard,
                  badge: 'Secure',
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: opt.id }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-neon-cyan/10 border-neon-cyan shadow-neon-sm'
                        : 'bg-obsidian-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-neon-cyan' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{opt.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voucher Coupon Box */}
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                placeholder="Have a voucher? (Try FINDIX10)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={isVoucherApplied}
                className="flex-1 px-3 py-2 rounded-xl bg-obsidian-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-neon-cyan uppercase font-mono"
              />
              <Button
                type="submit"
                variant={isVoucherApplied ? 'secondary' : 'outline'}
                size="sm"
                disabled={isVoucherApplied || !voucherCode}
              >
                {isVoucherApplied ? 'Applied' : 'Apply'}
              </Button>
            </form>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span className="text-emerald-400 font-bold">FREE (Nationwide)</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-neon-teal font-medium">
                  <span>Voucher Discount (10%)</span>
                  <span className="font-mono">- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Final Payable Amount</span>
                <span className="font-mono text-neon-cyan text-base">
                  PKR {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setStep('shipping')}
              >
                Back to Address
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                loading={isSubmitting}
                onClick={handleCompleteOrder}
                className="shadow-neon-sm font-bold"
              >
                <span>Place Order Now</span>
                <Check className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION */}
        {step === 'confirmed' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-neon-sm">
              <Package className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> ORDER CONFIRMED
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                Thank you for your order!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Your Findix hardware recovery tags are being assembled and prepared for dispatch with lifetime cloud relay routing.
              </p>
            </div>

            {/* Tracking Reference Card */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-slate-800 max-w-md mx-auto text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono font-bold text-neon-cyan">{orderReference}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Delivery</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neon-cyan" /> 2 - 3 Business Days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Destination</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neon-teal" /> {formData.city}, Pakistan
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={handleModalClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
