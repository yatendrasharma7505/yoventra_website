import { useState } from 'react';
import {
  Download,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ShoppingBag,
  Percent,
  Lock,
  ArrowRight,
  Heart,
  Users,
  Sparkles,
} from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.user.yoventra';

export function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const appCategories = [
    { name: 'Jogger', desc: 'Comfortable & stylish joggers', tag: 'Trending' },
    { name: 'Kids', desc: 'Sweatshirts, tees & jeans for kids', tag: 'Top Picks' },
    { name: 'Men', desc: 'Shirts, tees & casual wear for men', tag: 'Popular' },
    { name: 'Printed Tshirt', desc: 'Cool graphic & typography tees', tag: 'Best Seller' },
    { name: 'Tshirt', desc: 'Classic round neck & oversized tees', tag: 'Everyday' },
    { name: 'Women', desc: 'Tops, dresses & western wear', tag: 'Hot Deals' },
  ];

  const budgetPicks = [
    { label: 'UNDER ₹99', desc: 'Everyday basic tees & innerwear deals', discount: 'Flat Discount' },
    { label: 'UNDER ₹199', desc: 'Graphic t-shirts, kids wear & printed tees', discount: 'Best Value' },
    { label: 'UNDER ₹299', desc: 'Premium joggers, casual shirts & western wear', discount: 'Top Deals' },
  ];

  const appFeatures = [
    {
      icon: Smartphone,
      title: 'Seamless OTP Login',
      desc: 'Sign in instantly with your phone number — no passwords or long forms.',
    },
    {
      icon: Percent,
      title: 'Outlet-Level Discounts',
      desc: 'Original readymade branded clothing at heavy outlet discounts, every day.',
    },
    {
      icon: Truck,
      title: 'Fast All-India Shipping',
      desc: 'Powered by Delhivery logistics with real-time order tracking in-app.',
    },
    {
      icon: Lock,
      title: 'COD & Secure Payments',
      desc: 'Pay via UPI, cards or NetBanking through Razorpay, or choose Cash on Delivery.',
    },
    {
      icon: Heart,
      title: 'Wishlist & Fast Cart',
      desc: 'Save favourites and check out in seconds with saved addresses.',
    },
    {
      icon: RotateCcw,
      title: '5-Day Easy Returns',
      desc: 'Hassle-free 5-day return window if sizing or quality falls short.',
    },
  ];

  const faqs = [
    {
      q: 'What is Yoventra and how are clothing prices so low?',
      a: 'Yoventra is an online fashion marketplace app where you can buy 100% authentic, original branded ready-to-wear clothing at heavy discounts. We work with trusted sellers and brand outlets to pass direct savings on to you.',
    },
    {
      q: 'Are all clothing products on Yoventra 100% original brands?',
      a: 'Yes. Every garment listed on Yoventra is genuine, original readymade apparel — we strictly prohibit counterfeits or replicas.',
    },
    {
      q: 'Does Yoventra offer custom clothes or tailor-made stitching?',
      a: 'No. Yoventra deals strictly in ready-to-wear garments in standard sizing (S, M, L, XL, XXL). We do not offer custom fabric or tailoring.',
    },
    {
      q: 'What is Yoventra’s return policy?',
      a: 'We offer a hassle-free 5-Day return policy. If you have any sizing or quality issues, you can initiate a return directly from the app within 5 days of delivery.',
    },
    {
      q: 'How can I download the Yoventra app?',
      a: "You can download the Yoventra Android app from the Google Play Store by searching for 'Yoventra' or using the download links on this page.",
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support Cash on Delivery (COD) and 100% secure online payment (UPI, cards, NetBanking) via Razorpay.',
    },
    {
      q: 'How long does shipping take, and who delivers?',
      a: 'Orders ship via the Delhivery logistics network. Most orders across India arrive within 3 to 6 business days, with real-time tracking in the app.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* HERO SECTION */}
      <section className="pt-8 sm:pt-16 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Your Style, Your Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-display leading-[1.08]">
                Discover Trendy Fashion at{' '}
                <span className="text-accent underline decoration-accent/30 underline-offset-8">
                  Unbeatable Prices
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Shop 100% authentic readymade clothing from trusted sellers all in one place. Best prices on joggers, printed t-shirts, men's & women's wear, and kids fashion.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 pt-1">
                {['Top Categories', 'Premium Quality', 'Trusted Sellers', 'Best Prices'].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-bold text-foreground shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" /> {label}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto rounded-2xl bg-primary px-7 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5 text-accent" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] uppercase font-semibold text-primary-foreground/70 tracking-wider">Get App on</p>
                    <p className="text-base font-extrabold">Google Play Store</p>
                  </div>
                </a>

                <a
                  href="#why-yoventra"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-border bg-card px-6 py-4 text-base font-bold text-foreground transition-all hover:bg-secondary"
                >
                  <span>Explore Yoventra</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Guarantees Bar */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-success" /> 100% Genuine
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-accent" /> 5-Day Easy Returns
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-foreground" /> Delhivery Shipping
                </span>
              </div>
            </div>

            {/* Hero Right Visual — User's App Promo Image 1 */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-md rounded-3xl p-2 bg-gradient-to-b from-card via-secondary/40 to-card border border-border shadow-2xl overflow-hidden group">
                <img
                  src="/app-promo-1.png"
                  alt="Yoventra App Promo — Your Style, Your Marketplace"
                  className="rounded-2xl w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-y border-border py-6">
          {[
            { icon: ShieldCheck, label: '100% Original Quality' },
            { icon: Percent, label: 'Best Deals Everyday' },
            { icon: Truck, label: 'Fast Delhivery Shipping' },
            { icon: RotateCcw, label: '5-Day Easy Returns' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0 text-accent" />
              <span className="text-xs sm:text-sm font-extrabold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHY YOVENTRA SECTION */}
      <section id="why-yoventra" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">What is Yoventra?</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
            Shop Smart. Shop Yoventra.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
            Yoventra connects you with trusted sellers to bring you 100% original, ready-to-wear fashion at unbeatable budget prices. From joggers to printed t-shirts and kids wear, discover everything in one app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Tag, title: 'Top Categories & Brands', desc: 'Explore a rich catalog of readymade garments for Men, Women, and Kids.' },
            { icon: Percent, title: 'Best Prices & Budget Picks', desc: 'Exclusive deals starting under ₹99, ₹199, and ₹299 with direct savings.' },
            { icon: ShoppingBag, title: 'Strictly Readymade Garments', desc: 'Standard pre-stitched sizes (S–XXL), ready to wear immediately. No custom tailoring.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card p-6 rounded-2xl border border-border space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-primary text-accent flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY PRICE / BUDGET PICKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card rounded-3xl p-8 sm:p-10 border border-border shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-extrabold text-brand-red uppercase tracking-wider">BUDGET PICKS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">Shop by Price</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Find amazing readymade fashion tailored to your exact budget.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {budgetPicks.map((pick, idx) => (
              <a
                key={idx}
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-secondary/60 hover:bg-secondary p-6 rounded-2xl border border-border text-center space-y-3 transition-all hover:shadow-md"
              >
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {pick.discount}
                </span>
                <h3 className="text-2xl font-black text-foreground font-display group-hover:text-accent transition-colors">
                  {pick.label}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">{pick.desc}</p>
                <div className="pt-2 text-xs font-bold text-foreground flex items-center justify-center gap-1">
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SHOWCASE WITH USER PROMO IMAGE 2 */}
      <section id="collections" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left App Promo Image 2 */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div className="relative max-w-md rounded-3xl p-2 bg-gradient-to-b from-card via-secondary/40 to-card border border-border shadow-2xl overflow-hidden group">
              <img
                src="/app-promo-2.png"
                alt="Yoventra App Categories Showcase"
                className="rounded-2xl w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>

          {/* Right Categories Grid */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div>
              <span className="text-xs font-extrabold text-accent uppercase tracking-wider">EXPLORE TOP CATEGORIES</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight mt-1">
                Find Everything You Love in One Place
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">
                Browse our wide selection of readymade apparel for Joggers, Kids, Men, Printed T-Shirts, T-Shirts, and Women's wear.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appCategories.map((cat, idx) => (
                <a
                  key={idx}
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card rounded-2xl border border-border p-4 flex items-center justify-between hover:border-accent transition-all shadow-xs"
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider">{cat.tag}</span>
                    <h3 className="font-bold text-foreground text-base group-hover:text-accent transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
                </a>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent transition-colors"
              >
                <span>Browse All Categories in App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* APP SHOWCASE & FEATURES */}
      <section id="app-features" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 sm:p-14 shadow-xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Built for Fast & Easy Shopping</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-primary-foreground">
              Everything You Need in the Yoventra App
            </h2>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Download the Yoventra app for Android to browse thousands of branded apparel items, manage orders, track shipments live via Delhivery, and collect exclusive discounts!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appFeatures.map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-primary-foreground">{title}</h4>
                <p className="text-xs text-primary-foreground/65 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-10 text-center">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl bg-accent px-8 py-4 text-sm font-extrabold text-accent-foreground transition-transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Download Yoventra App Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* DOWNLOAD APP CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card rounded-3xl p-8 sm:p-12 border border-border flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-xs">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
              Ready to Upgrade Your Wardrobe for Less?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Install the official Yoventra app on Google Play Store today. Shop authentic readymade clothing at best prices with fast Delhivery shipping and 5-Day Easy Returns!
            </p>
          </div>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-extrabold text-sm shrink-0 transition-transform hover:scale-105 shadow-lg"
          >
            <Download className="w-5 h-5 text-accent" />
            <span>Install from Play Store</span>
          </a>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-foreground text-sm sm:text-base hover:bg-secondary/50 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-foreground' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
