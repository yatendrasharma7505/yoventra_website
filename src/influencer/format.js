import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export const inr = (n) => `₹${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function fmtDate(iso, withTime = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

/** Coupons with no end date are stored as 2099-12-31. */
export const isOpenEnded = (iso) => !!iso && new Date(iso).getFullYear() >= 2099;

export function discountLabel(c) {
  if (!c) return '—';
  if (c.discountType === 'percent') return `${c.discountValue}% OFF${c.maxDiscountCap ? ` (up to ${inr(c.maxDiscountCap)})` : ''}`;
  return `${inr(c.discountValue)} OFF`;
}

export function commissionLabel(type, value) {
  if (type == null || value == null) return '—';
  return type === 'percent' ? `${value}% per order` : `${inr(value)} per order`;
}

export const orderStatusMeta = {
  newOrder: { label: 'Placed', tone: 'neutral' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const commissionStatusMeta = {
  pending: { label: 'Pending', tone: 'warning', hint: 'Not shipped yet — not counted in your earnings' },
  earned: { label: 'Earned', tone: 'success', hint: 'Shipped — counted in your earnings' },
  cancelled: { label: 'Cancelled', tone: 'danger', hint: 'Order cancelled or refunded — no commission' },
  reversed: { label: 'Returned', tone: 'danger', hint: 'Order returned — no commission' },
};

export const payoutStatusMeta = {
  pending: { label: 'Pending', tone: 'warning' },
  processing: { label: 'Processing', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

export const couponStatusMeta = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  expired: { label: 'Expired', tone: 'danger' },
  disabled: { label: 'Disabled', tone: 'neutral' },
};

/** GETs an influencer endpoint and re-runs whenever `path` changes. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })));
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
