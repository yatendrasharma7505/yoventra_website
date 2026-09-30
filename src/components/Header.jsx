import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.user.yoventra';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { label: 'Home', href: isHomePage ? '#' : '/' },
    { label: 'Why Yoventra', href: isHomePage ? '#why-yoventra' : '/#why-yoventra' },
    { label: 'Categories', href: isHomePage ? '#collections' : '/#collections' },
    { label: 'App Features', href: isHomePage ? '#app-features' : '/#app-features' },
    { label: 'FAQ', href: isHomePage ? '#faq' : '/#faq' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Delete Account', to: '/delete-account' },
    { label: 'Influencers', to: '/influencer/login' },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-border">
      {/* Top Ticker */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[11px] sm:text-xs font-semibold tracking-wide">
        100% Original Branded Clothing · Outlet Prices Up To 80% Off
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Yoventra"
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
          />
          <span className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-foreground">
            Yoventra
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          {navLinks.map((link, idx) => {
            const isActive = link.to ? location.pathname === link.to : false;
            if (link.to) {
              return (
                <Link
                  key={idx}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={idx}
                href={link.href}
                className="px-3 py-2 rounded-lg transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-foreground"
          >
            <Download className="w-4 h-4" />
            <span>Get the App</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-border bg-card text-foreground hover:bg-secondary focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link, idx) => {
            if (link.to) {
              return (
                <Link
                  key={idx}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-semibold text-foreground hover:bg-secondary"
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-2">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-center"
            >
              <Download className="w-5 h-5" />
              <span>Download Yoventra App</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
