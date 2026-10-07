import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, openAuthModal } = useAuth();

  // Hide on checkout / admin pages
  if (location.pathname.startsWith('/checkout') || location.pathname.startsWith('/influencer')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home, isActive: location.pathname === '/' },
    { label: 'Categories', href: '/#categories', icon: Grid, isActive: location.pathname === '/categories' },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, badge: wishlistCount, isActive: location.pathname === '/wishlist' },
    { label: 'Cart', isButton: true, onClick: openCart, icon: ShoppingBag, badge: cartCount, isActive: location.pathname === '/cart' },
    {
      label: isLoggedIn ? 'Account' : 'Login',
      href: isLoggedIn ? '/account' : null,
      onClick: isLoggedIn ? null : () => openAuthModal(),
      icon: User,
      isActive: location.pathname.startsWith('/account'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border py-2 px-3 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const activeClasses = item.isActive ? 'text-accent font-bold' : 'text-muted-foreground hover:text-foreground';

          const content = (
            <div className={`relative flex flex-col items-center gap-1 py-1 px-3 ${activeClasses}`}>
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </div>
          );

          if (item.isButton || item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className="focus:outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={idx} to={item.href} className="focus:outline-none">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
