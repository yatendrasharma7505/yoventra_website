import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function Cart() {
  const { lines, updateQty, removeFromCart, subtotal, cartCount } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!isLoggedIn) {
      openAuthModal('Please login to apply coupons');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    try {
      const items = lines.map((l) => ({
        productId: l.product.id,
        qty: l.qty,
        size: l.size,
      }));

      const res = await api.getCheckoutTotals({
        items,
        couponCode: couponCode.trim(),
      });

      if (res?.discountAmount > 0) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: res.discountAmount,
        });
      } else {
        setCouponError(res?.couponError || 'Coupon is not valid for this cart.');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      openAuthModal('Please login to proceed to checkout');
      return;
    }
    navigate('/checkout', {
      state: {
        appliedCouponCode: appliedCoupon?.code || null,
        discountAmount,
      },
    });
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
        <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 opacity-40" />
        </div>
        <h2 className="text-2xl font-black font-display text-foreground">Your Shopping Cart is Empty</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          Explore authentic branded clothing and personalized gifts at unbeatable outlet prices!
        </p>
        <Link
          to="/categories/all"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-accent/90 transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground mb-8">
        Shopping Cart <span className="text-muted-foreground text-lg font-normal">({cartCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Line Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl bg-card border border-border divide-y divide-border overflow-hidden">
            {lines.map((line, idx) => {
              const product = line.product;
              const price = product.effectivePrice ?? product.price ?? 0;
              return (
                <div key={idx} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                  <img
                    src={product.imageUrl || '/logo.png'}
                    alt={product.title}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border border-border bg-background shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-sm sm:text-base font-extrabold text-foreground hover:text-accent line-clamp-2 transition-colors"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-muted-foreground hover:text-danger p-1 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-semibold">
                          by {product.seller || 'Yoventra'}
                        </span>
                        {line.size && (
                          <span className="text-xs font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-md">
                            Size: {line.size}
                          </span>
                        )}
                        {line.customization && (
                          <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-md">
                            ✨ Personalized ({line.customization.photos?.length || 0} photos)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-base sm:text-lg font-black font-display text-foreground">
                        ₹{(price * line.qty).toFixed(2)}
                      </span>

                      <div className="flex items-center border border-border rounded-xl bg-background">
                        <button
                          onClick={() => updateQty(idx, line.qty - 1)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-xs font-bold text-foreground">{line.qty}</span>
                        <button
                          onClick={() => updateQty(idx, line.qty + 1)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Coupon, Pricing Breakdown, Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Apply Promo Code
              </h3>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-success-bg border border-success/30">
                <span className="text-xs font-bold text-success flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {appliedCoupon.code} applied (₹{appliedCoupon.discount} OFF)
                </span>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs font-bold text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:border-accent focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-foreground disabled:opacity-50 transition-all"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs font-semibold text-danger flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
              Price Details
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span className="font-semibold text-success">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-black text-foreground pt-3 border-t border-border">
                <span>Total Amount</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-4 text-sm font-extrabold text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Safe & Secure Checkout via Razorpay & COD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
