import { useState } from 'react';
import { inr, useApi } from '../format';
import { Card, CardHeader, ErrorState, Loading, StatCard } from '../ui';

const RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '3 Months' },
  { value: 'all', label: 'All Time' },
];

const compact = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${Math.round(n)}`);

/** Rounds the axis top up so its 4 gridline steps land on 1/2/5 × 10ⁿ values. */
function niceAxisMax(max) {
  if (max <= 0) return 100;
  const rawStep = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep);
  return step * 4;
}

/** Dependency-free bar chart of commission per bucket; hover/tap a bar for details. */
function EarningsChart({ series }) {
  const [active, setActive] = useState(null);
  const niceMax = niceAxisMax(Math.max(...series.map((s) => s.commission), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);
  const labelEvery = Math.ceil(series.length / 8);
  const shown = active != null ? series[active] : null;

  return (
    <div>
      <div className="mb-3 h-10 text-sm">
        {shown ? (
          <p>
            <span className="font-bold text-foreground">{shown.label}</span>
            <span className="text-muted-foreground">
              {' '}
              · {shown.orders} orders · {shown.products} products ·{' '}
            </span>
            <span className="font-bold text-accent">Earned {inr(shown.commission)}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Hover or tap a bar to see details.</p>
        )}
      </div>
      <div className="flex h-56 gap-2">
        <div className="flex flex-col justify-between pb-6 text-right text-[10px] text-muted-foreground">
          {[...ticks].reverse().map((t) => (
            <span key={t}>{compact(t)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="border-t border-border" />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[3px] sm:gap-1.5">
            {series.map((s, i) => (
              <button
                key={s.label + i}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group flex h-full flex-1 items-end"
                aria-label={`${s.label}: earned ${inr(s.commission)}`}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${active === i ? 'bg-foreground' : 'bg-accent group-hover:bg-foreground'}`}
                  style={{ height: `${niceMax ? Math.max((s.commission / niceMax) * 100, s.commission > 0 ? 2 : 0) : 0}%` }}
                />
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-5 gap-[3px] sm:gap-1.5">
            {series.map((s, i) => (
              <span key={s.label + i} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
                {i % labelEvery === 0 ? s.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfluencerEarnings() {
  const [range, setRange] = useState('30d');
  const { data, loading, error, reload } = useApi(`/me/earnings?range=${range}`);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  const s = data.summary;
  const periodTotal = data.series.reduce((sum, b) => sum + b.commission, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total sales" value={s.productsSold.toLocaleString('en-IN')} hint="Products sold" />
        <StatCard label="Total earnings" value={inr(s.totalCommission)} highlight />
        <StatCard label="Paid amount" value={inr(s.paidAmount)} />
        <StatCard label="Cancelled / returned" value={inr(s.cancelledCommission)} hint={`${s.cancelledOrders + s.returnedOrders} orders`} />
      </div>

      <Card>
        <CardHeader
          title="Earnings"
          subtitle={`${inr(periodTotal)} earned in this period`}
          action={
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRange(r.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    range === r.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          }
        />
        <div className={`p-5 ${loading ? 'opacity-60' : ''}`}>
          <EarningsChart series={data.series} />
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Earnings count once an order is shipped. The chart shows earned commission by order date; pending, cancelled and returned orders are
        not included.
      </p>
    </div>
  );
}
