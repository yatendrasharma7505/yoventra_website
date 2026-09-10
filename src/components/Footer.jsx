import { Link } from 'react-router-dom';
import { Download, Mail, ShieldCheck, Truck, RotateCcw, Heart, Sparkles } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.user.yoventra';

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      {/* Guarantees Bar */}
      <div className="border-b border-primary-foreground/10 bg-primary/80 py-8 px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-primary-foreground">100% Original Brands</h4>
              <p className="text-xs text-primary-foreground/70">Verified authentic readymade wear</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-primary-foreground">Up to 80% Discount</h4>
              <p className="text-xs text-primary-foreground/70">Direct outlet wholesale rates</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-primary-foreground">Fast Delhivery Logistics</h4>
              <p className="text-xs text-primary-foreground/70">Express doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-primary-foreground">Easy 5-Day Returns</h4>
              <p className="text-xs text-primary-foreground/70">Hassle-free refunds & exchange</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Yoventra" className="h-10 w-10 object-contain bg-white rounded-lg p-1" />
            <span className="text-2xl font-black tracking-tight font-display text-primary-foreground">
              YOVENTRA
            </span>
          </div>
          <p className="text-xs leading-relaxed text-primary-foreground/70">
            Yoventra is India's leading readymade clothing outlet shopping platform. Get 100% original, high-street branded apparel at unbeatable budget prices.
          </p>
          <div className="pt-2">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-md transition-all hover:bg-accent/90"
            >
              <Download className="w-4 h-4" />
              <span>Get Android App</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-primary-foreground uppercase tracking-wider font-display">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs text-primary-foreground/75 font-medium">
            <li>
              <a href="#why-yoventra" className="hover:text-accent transition-colors">Why Choose Yoventra</a>
            </li>
            <li>
              <a href="#app-features" className="hover:text-accent transition-colors">Yoventra App Features</a>
            </li>
            <li>
              <a href="#collections" className="hover:text-accent transition-colors">Outlet Collections</a>
            </li>
            <li>
              <a href="#faq" className="hover:text-accent transition-colors">Frequently Asked Questions</a>
            </li>
          </ul>
        </div>

        {/* Legal & Policy */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-primary-foreground uppercase tracking-wider font-display">
            Legal & Support
          </h4>
          <ul className="space-y-2 text-xs text-primary-foreground/75 font-medium">
            <li>
              <Link to="/privacy-policy" className="hover:text-accent transition-colors font-bold underline decoration-accent/50 underline-offset-4">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/delete-account" className="hover:text-accent transition-colors font-bold underline decoration-accent/50 underline-offset-4">
                Delete Account Request
              </Link>
            </li>
            <li className="pt-1">
              <span className="text-primary-foreground/50 text-[11px] block">Need help with an order?</span>
              <a href="mailto:pk0471721@gmail.com" className="text-accent hover:underline font-semibold flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>pk0471721@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Play Store App Card */}
        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
          <h4 className="font-bold text-sm text-primary-foreground font-display">
            Download Mobile App
          </h4>
          <p className="text-xs text-primary-foreground/70 leading-relaxed">
            Install the Yoventra app on your Android device to unlock exclusive discount coupons & instant checkout.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white text-gray-900 p-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
          >
            <img src="/logo.png" alt="App Logo" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">AVAILABLE ON</p>
              <p className="text-xs font-black text-gray-900">Google Play Store</p>
            </div>
          </a>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60 px-4 flex flex-col sm:flex-row items-center justify-between mx-auto max-w-7xl gap-2">
        <p>© {new Date().getFullYear()} Yoventra. All rights reserved. 100% Authentic Readymade Fashion.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-accent fill-accent" /> for Smart Shoppers
        </p>
      </div>
    </footer>
  );
}
