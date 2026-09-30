import { Check, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

const TONES = {
  neutral: 'bg-secondary text-muted-foreground',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  accent: 'bg-accent/10 text-accent',
};

export function Badge({ tone = 'neutral', children, title }) {
  return (
    <span title={title} className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${TONES[tone] ?? TONES.neutral}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ meta, value }) {
  const m = meta[value];
  if (!m) return <Badge>{value}</Badge>;
  return (
    <Badge tone={m.tone} title={m.hint}>
      {m.label}
    </Badge>
  );
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ title, action, subtitle }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, highlight = false }) {
  return (
    <Card className={`p-5 ${highlight ? 'border-accent/40 bg-accent/5' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-accent" /> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-black text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-foreground',
  accent: 'bg-accent text-accent-foreground hover:opacity-90',
  outline: 'border border-border bg-card text-foreground hover:bg-secondary',
  ghost: 'text-foreground hover:bg-secondary',
};

export function Button({ variant = 'primary', className = '', loading = false, children, disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

const fieldBase =
  'w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground';

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-foreground">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${fieldBase} min-h-20 resize-y ${className}`} {...props} />;
}

export function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className={`px-3 py-2 ${className}`}
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

export function Alert({ tone = 'danger', children }) {
  return <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${TONES[tone]}`}>{children}</div>;
}

export function Loading() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-semibold text-danger">{error?.message ?? 'Could not load this page.'}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center">
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** Horizontally scrollable table on small screens. */
export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`border-b border-border px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }) {
  return <td className={`border-b border-border px-5 py-3.5 align-middle text-foreground ${className}`}>{children}</td>;
}

export function Pager({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        <Button variant="outline" className="px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" className="px-3 py-1.5 text-xs" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
