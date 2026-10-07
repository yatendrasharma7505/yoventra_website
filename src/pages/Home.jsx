import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Download,
  Percent,
  CheckCircle2,
  ChevronDown,
  Gift,
} from 'lucide-react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.user.yoventra';

export function Home() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [priceSections, setPriceSections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bannersRes, catRes, priceRes, prodRes] = await Promise.all([
          api.getBanners().catch(() => []),
          api.getCategories().catch(() => []),
          api.getPriceSections().catch(() => []),
          api.getProducts({ pageSize: 50 }).catch(() => ({ items: [], products: [] })),
        ]);

        const bannerList = Array.isArray(bannersRes) ? bannersRes : bannersRes?.banners || [];
        setBanners(bannerList);

        const catList = Array.isArray(catRes) ? catRes : catRes?.categories || [];
        setCategories(catList);

        const priceList = Array.isArray(priceRes) ? priceRes : priceRes?.sections || [];
        setPriceSections(priceList);

        const prods = (prodRes?.items || prodRes?.products || (Array.isArray(prodRes) ? prodRes : []))
          .filter((p) => p && (p.status === 'active' || !p.status));
        setFeaturedProducts(prods);

        // Filter personalized gifts
        const custom = prods.filter((p) => p.requiresPersonalisation || p.customizable);
        setPersonalizedProducts(custom);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerClick = (b) => {
    if (!b) return;
    const actionType = b.actionType || 'none';
    const actionValue = b.actionValue || b.linkUrl || '';

    // External URL handling
    if (actionType === 'external_url' || (b.linkUrl && actionType === 'none')) {
      const url = b.linkUrl || actionValue;
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          navigate(url);
        }
      }
      return;
    }

    // Direct product detail
    if (actionType === 'product') {
      if (actionValue) {
        navigate(`/products/${actionValue}`);
      }
      return;
    }

    // Category navigation
    if (actionType === 'category') {
      if (actionValue) {
        navigate(`/categories/${actionValue}`);
      } else {
        navigate('/categories/all');
      }
      return;
    }

    // Collection navigation
    if (actionType === 'collection') {
      if (actionValue) {
        navigate(`/categories/${actionValue}`);
      } else {
        navigate('/categories/all');
      }
      return;
    }

    // Price range (e.g. 99, 199, 299)
    if (actionType === 'priceRange') {
      if (actionValue) {
        navigate(`/price/under-${actionValue}`);
      }
      return;
    }

    // Search query
    if (actionType === 'search') {
      if (actionValue) {
        navigate(`/search?q=${encodeURIComponent(actionValue)}`);
      }
      return;
    }

    // Direct fallback IDs if set on banner
    if (b.categoryId) {
      navigate(`/categories/${b.categoryId}`);
      return;
    }
    if (b.productId) {
      navigate(`/products/${b.productId}`);
      return;
    }
    if (b.linkUrl) {
      navigate(b.linkUrl);
      return;
    }

    // Informational or general promo fallback
    navigate('/categories/all');
  };

  const toggleFaq = (idx) => setActiveFaq(activeFaq === idx ? null : idx);

  const faqs = [
    {
      q: 'Are all products 100% original & authentic?',
      a: 'Yes, absolutely! We source directly from authorized manufacturer outlets and verified Indian gift creators. Every product goes through rigorous quality checks.',
    },
    {
      q: 'How does custom photo gift personalization work?',
      a: 'Simply pick your favorite memory scrapbook or custom album, click "Customize", upload your photos and custom text directly on our website or app, and our artisans will craft your custom gift with premium finishing.',
    },
    {
      q: 'What payment modes are supported?',
      a: 'We support 100% secure Online Payment (UPI, Google Pay, PhonePe, Paytm, Debit/Credit Cards, NetBanking via Razorpay) as well as Cash on Delivery (COD) across India.',
    },
    {
      q: 'How fast is delivery?',
      a: 'All orders are shipped via Delhivery Express logistics. Readymade items typically deliver in 3–5 days, while handcrafted personalized gifts take 4–7 days depending on your pincode.',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      {/* 1. Hero Banners Carousel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6">
        {banners.length > 0 ? (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-lg aspect-[16/7] sm:aspect-[21/8]">
            {banners.map((b, i) => {
              const isClickable = b.actionType !== 'none' || b.actionValue || b.linkUrl || b.categoryId || b.productId;

              return (
                <div
                  key={b.id || b._id || i}
                  onClick={() => handleBannerClick(b)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  className={`group absolute inset-0 transition-opacity duration-700 ${
                    i === currentBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  } ${isClickable ? 'cursor-pointer' : ''}`}
                >
                  <img
                    src={b.imageUrl || b.image}
                    alt={b.title || 'Yoventra Promotion'}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {(b.title || b.subtitle || b.eyebrow || b.ctaLabel || isClickable) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end justify-between p-6 sm:p-10 pointer-events-none">
                      <div className="max-w-xl text-white">
                        {(b.eyebrow || b.tag) && (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-accent text-[11px] font-extrabold uppercase tracking-wider mb-2 text-white">
                            {b.eyebrow || b.tag}
                          </span>
                        )}
                        {b.title && <h2 className="text-xl sm:text-3xl font-black font-display drop-shadow-sm">{b.title}</h2>}
                        {b.subtitle && <p className="mt-1 text-xs sm:text-sm text-white/85 drop-shadow-sm">{b.subtitle}</p>}
                      </div>

                      {isClickable && (
                        <div className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-black text-white shadow-lg group-hover:bg-accent/90 group-hover:scale-105 transition-all shrink-0">
                          <span>{b.ctaLabel || 'Shop Now'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Carousel Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentBannerIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === currentBannerIdx ? 'w-6 bg-accent' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback Hero Banner */
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-neutral-900 to-accent text-white p-8 sm:p-14 shadow-xl">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Outlet Prices Up To 80% Off
              </span>
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
                Authentic Branded Fashion & Personalized Memory Gifts
              </h1>
              <p className="text-sm sm:text-base text-white/80">
                Explore handpicked branded clothing and custom scrapbooks crafted with love. Fast delivery across India powered by Delhivery.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/categories/all"
                  className="rounded-xl bg-accent px-6 py-3.5 text-sm font-extrabold text-white shadow-lg hover:bg-accent/90 transition-all flex items-center gap-2"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download App</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Categories Circular Rail */}
      <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-foreground">Explore Categories</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Find fashion and gifts curated for you</p>
          </div>
          <Link to="/categories/all" className="text-xs sm:text-sm font-extrabold text-accent flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat._id}
              to={`/categories/${cat.id || cat._id}`}
              className="group flex flex-col items-center p-3 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all text-center"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-secondary border border-border mb-2.5 group-hover:scale-105 transition-transform">
                <img
                  src={cat.imageUrl || cat.image || '/logo.png'}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-foreground group-hover:text-accent transition-colors truncate w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Budget Picks / Price Sections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-secondary/60 border border-border p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="text-xs font-black text-accent uppercase tracking-wider">Unbeatable Value</span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-foreground mt-1">
              Shop by Budget
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Heavy outlet discounts starting at just ₹99. Real branded clothes at wholesale prices!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/price/under-99"
              className="group rounded-2xl bg-card border border-border p-6 hover:border-accent hover:shadow-lg transition-all text-center"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-black text-xs mb-2">
                FLAT DISCOUNT
              </span>
              <h3 className="text-2xl font-black font-display text-foreground group-hover:text-accent">
                UNDER ₹99
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Everyday basic tees & innerwear deals</p>
            </Link>

            <Link
              to="/price/under-199"
              className="group rounded-2xl bg-card border border-border p-6 hover:border-accent hover:shadow-lg transition-all text-center"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-black text-xs mb-2">
                BEST VALUE
              </span>
              <h3 className="text-2xl font-black font-display text-foreground group-hover:text-accent">
                UNDER ₹199
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Graphic tees, kids wear & printed tops</p>
            </Link>

            <Link
              to="/price/under-299"
              className="group rounded-2xl bg-card border border-border p-6 hover:border-accent hover:shadow-lg transition-all text-center"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-black text-xs mb-2">
                TOP DEALS
              </span>
              <h3 className="text-2xl font-black font-display text-foreground group-hover:text-accent">
                UNDER ₹299
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Premium joggers, casual shirts & gifts</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Personalized Gifts Spotlight */}
      {personalizedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-accent" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-foreground">
                  Custom Photo Gifts & Scrapbooks
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload your photos & messages — handcrafted for anniversaries & birthdays
                </p>
              </div>
            </div>
            <Link to="/categories/custom-gifts" className="text-xs sm:text-sm font-extrabold text-accent flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {personalizedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Trending / Best Sellers Rail */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-foreground">Trending Products</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Hot-selling branded fashion & trending picks</p>
          </div>
          <Link to="/categories/all" className="text-xs sm:text-sm font-extrabold text-accent flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Why Yoventra Guarantees */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <ShieldCheck className="h-8 w-8 text-accent shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground">100% Authentic</h4>
              <p className="text-[11px] text-muted-foreground">Original branded clothes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <Truck className="h-8 w-8 text-accent shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground">Delhivery Express</h4>
              <p className="text-[11px] text-muted-foreground">Fast All-India shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <Tag className="h-8 w-8 text-accent shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground">Outlet Discounts</h4>
              <p className="text-[11px] text-muted-foreground">Up to 80% off daily</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <RotateCcw className="h-8 w-8 text-accent shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground">Easy Returns</h4>
              <p className="text-[11px] text-muted-foreground">Hassle-free replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-black text-accent uppercase tracking-wider">Help & Support</span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-foreground mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl bg-card border border-border overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-foreground hover:bg-secondary/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-accent' : 'text-muted-foreground'}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-background/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
