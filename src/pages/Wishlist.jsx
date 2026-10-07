import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export function Wishlist() {
  const { items, wishlistCount } = useWishlist();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground">My Wishlist</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {wishlistCount} item(s) saved for later
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <Heart className="h-8 w-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Your wishlist is empty</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Save items that catch your eye while browsing to quickly find them later!
          </p>
          <Link
            to="/categories/all"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90"
          >
            <span>Explore Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
