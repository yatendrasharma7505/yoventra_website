import { useState } from 'react';
import { commissionStatusMeta, fmtDate, inr, orderStatusMeta, useApi } from '../format';
import { Card, CardHeader, EmptyState, ErrorState, Loading, Pager, StatusBadge, Table, Td, Th } from '../ui';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'earned', label: 'Earned' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'reversed', label: 'Returned' },
];

export function InfluencerOrders() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, loading, error, reload } = useApi(`/me/orders?commissionStatus=${filter}&page=${page}&pageSize=${pageSize}`);

  return (
    <Card>
      <CardHeader title="Orders with your coupon" subtitle="Commission shown is fixed at the rate in effect when each order was placed." />
      <div className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <div className="p-5">
          <ErrorState error={error} onRetry={reload} />
        </div>
      ) : !data.items.length ? (
        <EmptyState title="No orders here yet" description="Orders placed with your coupon code will appear in this list." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th className="text-right">Products</Th>
                <Th className="text-right">Commission</Th>
                <Th>Order status</Th>
                <Th>Commission status</Th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-60' : ''}>
              {data.items.map((o) => (
                <tr key={o.orderId}>
                  <Td className="font-mono text-xs font-bold">{o.orderNumber}</Td>
                  <Td className="whitespace-nowrap text-xs">{fmtDate(o.placedAt)}</Td>
                  <Td className="text-right">{o.products}</Td>
                  <Td className="text-right">
                    <p className="font-bold">{inr(o.commissionAmount)}</p>
                    <p className="text-[11px] text-muted-foreground">{o.commissionType === 'percent' ? `${o.commissionValue}%` : 'fixed'}</p>
                  </Td>
                  <Td>
                    <StatusBadge meta={orderStatusMeta} value={o.orderStatus} />
                  </Td>
                  <Td>
                    <StatusBadge meta={commissionStatusMeta} value={o.commissionStatus} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pager page={page} pageSize={pageSize} total={data.total} onChange={setPage} />
        </>
      )}
    </Card>
  );
}
