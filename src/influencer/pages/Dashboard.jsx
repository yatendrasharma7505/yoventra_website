import { CheckCircle2, IndianRupee, ShoppingBag, TicketPercent, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { commissionLabel, commissionStatusMeta, discountLabel, fmtDate, inr, useApi } from '../format';
import { Card, CardHeader, CopyButton, EmptyState, ErrorState, Loading, StatCard, StatusBadge, Table, Td, Th } from '../ui';

export function InfluencerDashboard() {
  const { data, loading, error, reload } = useApi('/me/summary');

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  const coupon = data.coupon;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground/70">My coupon</p>
            <p className="mt-1 font-mono text-3xl font-black tracking-wider">{coupon?.code ?? '—'}</p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {discountLabel(coupon)} for your followers · You earn {commissionLabel(data.commissionType, data.commissionValue)}
            </p>
          </div>
          {coupon ? <CopyButton text={coupon.code} label="Copy code" className="self-start sm:self-auto" /> : null}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Coupon uses" value={data.couponUses.toLocaleString('en-IN')} icon={TicketPercent} />
        <StatCard label="Total sales" value={data.productsSold.toLocaleString('en-IN')} icon={ShoppingBag} hint="Products sold" />
        <StatCard label="Total earnings" value={inr(data.totalCommission)} icon={IndianRupee} highlight />
        <StatCard label="Paid amount" value={inr(data.paidAmount)} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader
          title="Recent orders"
          action={
            <Link to="/influencer/orders" className="text-sm font-bold text-accent hover:underline">
              View all →
            </Link>
          }
        />
        {!data.recentOrders.length ? (
          <EmptyState title="No orders yet" description="Share your coupon code — orders placed with it will show up here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th className="text-right">Products</Th>
                <Th className="text-right">Commission</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.orderId}>
                  <Td className="font-mono text-xs font-bold">{o.orderNumber}</Td>
                  <Td className="text-xs">{fmtDate(o.placedAt)}</Td>
                  <Td className="text-right">{o.products}</Td>
                  <Td className="text-right font-bold">{inr(o.commissionAmount)}</Td>
                  <Td>
                    <StatusBadge meta={commissionStatusMeta} value={o.commissionStatus} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Commission counts towards your earnings once the order is shipped. Payments from Yoventra appear under Paid amount.
      </p>
    </div>
  );
}
