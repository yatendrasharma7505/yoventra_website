import { FileText, IndianRupee, LayoutDashboard, LogOut, Menu, Package, TicketPercent, User, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useInfluencerAuth } from '../AuthContext';
import { Loading } from '../ui';
import { ChangePasswordForm } from './Profile';

const NAV = [
  { to: '/influencer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/influencer/coupon', label: 'My Coupon', icon: TicketPercent },
  { to: '/influencer/orders', label: 'Orders', icon: Package },
  { to: '/influencer/earnings', label: 'Earnings', icon: IndianRupee },
  { to: '/influencer/payouts', label: 'Payouts', icon: Wallet },
  { to: '/influencer/profile', label: 'My Profile', icon: User },
  { to: '/influencer/dashboard-terms', label: 'Terms & Conditions', icon: FileText },
];

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <img src="/logo.png" alt="Yoventra" className="h-9 w-9 object-contain" />
        <div>
          <p className="font-display text-base font-extrabold text-foreground">Yoventra</p>
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent">Influencer</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-danger transition-colors hover:bg-danger-bg"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const { influencer, loading, logout } = useInfluencerAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  if (loading) return <Loading />;
  if (!influencer) return <Navigate to="/influencer/login" replace />;

  const title = NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Dashboard';
  const handleLogout = () => logout();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-nav sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-border bg-card p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{influencer.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{influencer.influencerCode}</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          {influencer.mustChangePassword ? (
            <div className="mx-auto max-w-md">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-black text-foreground">Set your password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You’re using a temporary password from Yoventra. Choose your own password to open your dashboard.
                </p>
                <div className="mt-5">
                  <ChangePasswordForm />
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
