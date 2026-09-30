import { Link } from 'react-router-dom';
import { fmtDate, inr, payoutStatusMeta, useApi } from '../format';
import { Card, CardHeader, EmptyState, ErrorState, Loading, StatusBadge, Table, Td, Th } from '../ui';

export function InfluencerPayouts() {
  const { data, loading, error, reload } = useApi('/me/payouts');
  const { data: me } = useApi('/me');

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  const d = me?.payoutDetails ?? {};
  const hasDetails = !!(d.upiId || d.accountNumber);

  return (
    <div className="space-y-6">
      {me && !hasDetails ? (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Add your UPI ID or bank details in{' '}
          <Link to="/influencer/profile" className="underline">
            My Profile
          </Link>{' '}
          so Yoventra can send your payouts.
        </div>
      ) : null}

      <Card>
        <CardHeader title="Payment history" subtitle="Payments Yoventra has sent you. They add up to your Paid amount." />
        {!data.length ? (
          <EmptyState title="No payments yet" description="When Yoventra pays your commission, the payment will appear here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Payment ID</Th>
                <Th>Date</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
                <Th>Reference</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <Td className="font-mono text-xs font-bold">{p.payoutNumber}</Td>
                  <Td className="whitespace-nowrap text-xs">
                    {fmtDate(p.createdAt)}
                    {p.paidAt ? <p className="text-muted-foreground">Paid {fmtDate(p.paidAt)}</p> : null}
                  </Td>
                  <Td className="text-right font-bold">{inr(p.amount)}</Td>
                  <Td>
                    <StatusBadge meta={payoutStatusMeta} value={p.status} />
                  </Td>
                  <Td className="font-mono text-xs">{p.transactionReference ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
