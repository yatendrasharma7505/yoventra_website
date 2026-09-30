import { Link } from 'react-router-dom';

/** Centered shell for the public influencer pages (login / register): brand on
 * top, form card in the middle. */
export function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10 sm:py-14">
      <Link to="/" className="flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Yoventra" className="h-16 w-16 object-contain" />
        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">Yoventra</span>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">Influencer Program</span>
      </Link>

      <main className={`mt-8 w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Yoventra</p>
      </main>
    </div>
  );
}
