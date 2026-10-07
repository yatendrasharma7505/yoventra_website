import { Heart, Star, Sparkles, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id || product._id);
  const effectivePrice = Number(product.effectivePrice ?? product.sellingPrice ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.price ?? product.mrp ?? effectivePrice);
  const discountPercent = product.discountPercent != null
    ? Math.round(Number(product.discountPercent))
    : (originalPrice > effectivePrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : 0);

  const isCustomizable = Boolean(product.requiresPersonalisation || product.customizable);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // If product has sizes or requires personalization, take user to detail page
    if (isCustomizable || (product.sizes && product.sizes.length > 0)) {
      navigate(`/products/${product.id || product._id}`);
      return;
    }
    addToCart(product, { qty: 1 });
    openCart();
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/products/${product.id || product._id}`}
      className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl hover:border-accent/40 transition-all duration-300 relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/40">
        <img
          src={product.imageUrl || product.images?.[0] || '/logo.png'}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 rounded-lg bg-accent px-2 py-1 text-[11px] font-extrabold text-accent-foreground shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Personalized Pill */}
        {isCustomizable && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3 text-accent" /> Custom Photo Gift
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-transform hover:scale-110 active:scale-95 ${
            inWishlist ? 'text-danger' : 'text-muted-foreground hover:text-foreground'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Brand/Seller */}
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            by {product.seller || 'Yoventra'}
          </span>

          {/* Title */}
          <h3 className="mt-0.5 text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            {product.title}
          </h3>
        </div>

        <div>
          {/* Price & Rating */}
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-foreground font-display">
              ₹{effectivePrice.toFixed(0)}
            </span>
            {originalPrice > effectivePrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                ₹{originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-bold text-foreground">
                {product.rating ?? '4.8'}
              </span>
            </div>
            {product.ratingCount && (
              <span className="text-[11px] text-muted-foreground font-medium">
                ({product.ratingCount})
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleQuickAdd}
          className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/60 py-2 px-3 text-xs font-extrabold text-foreground group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-200"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{isCustomizable ? 'Customize' : 'Add to Cart'}</span>
        </button>
      </div>
    </Link>
  );
}
