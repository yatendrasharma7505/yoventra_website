import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/delete-account', label: 'Delete Account' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Yoventra" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-wide text-foreground">YOVENTRA</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
