import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  Package,
  LogOut,
  MapPinCheck,
  CheckCircle2,
  Sparkles,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDelivery } from '../context/DeliveryContext';
import { api } from '../api/client';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.user.yoventra';

export function Header() {
  const { isLoggedIn, customer, logout, openAuthModal } = useAuth();
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { pincode, deliveryInfo, checkPincode } = useDelivery();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.getCategories();
        if (Array.isArray(res)) setCategories(res);
        else if (res?.categories) setCategories(res.categories);
      } catch {}
    }
    fetchCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    const ok = await checkPincode(tempPincode);
    if (ok) {
      setShowPincodeModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="h-3 w-3 text-accent" />
        <span>100% Original Branded Clothing & Custom Photo Gifts · Outlet Prices Up To 80% Off</span>
      </div>

      {/* Main Header Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-6">
        {/* Left: Brand Logo & Deliver-to */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="Yoventra" className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
            <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-foreground">
              Yoventra
            </span>
          </Link>

          {/* Deliver To Pincode Badge (Desktop) */}
          <button
            onClick={() => {
              setTempPincode(pincode || '');
              setShowPincodeModal(true);
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-accent/40 hover:bg-secondary/40 text-left transition-all"
          >
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <div className="text-xs leading-tight">
              <span className="text-[10px] text-muted-foreground block font-medium">Deliver to</span>
              <span className="font-extrabold text-foreground truncate max-w-[110px] block">
                {pincode ? `${deliveryInfo.city || 'PIN'} ${pincode}` : 'Select Location'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden sm:block">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search joggers, t-shirts, personalized scrapbooks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground font-medium placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
            />
          </div>
        </form>

        {/* Right Actions: Wishlist, Cart, Account */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl hover:bg-secondary text-foreground transition-colors"
            title="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl hover:bg-secondary text-foreground transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-accent-foreground shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Menu */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-border bg-background hover:bg-secondary text-foreground transition-all"
              >
                <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-black text-xs">
                  {customer?.name ? customer.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <span className="hidden lg:block text-xs font-bold text-foreground max-w-[100px] truncate">
                  {customer?.name || 'My Account'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{customer?.name || 'Customer'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{customer?.phone}</p>
                  </div>
                  <Link
                    to="/account/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    <Package className="h-4 w-4 text-accent" /> My Orders
                  </Link>
                  <Link
                    to="/account/addresses"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    <MapPinCheck className="h-4 w-4 text-accent" /> Saved Addresses
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-danger hover:bg-danger-bg transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-foreground transition-all shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl border border-border text-foreground hover:bg-secondary"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Secondary Categories Bar (Horizontal Scroll on Mobile/Desktop) */}
      <div className="border-t border-border bg-background/50 overflow-x-auto scrollbar-none py-2 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs font-bold text-muted-foreground shrink-0">
          <Link
            to="/categories/all"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              location.pathname === '/categories/all' ? 'bg-accent text-white font-extrabold' : 'hover:bg-secondary hover:text-foreground'
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id || cat._id}
              to={`/categories/${cat.id || cat._id}`}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-secondary hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/price/under-99"
            className="px-3 py-1.5 rounded-lg whitespace-nowrap text-accent hover:bg-accent/10 transition-colors font-extrabold"
          >
            Under ₹99
          </Link>
          <Link
            to="/price/under-199"
            className="px-3 py-1.5 rounded-lg whitespace-nowrap text-accent hover:bg-accent/10 transition-colors font-extrabold"
          >
            Under ₹199
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card p-4 space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium"
              />
            </div>
          </form>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowPincodeModal(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Deliver to: {pincode ? `${deliveryInfo.city || ''} (${pincode})` : 'Select PIN Code'}</span>
            </div>
            <span className="text-accent underline text-[11px]">Change</span>
          </button>

          <div className="pt-2 border-t border-border flex flex-col gap-1 text-sm font-bold">
            <Link to="/categories/all" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
              Browse All Products
            </Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
              My Wishlist ({wishlistCount})
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/account/orders" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                  My Orders
                </Link>
                <Link to="/account/addresses" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                  Saved Addresses
                </Link>
              </>
            )}
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg text-accent">
              <Download className="h-4 w-4" /> Download Yoventra App
            </a>
          </div>
        </div>
      )}

      {/* Pincode Selection Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <h3 className="text-base font-extrabold text-foreground">Select Delivery Location</h3>
              </div>
              <button onClick={() => setShowPincodeModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your 6-digit PIN code to check delivery availability and estimated delivery dates.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN code"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              />
              {deliveryInfo.status === 'notServiceable' && (
                <p className="text-xs font-semibold text-danger">{deliveryInfo.errorMessage}</p>
              )}
              {deliveryInfo.status === 'serviceable' && (
                <p className="text-xs font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivery available to {deliveryInfo.city}!
                </p>
              )}
              <button
                type="submit"
                disabled={tempPincode.length !== 6 || deliveryInfo.status === 'checking'}
                className="w-full rounded-xl bg-accent py-2.5 px-4 text-sm font-extrabold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all"
              >
                {deliveryInfo.status === 'checking' ? 'Checking...' : 'Check Availability'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
