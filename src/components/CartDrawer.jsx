import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CartDrawer() {
  const { lines, isCartOpen, closeCart, updateQty, removeFromCart, subtotal, cartCount } = useCart();
  const { isLoggedIn, openAuthModal } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    if (!isLoggedIn) {
      openAuthModal('Please login to proceed to checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-extrabold font-display text-foreground">
                My Cart <span className="text-muted-foreground text-sm font-medium">({cartCount} items)</span>
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-border">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary mb-4 text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 opacity-40" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground">Your cart is empty</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Discover outlet-priced original branded clothing and personalized gifts!
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-foreground transition-all"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              lines.map((line, idx) => {
                const product = line.product;
                const price = product.effectivePrice ?? product.price ?? 0;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    <img
                      src={product.imageUrl || '/logo.png'}
                      alt={product.title}
                      className="h-20 w-20 rounded-xl object-cover border border-border bg-background shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            onClick={closeCart}
                            className="text-sm font-bold text-foreground hover:text-accent line-clamp-2 transition-colors"
                          >
                            {product.title}
                          </Link>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-muted-foreground hover:text-danger p-1 shrink-0"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {line.size && (
                          <span className="inline-block mt-0.5 text-xs text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded-md">
                            Size: {line.size}
                          </span>
                        )}
                        {line.customization && (
                          <div className="mt-1 text-[11px] text-accent font-semibold flex items-center gap-1">
                            <span>✨ Personalized Gift ({line.customization.photos?.length || 0} photos)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-extrabold text-foreground">
                          ₹{(price * line.qty).toFixed(2)}
                        </span>

                        <div className="flex items-center border border-border rounded-lg bg-background">
                          <button
                            onClick={() => updateQty(idx, line.qty - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => updateQty(idx, line.qty + 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {lines.length > 0 && (
            <div className="border-t border-border p-4 sm:p-5 bg-background/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-semibold text-success">FREE Delivery</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center rounded-xl border border-border bg-card py-3 text-sm font-bold text-foreground hover:bg-secondary transition-all"
                >
                  View Full Cart
                </Link>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent py-3 text-sm font-extrabold text-accent-foreground shadow-md hover:bg-accent/90 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>100% Safe Payments via Razorpay & Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
