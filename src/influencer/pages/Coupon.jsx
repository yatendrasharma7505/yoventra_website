import { Share2 } from 'lucide-react';
import { commissionLabel, couponStatusMeta, discountLabel, fmtDate, inr, isOpenEnded, useApi } from '../format';
import { Button, Card, CardHeader, CopyButton, ErrorState, Loading, StatusBadge } from '../ui';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-foreground">{children}</span>
    </div>
  );
}

export function InfluencerCoupon() {
  const { data: c, loading, error, reload } = useApi('/me/coupon');

  if (loading && !c) return <Loading />;
  if (error && !c) return <ErrorState error={error} onRetry={reload} />;

  const shareText = `Use my code ${c.code} for ${discountLabel(c)} on Yoventra!`;
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="overflow-hidden lg:col-span-2">
        <div className="flex flex-col items-center gap-3 bg-primary px-6 py-10 text-center text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">Your coupon code</p>
          <p className="rounded-xl border-2 border-dashed border-accent px-6 py-3 font-mono text-3xl font-black tracking-widest sm:text-4xl">{c.code}</p>
          <p className="text-lg font-bold text-accent">{discountLabel(c)}</p>
          <StatusBadge meta={couponStatusMeta} value={c.status} />
        </div>
        <div className="flex flex-wrap justify-center gap-2 p-5">
          <CopyButton text={c.code} label="Copy code" />
          <CopyButton text={shareText} label="Copy message" />
          {canShare ? (
            <Button variant="outline" className="px-3 py-2" onClick={() => navigator.share({ text: shareText }).catch(() => undefined)}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="Coupon details" />
        <div className="px-5 py-2">
          <Row label="Customer discount">{discountLabel(c)}</Row>
          <Row label="Minimum order value">{c.minOrderValue ? inr(c.minOrderValue) : 'No minimum'}</Row>
          <Row label="Total uses">{c.totalUses.toLocaleString('en-IN')}</Row>
          <Row label="Usage limit">{c.usageLimit ? `${c.usageLimit} uses (${c.remainingUses} left)` : 'Unlimited'}</Row>
          <Row label="Uses per customer">{c.usageLimitPerUser ?? 'Unlimited'}</Row>
          <Row label="Valid from">{fmtDate(c.validFrom)}</Row>
          <Row label="Valid until">{isOpenEnded(c.validUntil) ? 'No end date' : fmtDate(c.validUntil)}</Row>
          <Row label="Your commission">{commissionLabel(c.commissionType, c.commissionValue)}</Row>
        </div>
        <div className="mx-5 mb-5 rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-bold text-foreground">Coupon terms</p>
          The code is for genuine customer purchases only — using it on your own orders, with fake accounts or for artificial transactions isn’t
          allowed. A usage limit is the number of times the code can be used, not a rupee value. Cancelled, refunded or returned orders don’t earn
          commission.
        </div>
      </Card>
    </div>
  );
}
