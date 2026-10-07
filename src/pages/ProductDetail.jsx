import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';
import { PersonalizationModal } from '../components/PersonalizationModal';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { pincode, deliveryInfo, checkPincode } = useDelivery();
  const { isLoggedIn, openAuthModal } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [customization, setCustomization] = useState(null);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [testPincode, setTestPincode] = useState('');
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const [prodRes, reviewsRes] = await Promise.all([
          api.getProduct(id),
          api.getProductReviews(id).catch(() => ({ reviews: [] })),
        ]);

        const prod = prodRes?.product || prodRes;
        setProduct(prod);

        // Pre-select first available size
        if (prod?.sizes && prod.sizes.length > 0) {
          const firstInStock = prod.sizes.find((s) => (s.stock ?? 1) > 0);
          if (firstInStock) setSelectedSize(firstInStock.size || firstInStock);
        }

        const revList = reviewsRes?.reviews || (Array.isArray(reviewsRes) ? reviewsRes : []);
        setReviews(revList);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested product does not exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'string' ? img : img?.url || ''))
    : [product.imageUrl || '/logo.png'];

  const effectivePrice = Number(product.effectivePrice ?? product.sellingPrice ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.price ?? product.mrp ?? effectivePrice);
  const discountPercent = product.discountPercent != null
    ? Math.round(Number(product.discountPercent))
    : (originalPrice > effectivePrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : 0);

  const inWishlist = isInWishlist(product.id || product._id);
  const requiresPersonalisation = Boolean(product.requiresPersonalisation || product.customizable);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    if (requiresPersonalisation && !customization) {
      setShowPersonalizeModal(true);
      return;
    }

    addToCart(product, {
      size: typeof selectedSize === 'object' ? selectedSize.size : selectedSize,
      customization,
      qty: 1,
    });
    openCart();
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    if (requiresPersonalisation && !customization) {
      setShowPersonalizeModal(true);
      return;
    }

    addToCart(product, {
      size: typeof selectedSize === 'object' ? selectedSize.size : selectedSize,
      customization,
      qty: 1,
    });

    if (!isLoggedIn) {
      openAuthModal('Please login to place your order');
      return;
    }

    navigate('/checkout');
  };

  const handlePersonalizeConfirm = (customData) => {
    setCustomization(customData);
    setShowPersonalizeModal(false);
    addToCart(product, {
      size: typeof selectedSize === 'object' ? selectedSize.size : selectedSize,
      customization: customData,
      qty: 1,
    });
    openCart();
  };

  const handleCheckPincodeSubmit = async (e) => {
    e.preventDefault();
    await checkPincode(testPincode);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/categories/all" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] scrollbar-none shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-secondary/30 transition-all ${
                    i === activeImageIdx ? 'border-accent shadow-md scale-105' : 'border-border hover:border-accent/40'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden border border-border bg-card shadow-md">
            <img
              src={images[activeImageIdx] || '/logo.png'}
              alt={product.title}
              className="h-full w-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 rounded-xl bg-accent px-3 py-1.5 text-xs font-black text-accent-foreground shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-transform hover:scale-110 active:scale-95 ${
                inWishlist ? 'text-danger' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Info, Price, Sizes, Personalization, Pincode & Buy Buttons (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              by {product.seller || 'Yoventra'}
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black font-display text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-extrabold">{product.rating ?? '4.9'}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                ({reviews.length || product.ratingCount || 7} verified ratings)
              </span>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-secondary/40 border border-border">
            <span className="text-3xl font-black font-display text-foreground">
              ₹{effectivePrice.toFixed(0)}
            </span>
            {originalPrice > effectivePrice && (
              <>
                <span className="text-base text-muted-foreground line-through font-semibold">
                  ₹{originalPrice.toFixed(0)}
                </span>
                <span className="text-sm font-extrabold text-success">
                  Save ₹{(originalPrice - effectivePrice).toFixed(0)} ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Select Size
                </label>
                {sizeError && <span className="text-xs font-bold text-danger">Please choose a size</span>}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s, idx) => {
                  const sizeName = typeof s === 'string' ? s : s.size;
                  const isOutOfStock = typeof s === 'object' && s.stock !== undefined && s.stock <= 0;
                  const isSelected = selectedSize === sizeName || selectedSize?.size === sizeName;

                  return (
                    <button
                      key={idx}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(sizeName);
                        setSizeError(false);
                      }}
                      className={`min-w-[48px] h-11 px-3.5 rounded-xl border text-sm font-extrabold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'border-accent bg-accent text-accent-foreground shadow-md'
                          : isOutOfStock
                          ? 'border-border bg-secondary/30 text-muted-foreground line-through opacity-50 cursor-not-allowed'
                          : 'border-border bg-card text-foreground hover:border-accent/40'
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalization Gift section */}
          {requiresPersonalisation && (
            <div className="p-4 rounded-2xl border border-accent/30 bg-accent/5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <h4 className="text-sm font-extrabold text-foreground">Personalized Custom Gift</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                This item is custom-crafted with your photos & text. Click below to upload your memories before placing order!
              </p>
              {customization ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <span className="text-xs font-bold text-success flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {customization.photos?.length || 0} Photos & Message Added
                  </span>
                  <button
                    onClick={() => setShowPersonalizeModal(true)}
                    className="text-xs font-bold text-accent underline"
                  >
                    Edit Photos
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPersonalizeModal(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 px-4 text-xs font-extrabold text-accent-foreground shadow-sm hover:bg-accent/90 transition-all"
                >
                  <Sparkles className="h-4 w-4" /> Customize With Photos & Text
                </button>
              )}
            </div>
          )}

          {/* Delhivery Pincode Checker */}
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Check Delivery & Cash on Delivery
              </h4>
            </div>

            <form onSubmit={handleCheckPincodeSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={testPincode}
                onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
                placeholder={pincode || 'Enter 6-digit Pincode'}
                className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={testPincode.length !== 6 || deliveryInfo.status === 'checking'}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-foreground disabled:opacity-50 transition-all"
              >
                {deliveryInfo.status === 'checking' ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincode && deliveryInfo.status === 'serviceable' && (
              <div className="space-y-1 pt-1 text-xs font-bold text-success">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Delhivery Express delivery available to {deliveryInfo.city || 'your area'} ({pincode})</span>
                </p>
                {deliveryInfo.codAvailable && (
                  <p className="text-[11px] text-muted-foreground pl-5 font-semibold">
                    ✓ Cash on Delivery (COD) available
                  </p>
                )}
              </div>
            )}
            {deliveryInfo.status === 'notServiceable' && (
              <p className="text-xs font-bold text-danger flex items-center gap-1.5 pt-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Delivery not available at this pincode</span>
              </p>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card py-3.5 px-4 text-sm font-extrabold text-foreground hover:bg-secondary transition-all shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 px-4 text-sm font-extrabold text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
            >
              <span>Buy Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Highlights & Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-center">
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50">
              <ShieldCheck className="h-5 w-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-bold text-foreground block">100% Original</span>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50">
              <Truck className="h-5 w-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-bold text-foreground block">Fast Shipping</span>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50">
              <RotateCcw className="h-5 w-5 mx-auto text-accent mb-1" />
              <span className="text-[10px] font-bold text-foreground block">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews */}
      <div className="border-t border-border pt-10 space-y-8">
        <div>
          <h3 className="text-lg font-black font-display text-foreground mb-3">Product Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description || 'Premium quality branded merchandise from Yoventra. Handpicked materials, comfortable fit, and outstanding longevity guaranteed.'}
          </p>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black font-display text-foreground">Customer Reviews</h3>
              <p className="text-xs text-muted-foreground">Real reviews from verified buyers</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{r.customerName || r.name || 'Verified Customer'}</span>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, starI) => (
                        <Star key={starI} className={`h-3 w-3 ${starI < (r.rating || 5) ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.comment || r.review || 'Great product, exact fit and premium quality.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personalization Modal */}
      {showPersonalizeModal && (
        <PersonalizationModal
          isOpen={showPersonalizeModal}
          onClose={() => setShowPersonalizeModal(false)}
          product={product}
          onConfirm={handlePersonalizeConfirm}
          confirmLabel="Save & Add to Cart"
        />
      )}
    </div>
  );
}
