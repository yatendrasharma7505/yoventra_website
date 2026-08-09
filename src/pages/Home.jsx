import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 text-center">
      <img src="/logo.png" alt="Yoventra" className="mx-auto h-32 w-32 object-contain" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Yoventra</h1>
      <p className="mt-2 text-muted-foreground">Style. Quality. You.</p>

      <div className="mx-auto mt-10 grid max-w-md gap-4 sm:grid-cols-2">
        <Link
          to="/privacy-policy"
          className="rounded-lg border border-border bg-card px-5 py-4 font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          Privacy Policy
        </Link>
        <Link
          to="/delete-account"
          className="rounded-lg border border-border bg-card px-5 py-4 font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          Delete Account
        </Link>
      </div>
    </div>
  );
}
